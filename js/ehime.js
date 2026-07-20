(() => {
  const DATA_PATHS = {
    legends: "public/data/legends.json",
    articles: "public/data/articles.json",
    locations: "public/data/locations.json",
    courses: "public/data/courses.json",
    sources: "public/data/sources.json",
    evidence: "public/data/evidence_check_table.json"
  };

  const STORAGE_KEY = "ehimeLegendNotebook";
  const IMAGE_NOTE = "この画像は伝承資料に残る原画ではありません。確認できる記録をもとに制作した図鑑用イメージです。";
  const TRADITION_LABELS = {
    festival_tradition: "祭礼に受け継がれた伝承",
    literary_legend: "読み物・講談として広まった伝説",
    early_modern_yokai_book: "江戸時代の妖怪本",
    folklore_collection: "地域で採集された伝承",
    myth_or_local_text: "古い地誌・神話に残る話",
    temple_legend: "寺院縁起に残る伝説",
    calendar_custom: "年中行事と神の来訪"
  };
  const GENERATED_MAP_IMAGE = "public/assets/ehime/generated/ehime_generated_map.png";
  const MAP_BOUNDS = {
    west: 132.0,
    east: 133.35,
    north: 34.35,
    south: 32.85
  };
  const MARKER_LABEL_OFFSETS = {
    matsuyama_tanuki_cluster: { x: -116, y: -76 },
    dogo_myth_cluster: { x: 134, y: -96 },
    ishiteji_emon_saburo_cluster: { x: -120, y: 108 },
    iyo_basan_cluster: { x: -292, y: -34 },
    ishizuchi_tengu_cluster: { x: 132, y: -28 },
    uwajima_ushioni_cluster: { x: 126, y: -64 },
    kihoku_oni_cluster: { x: -154, y: -150 },
    uwakai_sea_mystery_cluster: { x: -76, y: 82 }
  };

  const state = {
    legends: [],
    articles: [],
    locations: [],
    courses: [],
    sources: [],
    evidence: [],
    currentView: "home",
    filteredLegends: []
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    registerStaticEvents();

    try {
      await loadAllData();
      cleanNotebookIds();
      state.filteredLegends = [...state.legends];
      populateFilters();
      renderAll();
    } catch (error) {
      showLoadError(error);
    }
  }

  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`${path} を読み込めませんでした。`);
    }
    return response.json();
  }

  async function loadAllData() {
    const [legendsData, articlesData, locationsData, coursesData, sourcesData, evidenceData] = await Promise.all([
      loadJson(DATA_PATHS.legends),
      loadJson(DATA_PATHS.articles),
      loadJson(DATA_PATHS.locations),
      loadJson(DATA_PATHS.courses),
      loadJson(DATA_PATHS.sources),
      loadJson(DATA_PATHS.evidence)
    ]);

    state.legends = normalizeArray(legendsData.legends).filter((legend) => legend.displayInList !== false);
    state.articles = normalizeArray(articlesData.articles);
    state.locations = normalizeArray(locationsData.locations);
    state.courses = normalizeArray(coursesData.courses);
    state.sources = normalizeArray(sourcesData.sources);
    state.evidence = normalizeArray(evidenceData.legendEvidence);
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function registerStaticEvents() {
    $$("[data-target-view]").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.targetView));
    });

    $("#ehimeSearch")?.addEventListener("input", applyFilters);
    $("#ehimeRegion")?.addEventListener("change", applyFilters);
    $("#ehimeEvidence")?.addEventListener("change", applyFilters);
    $("#ehimeReset")?.addEventListener("click", resetFilters);
    window.addEventListener("resize", () => {
      if (state.currentView === "map") {
        renderMap();
      }
    });

    $$("[data-close-detail]").forEach((button) => {
      button.addEventListener("click", closeDetail);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDetail();
      }
    });
  }

  function renderAll() {
    renderDashboard();
    renderHome();
    renderMap();
    renderLegendGrid();
    renderCourses();
    renderNotebook();
    renderQuiz();
    renderSources();
  }

  function renderDashboard() {
    setText("#legendCount", state.legends.length);
    setText("#sourceCount", state.sources.length);
    setText("#readCount", getValidNotebookIds().length);
  }

  function renderHome() {
    const target = $("#todayLegend");
    if (!target || state.legends.length === 0) return;

    const todayIndex = getDayIndex() % state.legends.length;
    const legend = state.legends[todayIndex];
    target.innerHTML = `
      <article class="today-card">
        ${imageHtml(legend.imagePath, `${legend.name}の図鑑イラスト`)}
        <div>
          <p class="ehime-kicker">今日の伝承</p>
          <h3>${escapeHtml(legend.name)}</h3>
          <div class="badge-row">
            ${badge(legend.region, "green")}
            ${badge(legend.evidenceLabel || `確認度 ${legend.evidenceLevel}`, "rust")}
            ${badge(legend.scaryLabel || "")}
          </div>
          <p>${escapeHtml(legend.childDescription || legend.shortDescription || "")}</p>
          <div class="card-actions">
            <button type="button" data-open-detail="${escapeHtml(legend.id)}">もっと詳しく</button>
            <button type="button" class="secondary" data-notebook="${escapeHtml(legend.id)}">手帳に記録</button>
          </div>
        </div>
      </article>
    `;
    bindDynamicActions(target);
  }

  function renderMap() {
    const map = $("#ehimeMap");
    const list = $("#mapLegendList");
    if (!map || !list) return;

    map.innerHTML = "";
    list.innerHTML = "";
    map.setAttribute("aria-label", "生成背景地図で見る愛媛県のふしぎマップ");
    const markerLayer = renderGeneratedMap(map);

    const placements = getMapMarkerPlacements(state.legends);

    state.legends.forEach((legend) => {
      const location = findLocation(legend.locationId);
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "map-marker";
      positionMapMarker(marker, location, placements.get(legend.id));
      marker.textContent = legend.name.replace("と", "と ");
      marker.addEventListener("click", () => openDetail(legend.id));
      markerLayer.appendChild(marker);

      const item = document.createElement("button");
      item.type = "button";
      item.innerHTML = `<strong>${escapeHtml(legend.name)}</strong><span>${escapeHtml(location?.summary || legend.municipality || "")}</span>`;
      item.addEventListener("click", () => openDetail(legend.id));
      list.appendChild(item);
    });
  }

  function renderGeneratedMap(map) {
    const image = document.createElement("img");
    image.className = "generated-map-image";
    image.src = GENERATED_MAP_IMAGE;
    image.alt = "";
    image.decoding = "async";
    image.setAttribute("aria-hidden", "true");

    const markerLayer = document.createElement("div");
    markerLayer.className = "generated-map-marker-layer";

    const note = document.createElement("p");
    note.className = "generated-map-note";
    note.textContent = "AI生成背景地図";

    map.append(image, markerLayer, note);
    return markerLayer;
  }

  function positionMapMarker(marker, location, placement) {
    if (placement) {
      marker.style.left = `${placement.x}%`;
      marker.style.top = `${placement.y}%`;
      marker.style.setProperty("--marker-label-x", `${placement.labelX}px`);
      marker.style.setProperty("--marker-label-y", `${placement.labelY}px`);
      return;
    }

    marker.style.left = `${location?.mapPosition?.x ?? 50}%`;
    marker.style.top = `${location?.mapPosition?.y ?? 50}%`;
  }

  function getMapMarkerPlacements(legends) {
    const placements = new Map();

    legends.forEach((legend) => {
      const location = findLocation(legend.locationId);
      if (!Number.isFinite(location?.lat) || !Number.isFinite(location?.lng)) {
        return;
      }

      const point = projectMapPosition(location.lng, location.lat);
      const offset = MARKER_LABEL_OFFSETS[legend.id] || { x: 0, y: 0 };
      placements.set(legend.id, {
        x: point.x,
        y: point.y,
        labelX: offset.x,
        labelY: offset.y
      });
    });

    return placements;
  }

  function projectMapPosition(lng, lat) {
    const x = (lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west) * 100;
    const y = (MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south) * 100;
    return {
      x: clamp(x, 2, 98),
      y: clamp(y, 4, 96)
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function renderLegendGrid() {
    const grid = $("#legendGrid");
    if (!grid) return;

    setText("#resultCount", `${state.filteredLegends.length}件の伝承を表示しています。`);

    if (state.filteredLegends.length === 0) {
      grid.innerHTML = `<p class="empty-message">条件に合う伝承が見つかりませんでした。</p>`;
      return;
    }

    grid.innerHTML = state.filteredLegends.map((legend) => legendCardHtml(legend)).join("");
    bindDynamicActions(grid);
  }

  function legendCardHtml(legend) {
    return `
      <article class="legend-card">
        ${imageHtml(legend.imagePath, `${legend.name}の図鑑イラスト`)}
        <div class="legend-card__body">
          <h3>${escapeHtml(legend.name)}</h3>
          <p>${escapeHtml(legend.kana || "")}</p>
          <div class="badge-row">
            ${badge(legend.region, "green")}
            ${badge(legend.type)}
            ${badge(`確認度 ${legend.evidenceLevel}`, "rust")}
          </div>
          <p>${escapeHtml(legend.shortDescription || "")}</p>
          <div class="card-actions">
            <button type="button" data-open-detail="${escapeHtml(legend.id)}">もっと詳しく</button>
            <button type="button" class="secondary" data-notebook="${escapeHtml(legend.id)}">手帳に記録</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCourses() {
    const grid = $("#courseGrid");
    if (!grid) return;

    grid.innerHTML = state.courses.map((course) => `
      <article class="course-card">
        <div class="badge-row">
          ${badge(course.region, "green")}
          ${badge(course.time, "rust")}
        </div>
        <h3>${escapeHtml(course.title)}</h3>
        <p>${escapeHtml(course.summary || "")}</p>
        <p>${escapeHtml(course.forKids || "")}</p>
        <div class="course-stops">
          ${normalizeArray(course.stops).map((stop) => `
            <button type="button" data-open-detail="${escapeHtml(stop.legendId)}">
              <strong>${escapeHtml(stop.title)}</strong><br>
              <span>${escapeHtml(stop.note || "")}</span>
            </button>
          `).join("")}
        </div>
      </article>
    `).join("");

    bindDynamicActions(grid);
  }

  function renderNotebook() {
    const list = $("#notebookList");
    if (!list) return;

    const ids = getValidNotebookIds();
    const legends = ids.map((id) => findLegend(id)).filter(Boolean);

    if (legends.length === 0) {
      list.innerHTML = `
        <article class="notebook-card">
          <h3>まだ記録はありません</h3>
          <p>図鑑カードや詳細画面から「手帳に記録」を押すと、読んだ伝承がここに残ります。</p>
        </article>
      `;
      return;
    }

    list.innerHTML = legends.map((legend) => `
      <article class="notebook-card">
        <h3>${escapeHtml(legend.name)}</h3>
        <div class="badge-row">${badge(legend.region, "green")}${badge(legend.type)}</div>
        <p>${escapeHtml(legend.shortDescription || "")}</p>
        <div class="card-actions">
          <button type="button" data-open-detail="${escapeHtml(legend.id)}">もう一度読む</button>
          <button type="button" class="secondary" data-remove-notebook="${escapeHtml(legend.id)}">記録を外す</button>
        </div>
      </article>
    `).join("");

    bindDynamicActions(list);
  }

  function renderQuiz() {
    const panel = $("#quizPanel");
    if (!panel) return;

    const quizItems = state.legends
      .flatMap((legend) => normalizeArray(legend.quiz).map((quiz) => ({ legend, quiz })));

    if (quizItems.length === 0) {
      panel.innerHTML = "<p>クイズは準備中です。</p>";
      return;
    }

    const index = getDayIndex() % quizItems.length;
    const item = quizItems[index];

    panel.innerHTML = `
      <div class="badge-row">${badge(item.legend.name, "green")}</div>
      <h3>${escapeHtml(item.quiz.question)}</h3>
      <div>
        ${normalizeArray(item.quiz.choices).map((choice) => `
          <button type="button" class="quiz-choice" data-answer="${escapeHtml(item.quiz.answer)}">${escapeHtml(choice)}</button>
        `).join("")}
      </div>
      <div id="quizFeedback" class="quiz-feedback" hidden></div>
    `;

    $$(".quiz-choice", panel).forEach((button) => {
      button.addEventListener("click", () => {
        const feedback = $("#quizFeedback");
        if (!feedback) return;
        const correct = button.textContent === button.dataset.answer;
        feedback.hidden = false;
        feedback.textContent = correct
          ? `正解です。${item.quiz.explanation || ""}`
          : `答えは「${item.quiz.answer}」です。${item.quiz.explanation || ""}`;
      });
    });
  }

  function renderSources() {
    const list = $("#sourceList");
    if (!list) return;

    list.innerHTML = state.sources.map((source) => `
      <article class="source-card">
        <div class="badge-row">${badge(source.type || "source", "green")}</div>
        <h3>${escapeHtml(source.title)}</h3>
        <p>${escapeHtml(source.organization || "")}</p>
        <p>${escapeHtml(source.note || "")}</p>
        <a href="${escapeAttribute(source.url || "#")}" target="_blank" rel="noopener">資料を開く</a>
      </article>
    `).join("");
  }

  function openDetail(id) {
    const legend = findLegend(id);
    if (!legend) return;

    const article = findArticle(legend.articleId || legend.id);
    const location = findLocation(legend.locationId);
    const content = $("#detailContent");
    const modal = $("#legendModal");
    if (!content || !modal) return;

    addNotebook(id, false);

    content.innerHTML = `
      <div class="detail-layout">
        <aside class="detail-media">
          ${imageHtml(legend.imagePath, `${legend.name}の図鑑イラスト`)}
          <p class="generated-image-note">${escapeHtml(IMAGE_NOTE)}</p>
          <div class="badge-row">
            ${badge(legend.region, "green")}
            ${badge(TRADITION_LABELS[legend.traditionLayer] || legend.traditionLayer, "rust")}
            ${badge(legend.evidenceLabel || `確認度 ${legend.evidenceLevel}`, "rust")}
            ${badge(legend.scaryLabel || "")}
          </div>
          <p>${escapeHtml(location?.summary || "")}</p>
          <div class="card-actions">
            <button type="button" data-notebook="${escapeHtml(legend.id)}">手帳に記録</button>
          </div>
        </aside>
        <article>
          <header class="detail-title">
            <p>${escapeHtml(legend.kana || "")}</p>
            <h2 id="detailTitle">${escapeHtml(legend.name)}</h2>
          </header>
          <section class="detail-section">
            <h3>ひとことで</h3>
            <p>${escapeHtml(article?.lead || legend.shortDescription || "")}</p>
          </section>
          ${articleHtml(article)}
          ${recordInfoHtml(legend, location, article)}
          ${detailSourcesHtml(legend)}
        </article>
      </div>
    `;

    bindDynamicActions(content);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    $(".legend-modal__close")?.focus();
    renderDashboard();
    renderNotebook();
  }

  function closeDetail() {
    const modal = $("#legendModal");
    const content = $("#detailContent");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (content) {
      content.innerHTML = "";
    }
  }

  function articleHtml(article) {
    if (!article) {
      return `<section class="detail-section"><p>詳しい記事は準備中です。</p></section>`;
    }

    return `
      ${normalizeArray(article.sections).map((section) => `
        <section class="detail-section">
          <h3>${escapeHtml(section.heading || "")}</h3>
          ${normalizeArray(section.body).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>
      `).join("")}
    `;
  }

  function recordInfoHtml(legend, location, article) {
    const sourceIds = [...new Set([
      ...normalizeArray(legend.sourceIds),
      ...normalizeArray(article?.sourceIds)
    ])];
    const sources = sourceIds.map(findSource).filter(Boolean);

    return `
      <section class="detail-section">
        <h3>記録情報</h3>
        ${location?.name ? `
          <dl class="record-location">
            <dt>伝承地・関係地</dt>
            <dd>${escapeHtml(location.name)}</dd>
          </dl>
        ` : ""}
        <div class="record-source-list">
          ${sources.map((source) => sourceRecordHtml(source)).join("")}
        </div>
      </section>
    `;
  }

  function sourceRecordHtml(source) {
    const rows = [
      ["資料名", source.title],
      ["記録者または編者", source.authorOrEditor],
      ["資料に記載された話者", source.informant],
      ["刊行年", source.publicationYear],
      ["刊行日", source.publicationDate],
      ["巻号", source.volumeIssue],
      ["ページ", source.pages],
      ["個別記録ID", source.recordId],
      ["資料種別", source.type],
      ["発行・公開機関", source.organization]
    ].filter(([, value]) => value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length));

    return `
      <article class="record-source-card">
        <h4>${escapeHtml(source.title || "記録資料")}</h4>
        <dl>
          ${rows.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(Array.isArray(value) ? value.join("、") : String(value))}</dd>`).join("")}
        </dl>
        ${source.url ? `<a href="${escapeAttribute(source.url)}" target="_blank" rel="noopener">資料を開く</a>` : ""}
      </article>
    `;
  }

  function detailSourcesHtml(legend) {
    const article = findArticle(legend.articleId || legend.id);
    const evidence = state.evidence.find((item) => item.legendId === legend.id);

    return `
      <section class="detail-section">
        <h3>確認メモ</h3>
        ${evidence ? `<p>確認度 ${escapeHtml(evidence.level)}</p>` : ""}
        ${evidence?.checked?.length ? `<h4>確認できたこと</h4><ul>${evidence.checked.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
        ${evidence?.needsFollowUp?.length ? `<h4>追加確認事項</h4><ul>${evidence.needsFollowUp.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      </section>
    `;
  }

  function bindDynamicActions(root) {
    $$("[data-open-detail]", root).forEach((button) => {
      button.addEventListener("click", () => openDetail(button.dataset.openDetail));
    });

    $$("[data-notebook]", root).forEach((button) => {
      button.addEventListener("click", () => {
        addNotebook(button.dataset.notebook, true);
      });
    });

    $$("[data-remove-notebook]", root).forEach((button) => {
      button.addEventListener("click", () => {
        removeNotebook(button.dataset.removeNotebook);
      });
    });

  }

  function populateFilters() {
    const select = $("#ehimeRegion");
    if (!select) return;

    const regions = Array.from(new Set(state.legends.map((legend) => legend.region).filter(Boolean)));
    select.innerHTML = `<option value="">すべて</option>${regions.map((region) => `<option value="${escapeAttribute(region)}">${escapeHtml(region)}</option>`).join("")}`;
  }

  function applyFilters() {
    const keyword = ($("#ehimeSearch")?.value || "").trim().toLowerCase();
    const region = $("#ehimeRegion")?.value || "";
    const evidence = $("#ehimeEvidence")?.value || "";

    state.filteredLegends = state.legends.filter((legend) => {
      const haystack = [
        legend.name,
        legend.kana,
        legend.region,
        legend.municipality,
        legend.type,
        legend.traditionType,
        legend.shortDescription,
        legend.childDescription,
        ...normalizeArray(legend.areaTags)
      ].filter(Boolean).join(" ").toLowerCase();

      const matchesKeyword = keyword ? haystack.includes(keyword) : true;
      const matchesRegion = region ? legend.region === region : true;
      const matchesEvidence = evidence ? legend.evidenceLevel === evidence : true;

      return matchesKeyword && matchesRegion && matchesEvidence;
    });

    renderLegendGrid();
  }

  function resetFilters() {
    if ($("#ehimeSearch")) $("#ehimeSearch").value = "";
    if ($("#ehimeRegion")) $("#ehimeRegion").value = "";
    if ($("#ehimeEvidence")) $("#ehimeEvidence").value = "";
    state.filteredLegends = [...state.legends];
    renderLegendGrid();
  }

  function setView(view) {
    state.currentView = view || "home";

    $$("[data-ehime-view]").forEach((section) => {
      section.classList.toggle("is-active", section.dataset.ehimeView === state.currentView);
    });

    $$(".ehime-tabs [data-target-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.targetView === state.currentView);
    });

    if (state.currentView === "map") {
      requestAnimationFrame(renderMap);
    }

    $("#ehimeMain")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getNotebook() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeNotebook(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // localStorageが使えない場合でも表示は続ける。
    }
  }

  function getValidNotebookIds() {
    const validIds = new Set(state.legends.map((legend) => legend.id));
    return getNotebook().filter((id) => validIds.has(id));
  }

  function cleanNotebookIds() {
    const original = getNotebook();
    const cleaned = getValidNotebookIds();

    if (JSON.stringify(original) !== JSON.stringify(cleaned)) {
      writeNotebook(cleaned);
    }
  }

  function addNotebook(id, showMessage) {
    if (!id) return;
    const ids = getValidNotebookIds();
    if (!ids.includes(id)) {
      ids.unshift(id);
      writeNotebook(ids);
    }
    renderDashboard();
    renderNotebook();
    if (showMessage) {
      const legend = findLegend(id);
      window.alert(`${legend?.name || "伝承"}を探検手帳に記録しました。`);
    }
  }

  function removeNotebook(id) {
    const ids = getValidNotebookIds().filter((item) => item !== id);
    writeNotebook(ids);
    renderDashboard();
    renderNotebook();
  }

  function imageHtml(path, alt) {
    if (!path) {
      return `<div class="image-placeholder">画像準備中</div>`;
    }
    return `<img src="${escapeAttribute(path)}" alt="${escapeAttribute(alt || "")}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'image-placeholder',textContent:'画像準備中'}))">`;
  }

  function badge(text, tone = "") {
    if (!text) return "";
    const className = tone ? `badge badge--${tone}` : "badge";
    return `<span class="${className}">${escapeHtml(String(text))}</span>`;
  }

  function findLegend(id) {
    return state.legends.find((legend) => legend.id === id);
  }

  function findArticle(id) {
    return state.articles.find((article) => article.id === id);
  }

  function findLocation(id) {
    return state.locations.find((location) => location.id === id);
  }

  function findSource(id) {
    return state.sources.find((source) => source.id === id);
  }

  function setText(selector, value) {
    const element = $(selector);
    if (element) {
      element.textContent = String(value);
    }
  }

  function getDayIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function showLoadError(error) {
    const message = `
      <article class="notebook-card">
        <h3>データを読み込めませんでした</h3>
        <p>${escapeHtml(error.message || "JSONの読み込みに失敗しました。")}</p>
        <p>ローカルで見る場合は、プロジェクトのルートで python -m http.server 8000 を起動してください。</p>
      </article>
    `;
    ["#todayLegend", "#legendGrid", "#sourceList"].forEach((selector) => {
      const target = $(selector);
      if (target) target.innerHTML = message;
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }
})();
