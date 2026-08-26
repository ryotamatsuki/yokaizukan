(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mapDebug') !== '1' && params.get('geoDebug') !== '1') return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ANCHOR_PATH = 'public/data/ehime_municipality_anchors.json';
  const GEOJSON_PATH = 'public/data/geo/ehime-municipalities.geojson';
  const VIEWBOX = { width: 1000, height: 760, padding: 42 };

  let datasetPromise = null;
  let renderPromise = null;

  document.documentElement.classList.add('ehime-map-debug-mode');
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const map = document.querySelector('#ehimeMap');
    if (!map) return;

    const observer = new MutationObserver(() => {
      if (!map.querySelector(':scope > .ehime-geo-debug')) scheduleRender();
    });
    observer.observe(map, { childList: true });
    scheduleRender();
  }

  function scheduleRender() {
    window.clearTimeout(scheduleRender.timer);
    scheduleRender.timer = window.setTimeout(() => void ensureDebugMap(), 40);
  }

  async function ensureDebugMap() {
    const map = document.querySelector('#ehimeMap');
    if (!map || map.dataset.debugRendering === 'true') return;
    if (map.querySelector(':scope > .ehime-geo-debug')) return;
    if (renderPromise) return renderPromise;

    map.dataset.debugRendering = 'true';
    renderPromise = renderDebugMap(map)
      .catch((error) => renderError(map, error))
      .finally(() => {
        delete map.dataset.debugRendering;
        renderPromise = null;
      });
    return renderPromise;
  }

  async function loadDataset() {
    if (datasetPromise) return datasetPromise;

    datasetPromise = (async () => {
      const [anchorResponse, boundaryResponse] = await Promise.all([
        fetch(ANCHOR_PATH, { cache: 'force-cache' }),
        fetch(GEOJSON_PATH, { cache: 'force-cache' })
      ]);
      if (!anchorResponse.ok) throw new Error(`校正アンカーを読み込めませんでした (${anchorResponse.status})`);
      if (!boundaryResponse.ok) throw new Error(`N03行政区域を読み込めませんでした (${boundaryResponse.status})`);

      const [anchorData, geojson] = await Promise.all([anchorResponse.json(), boundaryResponse.json()]);
      const municipalities = Array.isArray(anchorData.municipalities) ? anchorData.municipalities : [];
      const features = Array.isArray(geojson.features) ? geojson.features : [];
      if (municipalities.length !== 20) throw new Error(`市町アンカーが20件ではありません (${municipalities.length})`);
      if (features.length !== 20) throw new Error(`N03市町境界が20件ではありません (${features.length})`);

      const featureByCode = new Map(features.map((feature) => [String(feature?.properties?.code ?? ''), feature]));
      municipalities.forEach((municipality) => {
        const feature = featureByCode.get(municipality.code);
        if (!feature) throw new Error(`${municipality.name} (${municipality.code}) のN03境界がありません`);
        if (feature?.properties?.name !== municipality.name) {
          throw new Error(`${municipality.code} の市町名が一致しません (${feature?.properties?.name} / ${municipality.name})`);
        }
      });

      return { anchorData, municipalities, geojson, featureByCode };
    })();

    return datasetPromise;
  }

  async function renderDebugMap(map) {
    const { municipalities, geojson, featureByCode } = await loadDataset();
    const projection = createProjection([geojson], VIEWBOX);

    const root = document.createElement('div');
    root.className = 'ehime-geo-debug';
    root.dataset.phase = 'A';
    root.dataset.geojsonSource = GEOJSON_PATH;
    root.dataset.municipalityCount = String(municipalities.length);

    const header = document.createElement('div');
    header.className = 'ehime-geo-debug__header';
    header.innerHTML = '<strong>Phase A 地理校正モード</strong><span>N03 2026の20市町行政区域と役所・役場アンカーを同じ投影で確認しています。</span>';

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('ehime-geo-debug__svg');
    svg.setAttribute('viewBox', `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '愛媛県20市町の行政区域と役所・役場の校正位置');

    const sea = document.createElementNS(SVG_NS, 'rect');
    sea.classList.add('ehime-geo-debug__sea');
    sea.setAttribute('x', '0');
    sea.setAttribute('y', '0');
    sea.setAttribute('width', String(VIEWBOX.width));
    sea.setAttribute('height', String(VIEWBOX.height));
    svg.appendChild(sea);

    const shapeLayer = document.createElementNS(SVG_NS, 'g');
    shapeLayer.classList.add('ehime-geo-debug__shapes');
    svg.appendChild(shapeLayer);

    const anchorLayer = document.createElementNS(SVG_NS, 'g');
    anchorLayer.classList.add('ehime-geo-debug__anchors');
    svg.appendChild(anchorLayer);

    const validation = [];
    municipalities.forEach((municipality, index) => {
      const feature = featureByCode.get(municipality.code);
      const featureCollection = { type: 'FeatureCollection', features: [feature] };
      const group = document.createElementNS(SVG_NS, 'g');
      group.classList.add('ehime-municipality-shape');
      group.dataset.municipalityCode = municipality.code;
      group.dataset.municipalityName = municipality.name;

      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', featureCollectionToPath(featureCollection, projection.projectPoint));
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = municipality.name;
      path.appendChild(title);
      group.appendChild(path);
      shapeLayer.appendChild(group);

      const point = projection.projectPoint(municipality.lng, municipality.lat);
      const inside = pointInFeatureCollection([municipality.lng, municipality.lat], featureCollection);
      validation.push({ municipality, inside, point });

      const anchorGroup = document.createElementNS(SVG_NS, 'g');
      anchorGroup.classList.add('ehime-hall-anchor');
      anchorGroup.dataset.municipalityCode = municipality.code;
      anchorGroup.dataset.anchorInside = String(inside);
      anchorGroup.dataset.projectedX = String(round(point.x));
      anchorGroup.dataset.projectedY = String(round(point.y));
      anchorGroup.setAttribute('transform', `translate(${round(point.x)}, ${round(point.y)})`);

      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('r', inside ? '6.5' : '9');
      const number = document.createElementNS(SVG_NS, 'text');
      number.setAttribute('x', '0');
      number.setAttribute('y', '3.2');
      number.setAttribute('text-anchor', 'middle');
      number.textContent = String(index + 1);
      const anchorTitle = document.createElementNS(SVG_NS, 'title');
      anchorTitle.textContent = `${municipality.office} (${municipality.lat}, ${municipality.lng})`;
      anchorGroup.append(circle, number, anchorTitle);
      anchorLayer.appendChild(anchorGroup);
    });

    const insideCount = validation.filter((item) => item.inside).length;
    const footer = document.createElement('p');
    footer.className = 'ehime-geo-debug__status';
    footer.dataset.insideCount = String(insideCount);
    footer.textContent = insideCount === 20
      ? '校正結果: 20/20の役所・役場アンカーが対応する市町区域内にあります。'
      : `校正結果: ${insideCount}/20。区域外アンカーは要確認です。`;

    root.append(header, svg, footer);
    map.replaceChildren(root);
    map.dataset.geographicSource = 'local-n03-2026';
    map.setAttribute('aria-label', 'Phase A 愛媛県20市町の地理校正マップ');
    renderDebugList(validation);
  }

  function renderDebugList(validation) {
    const list = document.querySelector('#mapLegendList');
    if (!list) return;
    list.innerHTML = '';
    list.classList.add('map-debug-list');

    validation.forEach(({ municipality, inside }, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'map-debug-list__item';
      button.dataset.municipalityCode = municipality.code;
      button.innerHTML = `<strong><span>${index + 1}</span>${escapeHtml(municipality.name)}</strong><small>${escapeHtml(municipality.office)} / ${inside ? '区域内' : '要確認'}</small>`;
      button.addEventListener('click', () => selectMunicipality(municipality.code));
      list.appendChild(button);
    });
  }

  function selectMunicipality(code) {
    document.querySelectorAll('[data-municipality-code]').forEach((node) => {
      node.classList.toggle('is-debug-selected', node.dataset.municipalityCode === code);
    });
  }

  function createProjection(featureCollections, { width, height, padding }) {
    const coordinates = [];
    featureCollections.forEach((collection) => {
      (collection.features || []).forEach((feature) => collectCoordinates(feature.geometry?.coordinates, coordinates));
    });
    if (coordinates.length === 0) throw new Error('行政区域の座標がありません。');

    let latitudeTotal = 0;
    coordinates.forEach((point) => { latitudeTotal += point[1]; });
    const meanLat = latitudeTotal / coordinates.length;
    const lonScale = Math.cos(meanLat * Math.PI / 180);
    let minX = Infinity;
    let maxX = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    coordinates.forEach(([lng, lat]) => {
      const x = lng * lonScale;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    const extentX = Math.max(maxX - minX, Number.EPSILON);
    const extentY = Math.max(maxLat - minLat, Number.EPSILON);
    const scale = Math.min((width - padding * 2) / extentX, (height - padding * 2) / extentY);
    const drawingWidth = extentX * scale;
    const drawingHeight = extentY * scale;
    const offsetX = (width - drawingWidth) / 2;
    const offsetY = (height - drawingHeight) / 2;

    const projectPoint = (lng, lat) => ({
      x: offsetX + (lng * lonScale - minX) * scale,
      y: offsetY + (maxLat - lat) * scale
    });

    return {
      projectPoint,
      geographicBounds: {
        west: minX / lonScale,
        east: maxX / lonScale,
        south: minLat,
        north: maxLat
      },
      displayPadding: padding
    };
  }

  function collectCoordinates(value, output) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
      output.push(value);
      return;
    }
    value.forEach((child) => collectCoordinates(child, output));
  }

  function featureCollectionToPath(collection, projectPoint) {
    return (collection.features || []).map((feature) => geometryToPath(feature.geometry, projectPoint)).filter(Boolean).join(' ');
  }

  function geometryToPath(geometry, projectPoint) {
    if (!geometry) return '';
    if (geometry.type === 'Polygon') return polygonToPath(geometry.coordinates, projectPoint);
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.map((polygon) => polygonToPath(polygon, projectPoint)).join(' ');
    return '';
  }

  function polygonToPath(polygon, projectPoint) {
    return polygon.map((ring) => ringToPath(ring, projectPoint)).join(' ');
  }

  function ringToPath(ring, projectPoint) {
    if (!Array.isArray(ring) || ring.length === 0) return '';
    return ring.map((coordinate, index) => {
      const point = projectPoint(coordinate[0], coordinate[1]);
      return `${index === 0 ? 'M' : 'L'}${round(point.x)} ${round(point.y)}`;
    }).join(' ') + ' Z';
  }

  function pointInFeatureCollection(point, collection) {
    return (collection.features || []).some((feature) => pointInGeometry(point, feature.geometry));
  }

  function pointInGeometry(point, geometry) {
    if (!geometry) return false;
    if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates);
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
    return false;
  }

  function pointInPolygon(point, polygon) {
    if (!polygon?.length || !pointInRing(point, polygon[0])) return false;
    return !polygon.slice(1).some((hole) => pointInRing(point, hole));
  }

  function pointInRing([x, y], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersects = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function renderError(map, error) {
    console.error('Ehime Phase A geographic debug failed.', error);
    const panel = document.createElement('div');
    panel.className = 'ehime-geo-debug ehime-geo-debug--error';
    panel.innerHTML = `<strong>Phase A 地理校正データを表示できませんでした。</strong><p>${escapeHtml(error?.message || String(error))}</p><p>通常表示は影響を受けません。ローカルのN03境界データと校正アンカーを確認してください。</p>`;
    map.replaceChildren(panel);
  }

  function round(value) {
    return Math.round(value * 100) / 100;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
