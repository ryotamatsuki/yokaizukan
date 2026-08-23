(() => {
  const ARTICLE_SECTION_ROLES = {
    uwajima_ushioni_cluster: {
      '愛媛のどこに残る？': 'context',
      '怪物の牛鬼と、祭りの牛鬼': 'story',
      '資料から分かること': 'research_note',
      'まだ分からないこと': 'research_note'
    },
    matsuyama_tanuki_cluster: {
      '愛媛のどこに残る？': 'context',
      'どんな物語？': 'story',
      '資料から分かること': 'research_note',
      'まだ分からないこと': 'research_note'
    },
    iyo_basan_cluster: {
      'どこに伝わる？': 'context',
      '1841年の本には何と書かれる？': 'story',
      '資料から分かること': 'research_note',
      'まだ分からないこと': 'research_note'
    },
    ishizuchi_tengu_cluster: {
      '愛媛のどこに残る？': 'context',
      '山麓ではどう語られた？': 'story',
      '資料から分かること': 'research_note',
      'まだ分からないこと': 'research_note'
    },
    dogo_myth_cluster: {
      '白鷺が湯を見つけた話': 'story',
      '少彦名命と玉の石': 'story',
      '資料から分かること': 'research_note',
      'ここで大切なこと': 'research_note'
    },
    ishiteji_emon_saburo_cluster: {
      '愛媛のどこに残る？': 'context',
      'どんな物語？': 'story',
      'どこまで古く確認できる？': 'research_note',
      'まだ分からないこと': 'research_note'
    },
    uwakai_sea_mystery_cluster: {
      '大洲・宇和島の「柄杓をくれ」': 'story',
      '日振島へ帰る船を止める火': 'story',
      '資料から分かること': 'research_note',
      'まだ分からないこと': 'research_note'
    },
    kihoku_oni_cluster: {
      '愛媛のどこに残る？': 'context',
      '鬼王段三郎は何をした？': 'story',
      '資料から分かること': 'research_note',
      'まだ分からないこと': 'research_note'
    },
    yosuzume: {
      '愛媛のどこに残る？': 'context',
      'どんな怪異？': 'story',
      '資料から分かること': 'research_note',
      'ここで大切なこと': 'research_note'
    },
    nobiagari: {
      '旧下波村の伸上り': 'story',
      '城川町の伸上り': 'comparison',
      '資料から分かること': 'research_note',
      'まだ調べられること': 'research_note'
    },
    kane_no_kami_no_hi: {
      '愛媛のどこに残る？': 'context',
      '大みそかに現れる火': 'story',
      '資料から分かること': 'research_note',
      'まだ分からないこと': 'research_note'
    }
  };

  document.addEventListener('ehime:detail-opened', (event) => {
    enhanceDetail(event.detail || {});
  });

  function enhanceDetail({ id, research, evidence, sources = [], traditionLabel = '' }) {
    const detail = document.querySelector('#detailContent');
    const article = detail?.querySelector('.detail-layout > article');
    if (!detail || !article || !id || !research) return;

    article.querySelector('[data-ehime-research-v2]')?.remove();
    reduceArticleDuplication(article, id);

    const section = document.createElement('details');
    section.className = 'detail-section ehime-research-v2';
    section.dataset.ehimeResearchV2 = 'true';

    const sourceIndex = new Map(sources.map((source) => [source.id, source]));
    const evidenceLevel = evidence?.level || '';
    const followUps = Array.isArray(evidence?.needsFollowUp) ? evidence.needsFollowUp : [];

    section.innerHTML = `
      <summary class="ehime-research-v2__summary">
        <span>
          <span class="ehime-kicker">記録をくわしく見る</span>
          <strong>資料でもっと調べる</strong>
        </span>
        <span class="ehime-research-v2__summary-meta">
          ${traditionLabel ? `<span class="ehime-research-v2__badge">${esc(traditionLabel)}</span>` : ''}
          ${evidenceLevel ? `<span class="ehime-research-v2__badge">確認度 ${esc(evidenceLevel)}</span>` : ''}
        </span>
      </summary>
      <div class="ehime-research-v2__content">
        <p class="ehime-research-v2__lead">${esc(research.childLead)}</p>
        <dl class="ehime-research-v2__locality">
          <div><dt>地域</dt><dd>${esc(research.locality.region)}</dd></div>
          <div><dt>市町・範囲</dt><dd>${esc(research.locality.municipality)}</dd></div>
          ${research.locality.specificPlaces?.length ? `<div><dt>具体的な場所</dt><dd>${research.locality.specificPlaces.map(esc).join('・')}</dd></div>` : ''}
        </dl>
        ${recordsHtml(research, sourceIndex)}
        ${claimsHtml(research, sourceIndex)}
        ${followUpHtml(followUps)}
      </div>
    `;

    const recordInfo = findSection(article, '記録情報');
    if (recordInfo) article.insertBefore(section, recordInfo);
    else article.append(section);
  }

  function reduceArticleDuplication(article, articleId) {
    const roleByHeading = ARTICLE_SECTION_ROLES[articleId] || {};
    for (const section of article.querySelectorAll('.detail-section')) {
      const heading = section.querySelector('h3')?.textContent?.trim();
      if (roleByHeading[heading] === 'research_note') section.remove();
      if (heading === '確認メモ') section.remove();
    }
  }

  function recordsHtml(item, sourceIndex) {
    if (!item.regionalRecords?.length) {
      return `<div class="ehime-research-v2__block"><h4>地域記録</h4><p class="muted-text">具体的な市町・集落まで確認できる地域記録は、まだ十分に確認できていません。</p></div>`;
    }
    return `
      <div class="ehime-research-v2__block">
        <h4>地域ごとの記録</h4>
        <div class="ehime-research-v2__records">
          ${item.regionalRecords.map((record) => `
            <article>
              <h5>${esc(record.place)}</h5>
              <p>${esc(record.summary)}</p>
              ${sourceLinksHtml(record.sourceIds, sourceIndex)}
            </article>
          `).join('')}
        </div>
      </div>`;
  }

  function claimsHtml(item, sourceIndex) {
    if (!item.claims?.length) return '';
    return `
      <div class="ehime-research-v2__block">
        <h4>資料から言えること</h4>
        <ul class="ehime-research-v2__claims">
          ${item.claims.map((claim) => `
            <li>
              <strong>${esc(claim.label)}</strong>
              <span>${esc(claim.text)}</span>
              <small>${claim.evidenceLevel === 'A' ? '具体的な資料で確認' : '資料・機関解説から確認'}</small>
              ${sourceLinksHtml(claim.sourceIds, sourceIndex)}
            </li>
          `).join('')}
        </ul>
      </div>`;
  }

  function followUpHtml(followUps) {
    if (!followUps.length) {
      return `<aside class="ehime-research-v2__followup"><strong>追加確認</strong><p>現在の監査表に未解決の追加確認事項はありません。</p></aside>`;
    }
    return `
      <aside class="ehime-research-v2__followup">
        <strong>まだ分からないこと</strong>
        <ul>${followUps.map((text) => `<li>${esc(text)}</li>`).join('')}</ul>
      </aside>`;
  }

  function sourceLinksHtml(sourceIds = [], sourceIndex) {
    const links = [...new Set(sourceIds)]
      .map((sourceId) => sourceIndex.get(sourceId))
      .filter((source) => source?.url)
      .map((source) => `<a class="ehime-research-v2__source-link" href="${attr(source.url)}" target="_blank" rel="noopener" title="${attr(source.title || '資料を開く')}">資料を見る</a>`);
    return links.length ? `<div class="ehime-research-v2__source-links">${links.join('')}</div>` : '';
  }

  function findSection(article, headingText) {
    return [...article.querySelectorAll('.detail-section')]
      .find((element) => element.querySelector('h3')?.textContent?.trim() === headingText);
  }

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function attr(value) {
    return esc(value).replaceAll('`', '&#096;');
  }
})();
