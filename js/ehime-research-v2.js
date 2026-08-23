(() => {
  const DATA_URL = 'public/data/ehime_research_v2.json';
  let researchById = new Map();
  let currentLegendId = null;

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      const response = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      researchById = new Map((payload.items || []).map((item) => [item.id, item]));
      installObservers();
    } catch (error) {
      console.warn('Ehime Research v2 の読み込みをスキップしました。', error);
    }
  }

  function installObservers() {
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-open-detail]');
      if (trigger?.dataset.openDetail) currentLegendId = trigger.dataset.openDetail;
    }, true);

    const detail = document.querySelector('#detailContent');
    if (!detail) return;
    const observer = new MutationObserver(() => enhanceDetail(detail));
    observer.observe(detail, { childList: true, subtree: true });
  }

  function enhanceDetail(detail) {
    if (!currentLegendId || detail.querySelector('[data-ehime-research-v2]')) return;
    const item = researchById.get(currentLegendId);
    const article = detail.querySelector('.detail-layout > article');
    if (!item || !article || !detail.querySelector('#detailTitle')) return;

    const section = document.createElement('section');
    section.className = 'detail-section ehime-research-v2';
    section.dataset.ehimeResearchV2 = 'true';

    section.innerHTML = `
      <div class="ehime-research-v2__heading">
        <div>
          <p class="ehime-kicker">地域と資料で読む</p>
          <h3>愛媛のどこで、何が記録された？</h3>
        </div>
        <span class="ehime-research-v2__badge">Research v2</span>
      </div>
      <p class="ehime-research-v2__lead">${esc(item.childLead)}</p>
      <dl class="ehime-research-v2__locality">
        <div><dt>地域</dt><dd>${esc(item.locality.region)}</dd></div>
        <div><dt>市町・範囲</dt><dd>${esc(item.locality.municipality)}</dd></div>
        ${item.locality.specificPlaces?.length ? `<div><dt>具体的な場所</dt><dd>${item.locality.specificPlaces.map(esc).join('・')}</dd></div>` : ''}
      </dl>
      ${recordsHtml(item)}
      ${claimsHtml(item)}
      ${followUpHtml(item)}
    `;

    const recordInfo = [...article.querySelectorAll('.detail-section')].find((el) => el.querySelector('h3')?.textContent === '記録情報');
    if (recordInfo) article.insertBefore(section, recordInfo);
    else article.append(section);
  }

  function recordsHtml(item) {
    if (!item.regionalRecords?.length) {
      return `<div class="ehime-research-v2__block"><h4>地域記録</h4><p class="muted-text">具体的な市町・集落まで確認できる地域記録は、まだ十分に確認できていません。</p></div>`;
    }
    return `
      <div class="ehime-research-v2__block">
        <h4>地域ごとの記録</h4>
        <div class="ehime-research-v2__records">
          ${item.regionalRecords.map((record) => `<article><h5>${esc(record.place)}</h5><p>${esc(record.summary)}</p></article>`).join('')}
        </div>
      </div>`;
  }

  function claimsHtml(item) {
    if (!item.claims?.length) return '';
    return `
      <div class="ehime-research-v2__block">
        <h4>資料から言えること</h4>
        <ul class="ehime-research-v2__claims">
          ${item.claims.map((claim) => `<li><strong>${esc(claim.label)}</strong><span>${esc(claim.text)}</span><small>${claim.evidenceLevel === 'A' ? '具体的な資料で確認' : '資料・機関解説から確認'}</small></li>`).join('')}
        </ul>
      </div>`;
  }

  function followUpHtml(item) {
    if (!item.needsFollowUp?.length) {
      return `<aside class="ehime-research-v2__followup"><strong>追加確認</strong><p>この項目では、現在の監査表に未解決の追加確認事項はありません。</p></aside>`;
    }
    return `
      <aside class="ehime-research-v2__followup">
        <strong>まだ分からないこと</strong>
        <ul>${item.needsFollowUp.map((text) => `<li>${esc(text)}</li>`).join('')}</ul>
      </aside>`;
  }

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
