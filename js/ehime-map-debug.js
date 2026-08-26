(() => {
  const params = new URLSearchParams(window.location.search);
  const DEBUG_MODE = params.get('mapDebug') === '1' || params.get('geoDebug') === '1';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ANCHOR_PATH = 'public/data/ehime_municipality_anchors.json';
  const GEOJSON_PATH = 'public/data/geo/ehime-municipalities.geojson';
  const LOCATION_PATH = 'public/data/locations.json';
  const LEGEND_PATH = 'public/data/legends.json';
  const VIEWBOX = { width: 1000, height: 760, padding: 42 };
  const PRECISION_LABELS = {
    exact: '実地点',
    site: '史跡・施設地点',
    locality: '地域内の代表点',
    municipality: '市町域の代表点',
    regional: '伝承地域の代表点',
    broad_historical_area: '歴史的広域の代表点',
    marine: '海域伝承の代表点',
    multiple_locations: '複数伝承地の代表点'
  };

  let datasetPromise = null;
  let renderPromise = null;
  let normalObserver = null;

  document.documentElement.classList.toggle('ehime-map-debug-mode', DEBUG_MODE);
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const map = document.querySelector('#ehimeMap');
    if (!map) return;
    installPrecisionStyles();

    if (DEBUG_MODE) {
      const observer = new MutationObserver(() => {
        if (!map.querySelector(':scope > .ehime-geo-debug')) scheduleDebugRender();
      });
      observer.observe(map, { childList: true });
      scheduleDebugRender();
      return;
    }

    normalObserver = new MutationObserver(() => scheduleNormalProjection());
    normalObserver.observe(map, { childList: true, subtree: true });
    scheduleNormalProjection();
  }

  async function loadDataset() {
    if (datasetPromise) return datasetPromise;
    datasetPromise = (async () => {
      const [anchorResponse, boundaryResponse, locationResponse, legendResponse] = await Promise.all([
        fetch(ANCHOR_PATH, { cache: 'force-cache' }),
        fetch(GEOJSON_PATH, { cache: 'force-cache' }),
        fetch(LOCATION_PATH, { cache: 'no-cache' }),
        fetch(LEGEND_PATH, { cache: 'no-cache' })
      ]);
      for (const [response, label] of [[anchorResponse, '校正アンカー'], [boundaryResponse, 'N03行政区域'], [locationResponse, '伝承地点'], [legendResponse, '伝承一覧']]) {
        if (!response.ok) throw new Error(`${label}を読み込めませんでした (${response.status})`);
      }
      const [anchorData, geojson, locationData, legendData] = await Promise.all([
        anchorResponse.json(), boundaryResponse.json(), locationResponse.json(), legendResponse.json()
      ]);
      const municipalities = Array.isArray(anchorData.municipalities) ? anchorData.municipalities : [];
      const features = Array.isArray(geojson.features) ? geojson.features : [];
      const locations = Array.isArray(locationData.locations) ? locationData.locations : [];
      const legends = Array.isArray(legendData.legends) ? legendData.legends.filter((item) => item.displayInList !== false) : [];
      if (municipalities.length !== 20) throw new Error(`市町アンカーが20件ではありません (${municipalities.length})`);
      if (features.length !== 20) throw new Error(`N03市町境界が20件ではありません (${features.length})`);
      if (legends.length !== 11) throw new Error(`伝承が11件ではありません (${legends.length})`);
      const featureByCode = new Map(features.map((feature) => [String(feature?.properties?.code ?? ''), feature]));
      const locationById = new Map(locations.map((location) => [location.id, location]));
      municipalities.forEach((municipality) => {
        const feature = featureByCode.get(municipality.code);
        if (!feature) throw new Error(`${municipality.name} (${municipality.code}) のN03境界がありません`);
      });
      legends.forEach((legend) => {
        const location = locationById.get(legend.locationId);
        if (!location) throw new Error(`${legend.id}: location ${legend.locationId} がありません`);
        if (!PRECISION_LABELS[location.locationPrecision]) throw new Error(`${legend.id}: locationPrecision が不正です`);
        if (!resolvePoint(location)) throw new Error(`${legend.id}: 描画用地理座標がありません`);
      });
      return { municipalities, geojson, features, featureByCode, locations, locationById, legends };
    })();
    return datasetPromise;
  }

  function resolvePoint(location) {
    if (Number.isFinite(location?.lat) && Number.isFinite(location?.lng)) {
      return { lat: location.lat, lng: location.lng, coordinateRole: location.coordinateRole || 'exact' };
    }
    const point = location?.representativePoint;
    if (Number.isFinite(point?.lat) && Number.isFinite(point?.lng)) return point;
    return null;
  }

  function scheduleNormalProjection() {
    window.clearTimeout(scheduleNormalProjection.timer);
    scheduleNormalProjection.timer = window.setTimeout(() => void applyNormalProjection(), 20);
  }

  async function applyNormalProjection() {
    if (DEBUG_MODE) return;
    const map = document.querySelector('#ehimeMap');
    const markerLayer = map?.querySelector('.generated-map-marker-layer');
    const markers = markerLayer ? Array.from(markerLayer.querySelectorAll('.map-marker')) : [];
    if (!map || markers.length !== 11) return;

    try {
      const { geojson, legends, locationById } = await loadDataset();
      const projection = createProjection([geojson], VIEWBOX);
      markers.forEach((marker, index) => {
        const legend = legends[index];
        const location = locationById.get(legend.locationId);
        const geographicPoint = resolvePoint(location);
        const point = projection.projectPoint(geographicPoint.lng, geographicPoint.lat);
        marker.style.left = `${round(point.x / VIEWBOX.width * 100)}%`;
        marker.style.top = `${round(point.y / VIEWBOX.height * 100)}%`;
        marker.dataset.legendId = legend.id;
        marker.dataset.locationPrecision = location.locationPrecision;
        marker.dataset.coordinateRole = geographicPoint.coordinateRole || 'representative';
        marker.dataset.projectedX = String(round(point.x));
        marker.dataset.projectedY = String(round(point.y));
        marker.dataset.projectionSource = 'local-n03-2026';
        marker.setAttribute('aria-description', PRECISION_LABELS[location.locationPrecision]);
        marker.title = `${legend.name} — ${PRECISION_LABELS[location.locationPrecision]}`;
      });
      map.dataset.geographicSource = 'local-n03-2026';
      map.dataset.legendGeographyPhase = 'B';
      map.dataset.legendCount = '11';
      markerLayer.dataset.projection = 'phase-a-common';
      markerLayer.dataset.locationModel = 'phase-b-precision';
    } catch (error) {
      console.error('Ehime Phase B marker projection failed.', error);
    }
  }

  function scheduleDebugRender() {
    window.clearTimeout(scheduleDebugRender.timer);
    scheduleDebugRender.timer = window.setTimeout(() => void ensureDebugMap(), 40);
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

  async function renderDebugMap(map) {
    const { municipalities, geojson, featureByCode, legends, locationById } = await loadDataset();
    const projection = createProjection([geojson], VIEWBOX);
    const root = document.createElement('div');
    root.className = 'ehime-geo-debug';
    root.dataset.phase = 'A';
    root.dataset.locationPhase = 'B';
    root.dataset.geojsonSource = GEOJSON_PATH;
    root.dataset.municipalityCount = String(municipalities.length);
    root.dataset.legendCount = String(legends.length);

    const header = document.createElement('div');
    header.className = 'ehime-geo-debug__header';
    header.innerHTML = '<strong>Phase B 地理精度モード</strong><span>N03 2026の20市町、P05本庁20点、11伝承の地理anchorを同じprojectionで確認しています。</span>';

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('ehime-geo-debug__svg');
    svg.setAttribute('viewBox', `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '愛媛県20市町と11伝承の地理精度確認');

    const sea = document.createElementNS(SVG_NS, 'rect');
    sea.classList.add('ehime-geo-debug__sea');
    sea.setAttribute('x', '0'); sea.setAttribute('y', '0');
    sea.setAttribute('width', String(VIEWBOX.width)); sea.setAttribute('height', String(VIEWBOX.height));
    svg.appendChild(sea);

    const shapeLayer = document.createElementNS(SVG_NS, 'g');
    shapeLayer.classList.add('ehime-geo-debug__shapes');
    svg.appendChild(shapeLayer);
    const anchorLayer = document.createElementNS(SVG_NS, 'g');
    anchorLayer.classList.add('ehime-geo-debug__anchors');
    svg.appendChild(anchorLayer);
    const legendLayer = document.createElementNS(SVG_NS, 'g');
    legendLayer.classList.add('ehime-legend-geo-anchors');
    svg.appendChild(legendLayer);

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
      path.appendChild(title); group.appendChild(path); shapeLayer.appendChild(group);

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
      const circle = document.createElementNS(SVG_NS, 'circle'); circle.setAttribute('r', inside ? '6.5' : '9');
      const number = document.createElementNS(SVG_NS, 'text'); number.setAttribute('x', '0'); number.setAttribute('y', '3.2'); number.setAttribute('text-anchor', 'middle'); number.textContent = String(index + 1);
      const anchorTitle = document.createElementNS(SVG_NS, 'title'); anchorTitle.textContent = `${municipality.office} (${municipality.lat}, ${municipality.lng})`;
      anchorGroup.append(circle, number, anchorTitle); anchorLayer.appendChild(anchorGroup);
    });

    legends.forEach((legend, index) => {
      const location = locationById.get(legend.locationId);
      const geographicPoint = resolvePoint(location);
      const point = projection.projectPoint(geographicPoint.lng, geographicPoint.lat);
      const group = document.createElementNS(SVG_NS, 'g');
      group.classList.add('ehime-legend-geo-anchor', `precision-${location.locationPrecision}`);
      group.dataset.legendId = legend.id;
      group.dataset.locationPrecision = location.locationPrecision;
      group.dataset.coordinateRole = geographicPoint.coordinateRole || 'representative';
      group.dataset.projectedX = String(round(point.x));
      group.dataset.projectedY = String(round(point.y));
      group.setAttribute('transform', `translate(${round(point.x)}, ${round(point.y)})`);
      const circle = document.createElementNS(SVG_NS, 'circle'); circle.setAttribute('r', location.locationPrecision === 'site' ? '8' : '10');
      const number = document.createElementNS(SVG_NS, 'text'); number.setAttribute('x', '0'); number.setAttribute('y', '3.5'); number.setAttribute('text-anchor', 'middle'); number.textContent = String(index + 1);
      const title = document.createElementNS(SVG_NS, 'title'); title.textContent = `${legend.name} / ${PRECISION_LABELS[location.locationPrecision]} / ${geographicPoint.coordinateRole || 'representative'}`;
      group.append(circle, number, title); legendLayer.appendChild(group);
    });

    const insideCount = validation.filter((item) => item.inside).length;
    const footer = document.createElement('p');
    footer.className = 'ehime-geo-debug__status';
    footer.dataset.insideCount = String(insideCount);
    footer.textContent = `校正結果: ${insideCount}/20の役所・役場アンカーが対応区域内。Phase B: 11/11伝承にprecisionと共通projection anchorがあります。`;
    root.append(header, svg, footer);
    map.replaceChildren(root);
    map.dataset.geographicSource = 'local-n03-2026';
    map.dataset.legendGeographyPhase = 'B';
    map.setAttribute('aria-label', 'Phase B 愛媛県伝承の地理精度確認マップ');
    renderDebugList(validation, legends, locationById);
  }

  function renderDebugList(validation, legends, locationById) {
    const list = document.querySelector('#mapLegendList');
    if (!list) return;
    list.innerHTML = '';
    list.classList.add('map-debug-list');
    validation.forEach(({ municipality, inside }, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'map-debug-list__item'; button.dataset.municipalityCode = municipality.code;
      button.innerHTML = `<strong><span>${index + 1}</span>${escapeHtml(municipality.name)}</strong><small>${escapeHtml(municipality.office)} / ${inside ? '区域内' : '要確認'}</small>`;
      button.addEventListener('click', () => selectByData('municipalityCode', municipality.code));
      list.appendChild(button);
    });
    legends.forEach((legend, index) => {
      const location = locationById.get(legend.locationId);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'map-debug-list__legend'; button.dataset.legendId = legend.id;
      button.innerHTML = `<strong><span>${index + 1}</span>${escapeHtml(legend.name)}</strong><small>${escapeHtml(PRECISION_LABELS[location.locationPrecision])} / ${escapeHtml(resolvePoint(location).coordinateRole || 'representative')}</small>`;
      button.addEventListener('click', () => selectByData('legendId', legend.id));
      list.appendChild(button);
    });
  }

  function selectByData(key, value) {
    const attribute = key === 'legendId' ? 'data-legend-id' : 'data-municipality-code';
    document.querySelectorAll(`[${attribute}]`).forEach((node) => node.classList.toggle('is-debug-selected', node.getAttribute(attribute) === value));
  }

  function createProjection(featureCollections, { width, height, padding }) {
    const coordinates = [];
    featureCollections.forEach((collection) => (collection.features || []).forEach((feature) => collectCoordinates(feature.geometry?.coordinates, coordinates)));
    if (coordinates.length === 0) throw new Error('行政区域の座標がありません。');
    const meanLat = coordinates.reduce((sum, point) => sum + point[1], 0) / coordinates.length;
    const lonScale = Math.cos(meanLat * Math.PI / 180);
    let minX = Infinity, maxX = -Infinity, minLat = Infinity, maxLat = -Infinity;
    coordinates.forEach(([lng, lat]) => {
      const x = lng * lonScale;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    });
    const extentX = Math.max(maxX - minX, Number.EPSILON);
    const extentY = Math.max(maxLat - minLat, Number.EPSILON);
    const scale = Math.min((width - padding * 2) / extentX, (height - padding * 2) / extentY);
    const drawingWidth = extentX * scale, drawingHeight = extentY * scale;
    const offsetX = (width - drawingWidth) / 2, offsetY = (height - drawingHeight) / 2;
    const projectPoint = (lng, lat) => ({ x: offsetX + (lng * lonScale - minX) * scale, y: offsetY + (maxLat - lat) * scale });
    return { projectPoint, geographicBounds: { west: minX / lonScale, east: maxX / lonScale, south: minLat, north: maxLat }, displayPadding: padding };
  }

  function collectCoordinates(value, output) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) { output.push(value); return; }
    value.forEach((child) => collectCoordinates(child, output));
  }
  function featureCollectionToPath(collection, projectPoint) { return (collection.features || []).map((feature) => geometryToPath(feature.geometry, projectPoint)).filter(Boolean).join(' '); }
  function geometryToPath(geometry, projectPoint) {
    if (!geometry) return '';
    if (geometry.type === 'Polygon') return polygonToPath(geometry.coordinates, projectPoint);
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.map((polygon) => polygonToPath(polygon, projectPoint)).join(' ');
    return '';
  }
  function polygonToPath(polygon, projectPoint) { return polygon.map((ring) => ringToPath(ring, projectPoint)).join(' '); }
  function ringToPath(ring, projectPoint) {
    if (!Array.isArray(ring) || ring.length === 0) return '';
    return ring.map((coordinate, index) => { const point = projectPoint(coordinate[0], coordinate[1]); return `${index === 0 ? 'M' : 'L'}${round(point.x)} ${round(point.y)}`; }).join(' ') + ' Z';
  }
  function pointInFeatureCollection(point, collection) { return (collection.features || []).some((feature) => pointInGeometry(point, feature.geometry)); }
  function pointInGeometry(point, geometry) {
    if (!geometry) return false;
    if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates);
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
    return false;
  }
  function pointInPolygon(point, polygon) { return Boolean(polygon?.length && pointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(point, hole))); }
  function pointInRing([x, y], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      const intersects = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function renderError(map, error) {
    console.error('Ehime Phase B geographic debug failed.', error);
    const panel = document.createElement('div'); panel.className = 'ehime-geo-debug ehime-geo-debug--error';
    panel.innerHTML = `<strong>Phase B 地理精度データを表示できませんでした。</strong><p>${escapeHtml(error?.message || String(error))}</p>`;
    map.replaceChildren(panel);
  }

  function installPrecisionStyles() {
    if (document.querySelector('#ehime-phase-b-precision-style')) return;
    const style = document.createElement('style'); style.id = 'ehime-phase-b-precision-style';
    style.textContent = `
      .map-marker[data-location-precision="regional"], .map-marker[data-location-precision="broad_historical_area"], .map-marker[data-location-precision="marine"], .map-marker[data-location-precision="multiple_locations"], .map-marker[data-location-precision="locality"] { outline: 1px dashed rgba(255,255,255,.72); outline-offset: 4px; }
      .ehime-legend-geo-anchor circle { fill:#f3c96b; stroke:#2f1b16; stroke-width:2; }
      .ehime-legend-geo-anchor text { font:700 9px system-ui,sans-serif; fill:#2f1b16; pointer-events:none; }
      .ehime-legend-geo-anchor.precision-marine circle { fill:#9ed9ea; }
      .ehime-legend-geo-anchor.precision-site circle { fill:#fff1a8; }
      .map-debug-list__legend { width:100%; text-align:left; margin-top:4px; }
      .map-debug-list__legend strong { display:flex; gap:.5rem; align-items:center; }
      .map-debug-list__legend small { display:block; opacity:.75; }
    `;
    document.head.appendChild(style);
  }

  function round(value) { return Math.round(value * 100) / 100; }
  function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
})();
