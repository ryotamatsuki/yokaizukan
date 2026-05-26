(() => {
  const DATA_PATHS = {
    legends: "public/data/legends.json",
    articles: "public/data/articles.json",
    locations: "public/data/locations.json",
    courses: "public/data/courses.json",
    sources: "public/data/sources.json",
    evidence: "public/data/evidence_check_table.json",
    childArticles: "public/data/child_articles.json"
  };

  const STORAGE_KEY = "ehimeLegendNotebook";

  const state = {
    legends: [],
    articles: [],
    locations: [],
    courses: [],
    sources: [],
    evidence: [],
    childArticles: [],
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
    const [legendsData, articlesData, locationsData, coursesData, sourcesData, evidenceData, childArticlesData] = await Promise.all([
      loadJson(DATA_PATHS.legends),
      loadJson(DATA_PATHS.articles),
      loadJson(DATA_PATHS.locations),
      loadJson(DATA_PATHS.courses),
      loadJson(DATA_PATHS.sources),
      loadJson(DATA_PATHS.evidence),
      loadJson(DATA_PATHS.childArticles)
    ]);

    state.legends = normalizeArray(legendsData.legends).filter((legend) => legend.displayInList !== false);
    state.articles = normalizeArray(articlesData.articles);
    state.locations = normalizeArray(locationsData.locations);
    state.courses = normalizeArray(coursesData.courses);
    state.sources = normalizeArray(sourcesData.sources);
    state.evidence = normalizeArray(evidenceData.legendEvidence);
    state.childArticles = normalizeArray(childArticlesData.articles);
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
    setText("#readCount", getNotebook().length);
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

    state.legends.forEach((legend) => {
      const location = findLocation(legend.locationId);
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "map-marker";
      marker.style.left = `${location?.mapPosition?.x ?? 50}%`;
      marker.style.top = `${location?.mapPosition?.y ?? 50}%`;
      marker.textContent = legend.name.replace("と", "と ");
      marker.addEventListener("click", () => openDetail(legend.id));
      map.appendChild(marker);

      const item = document.createElement("button");
      item.type = "button";
      item.innerHTML = `<strong>${escapeHtml(legend.name)}</strong><span>${escapeHtml(location?.summary || legend.municipality || "")}</span>`;
      item.addEventListener("click", () => openDetail(legend.id));
      list.appendChild(item);
    });
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

    const ids = getNotebook();
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
          <div class="badge-row">
            ${badge(legend.region, "green")}
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
            <p>${escapeHtml(legend.shortDescription || "")}</p>
          </section>
          <section class="detail-section">
            <h3>どんな伝承？</h3>
            <p>${escapeHtml(legend.childDescription || "")}</p>
          </section>
          <section class="detail-section">
            <h3>出る場所</h3>
            <p>${escapeHtml(location?.name || legend.municipality || "")}</p>
          </section>
          ${relatedItemsHtml(legend)}
          ${articleHtml(article)}
          ${missionsHtml(legend)}
          ${detailQuizHtml(legend)}
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

  function openChildDetail(childId) {
    const match = findChildItem(childId);
    if (!match) return;

    const { parent, child } = match;
    const article = findChildArticle(child.id);
    const content = $("#detailContent");
    const modal = $("#legendModal");
    if (!content || !modal) return;

    const childSourceIds = new Set([...normalizeArray(child.sourceIds), ...normalizeArray(article?.sourceIds)]);
    const sources = Array.from(childSourceIds).map((sourceId) => findSource(sourceId)).filter(Boolean);
    const features = normalizeArray(child.visualFeatures);

    content.innerHTML = `
      <div class="detail-layout child-detail-layout">
        <aside class="detail-media">
          ${imageHtml(child.imagePath, `${child.name}の図鑑イラスト`)}
          <div class="badge-row">
            ${badge(parent.name, "green")}
            ${badge(parent.region)}
            ${badge(parent.evidenceLabel || `確認度 ${parent.evidenceLevel}`, "rust")}
          </div>
          <p>${escapeHtml(parent.name)}の下にある派生伝承です。</p>
          <div class="card-actions">
            <button type="button" data-open-detail="${escapeHtml(parent.id)}">親クラスターへ戻る</button>
          </div>
        </aside>
        <article>
          <header class="detail-title">
            <p>${escapeHtml(child.kana || "")}</p>
            <h2 id="detailTitle">${escapeHtml(child.name)}</h2>
          </header>
          <section class="detail-section">
            <h3>ひとことで</h3>
            <p>${escapeHtml(child.shortDescription || child.summary || "")}</p>
          </section>
          <section class="detail-section">
            <h3>どんな伝承？</h3>
            <p>${escapeHtml(child.childDescription || child.description || "")}</p>
          </section>
          ${features.length ? `
            <section class="detail-section">
              <h3>見た目・手がかり</h3>
              <ul>${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
            </section>
          ` : ""}
          <section class="detail-section">
            <h3>親クラスター</h3>
            <p>${escapeHtml(parent.name)} / ${escapeHtml(parent.type || "")}</p>
          </section>
          ${childArticleHtml(article, child)}
          <section class="detail-section">
            <h3>出典・確認リンク</h3>
            <div class="detail-sources">
              ${sources.length ? sources.map((source) => `
                <a href="${escapeAttribute(source.url || "#")}" target="_blank" rel="noopener">
                  ${escapeHtml(source.title)}（${escapeHtml(source.organization || "")}）
                </a>
              `).join("") : "<p>出典は親クラスターの確認リンクを参照してください。</p>"}
            </div>
          </section>
        </article>
      </div>
    `;

    bindDynamicActions(content);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    $(".legend-modal__close")?.focus();
  }

  function articleHtml(article) {
    const articleId = `ehime-detailed-article-${escapeAttribute(article?.id || "pending")}`;

    if (!article) {
      return `
        <section class="detail-section detail-more-controls">
          <h3>もっと詳しく</h3>
          <p>詳しい記事は準備中です。</p>
          <button type="button" class="inline-action" disabled>もっと詳しく読む</button>
        </section>
      `;
    }

    return `
      <section class="detail-section detail-more-controls">
        <h3>もっと詳しく</h3>
        <p>伝承の背景、昔の語られ方、絵や現代図鑑での見え方をもう少し深く読めます。</p>
        <button
          type="button"
          class="inline-action"
          data-toggle-article="${articleId}"
          aria-expanded="false"
          aria-controls="${articleId}"
        >もっと詳しく読む</button>
      </section>
      <section id="${articleId}" class="detail-section detailed-article" tabindex="-1" hidden>
        <h3>${escapeHtml(article.title || "もっと詳しく")}</h3>
        <p class="detailed-article-lead">${escapeHtml(article.lead || "")}</p>
        ${normalizeArray(article.sections).map((section) => `
          <section class="detail-section">
            <h3>${escapeHtml(section.heading || "")}</h3>
            ${normalizeArray(section.body).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          </section>
        `).join("")}
      </section>
    `;
  }

  function childArticleHtml(article, child) {
    const articleId = `ehime-child-detailed-article-${escapeAttribute(child.id || "pending")}`;

    if (!article) {
      return `
        <section class="detail-section detail-more-controls">
          <h3>もっと詳しく</h3>
          <p>詳しい記事は準備中です。</p>
          <button type="button" class="inline-action" disabled>もっと詳しく読む</button>
        </section>
      `;
    }

    return `
      <section class="detail-section detail-more-controls">
        <h3>もっと詳しく</h3>
        <p>${escapeHtml(article.summary || "伝承の背景をさらに詳しく読めます。")}</p>
        <button
          type="button"
          class="inline-action"
          data-toggle-article="${articleId}"
          aria-expanded="false"
          aria-controls="${articleId}"
        >もっと詳しく読む</button>
      </section>
      <section id="${articleId}" class="detail-section detailed-article" tabindex="-1" hidden>
        <h3>${escapeHtml(article.title || child.name)}</h3>
        ${article.subtitle ? `<p class="detailed-article-lead">${escapeHtml(article.subtitle)}</p>` : ""}
        ${normalizeArray(article.body).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        ${childArticleReferencesHtml(article)}
      </section>
    `;
  }

  function childArticleReferencesHtml(article) {
    const sources = normalizeArray(article.sourceIds).map((sourceId) => findSource(sourceId)).filter(Boolean);
    const referenceLinks = normalizeArray(article.referenceLinks);

    if (sources.length === 0 && referenceLinks.length === 0) {
      return "";
    }

    return `
      <section class="detail-section">
        <h3>参考リンク</h3>
        <div class="detail-sources">
          ${sources.map((source) => `
            <a href="${escapeAttribute(source.url || "#")}" target="_blank" rel="noopener">
              ${escapeHtml(source.title)}（${escapeHtml(source.organization || "")}）
            </a>
          `).join("")}
          ${referenceLinks.map((link) => `
            <a href="${escapeAttribute(link.url || "#")}" target="_blank" rel="noopener">
              ${escapeHtml(link.title || link.url || "")}
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }

  function relatedItemsHtml(legend) {
    const items = normalizeArray(legend.childItems);
    if (items.length === 0) return "";

    return `
      <section class="detail-section related-children-section">
        <h3>関連する伝承</h3>
        <div class="related-grid">
          ${items.map((item) => `
            <article class="related-child-card">
              ${imageHtml(item.imagePath, `${item.name}の図鑑イラスト`)}
              <strong>${escapeHtml(item.name || "")}</strong>
              <p>${escapeHtml(item.shortDescription || item.summary || "")}</p>
              <button type="button" data-open-child-detail="${escapeHtml(item.id)}">詳しく見る</button>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function missionsHtml(legend) {
    const missions = normalizeArray(legend.missions);
    if (missions.length === 0) return "";

    return `
      <section class="detail-section">
        <h3>探検ミッション</h3>
        <ul>${missions.map((mission) => `<li>${escapeHtml(mission)}</li>`).join("")}</ul>
      </section>
    `;
  }

  function detailQuizHtml(legend) {
    const quiz = normalizeArray(legend.quiz)[0];
    if (!quiz) return "";

    return `
      <section class="detail-section">
        <h3>ミニクイズ</h3>
        <p>${escapeHtml(quiz.question || "")}</p>
        <p><strong>答え:</strong> ${escapeHtml(quiz.answer || "")}</p>
        <p>${escapeHtml(quiz.explanation || "")}</p>
      </section>
    `;
  }

  function detailSourcesHtml(legend) {
    const article = findArticle(legend.articleId || legend.id);
    const ids = new Set([...normalizeArray(legend.sourceIds), ...normalizeArray(article?.sourceIds)]);
    const sources = Array.from(ids).map((sourceId) => findSource(sourceId)).filter(Boolean);
    const evidence = state.evidence.find((item) => item.legendId === legend.id);

    return `
      <section class="detail-section">
        <h3>出典・確認メモ</h3>
        ${evidence ? `<p>確認度 ${escapeHtml(evidence.level)}: ${escapeHtml(normalizeArray(evidence.checked).join("、"))}</p>` : ""}
        ${evidence?.needsFollowUp?.length ? `<p>追加確認: ${escapeHtml(evidence.needsFollowUp.join("、"))}</p>` : ""}
        <div class="detail-sources">
          ${sources.length ? sources.map((source) => `
            <a href="${escapeAttribute(source.url || "#")}" target="_blank" rel="noopener">
              ${escapeHtml(source.title)}（${escapeHtml(source.organization || "")}）
            </a>
          `).join("") : "<p>出典は整理中です。</p>"}
        </div>
      </section>
    `;
  }

  function bindDynamicActions(root) {
    $$("[data-open-detail]", root).forEach((button) => {
      button.addEventListener("click", () => openDetail(button.dataset.openDetail));
    });

    $$("[data-open-child-detail]", root).forEach((button) => {
      button.addEventListener("click", () => openChildDetail(button.dataset.openChildDetail));
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

    $$("[data-toggle-article]", root).forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.toggleArticle || "");
        if (!target) return;

        const nextExpanded = target.hidden;
        target.hidden = !nextExpanded;
        button.setAttribute("aria-expanded", String(nextExpanded));
        button.textContent = nextExpanded ? "詳しい記事を閉じる" : "もっと詳しく読む";

        if (nextExpanded) {
          target.focus({ preventScroll: true });
          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion ? "auto" : "smooth" });
        }
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
        ...normalizeArray(legend.areaTags),
        ...normalizeArray(legend.childItems).flatMap((item) => [item.name, item.summary])
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

  function addNotebook(id, showMessage) {
    if (!id) return;
    const ids = getNotebook();
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
    const ids = getNotebook().filter((item) => item !== id);
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

  function findChildArticle(id) {
    return state.childArticles.find((article) => article.id === id);
  }

  function findChildItem(id) {
    for (const parent of state.legends) {
      const child = normalizeArray(parent.childItems).find((item) => item.id === id);
      if (child) {
        return { parent, child };
      }
    }
    return null;
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
