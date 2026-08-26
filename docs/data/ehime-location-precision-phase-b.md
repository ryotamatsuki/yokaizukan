# Ehime Geographic Base Phase B — Legend Location Precision

Verified: 2026-08-27

## Purpose

Phase A fixed the geographic frame: N03 2026 municipality polygons, P05 2022 main-office control points, 20/20 containment, local GeoJSON, and one N03-derived `projectPoint(lng, lat)` projection. Phase B does not replace that frame. It gives the 11 legends explicit location semantics and renders their geographic anchors through the same Phase A projection.

The generated Ehime image remains an atmospheric/texture layer. It is not a geographic authority.

## Precision model

- `exact`: a source supports a specific point such as a monument, spring, cave, or similarly narrow feature.
- `site`: the tradition is tied to an identifiable site such as a temple or hot spring. A site anchor does not imply that every episode occurred at one coordinate.
- `locality`: an island, settlement, district, old village, or similarly bounded locality is supported, but not an exact point within it.
- `municipality`: only a present municipality can be supported.
- `regional`: a wider mountain area, old district, coastal zone, or multi-municipality region is the supported unit.
- `broad_historical_area`: the source names a historical space such as Iyo Province but does not support a modern municipality or point.
- `marine`: the meaningful geography is sea/coastal water, not a municipal land point.
- `multiple_locations`: independent source-backed places belong to the same displayed legend.

The initial Phase B inventory needs no `exact` or `municipality` record. Not forcing every legend into those classes is intentional.

## Point semantics

`locationPrecision` describes what the evidence supports. `coordinateRole` describes why a coordinate exists.

- `exact`: an evidence-supported narrow occurrence point.
- `site_anchor`: a real named site used as a geographic anchor.
- `representative`: a cartographic point used to make a regional, historical, marine, locality, or multiple-location legend selectable.
- `multiple_site`: an individual source-backed site inside a multiple-location record.

A `representativePoint` with `cartographicOnly: true` must never be read as the occurrence point of the tradition. It is not a substitute city hall, station, or arbitrary modern POI. The evidence and interpretation are recorded separately in `public/data/ehime_location_evidence.json`.

## Canonical 11-location audit

| Legend | Precision | Geographic scope | Coordinate role | Render coordinate | Municipality | Evidence | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 宇和島・南予の牛鬼 | multiple_locations | 吉田町泉ヶ森の牛鬼塚 + 南予の祭礼 | representative | 33.2289, 132.5662 | 宇和島市ほか | 宇和島市公式 + 『伊予の民俗』牛鬼記録 | high |
| 松山騒動八百八狸 | multiple_locations | 南堀端・毘沙門坂・大宮八幡神社・久谷町等 | representative | 33.8456, 132.7656 | 松山市 | 松山市公式FAQ + 国会図書館レファレンス | high |
| 『絵本百物語』の伊予の怪鳥・波山 | broad_historical_area | 伊予国・「伊予の山中」 | representative | 33.62, 132.86 | 特定不可 | 1841年『絵本百物語』 | high |
| 石鎚山をすみかとする天狗 | regional | 石鎚山・山麓 | site_anchor (天狗岳) | 33.767778, 133.115 | 西条市・久万高原町ほか | 石鎚神社公式 + 国土地理院 + 民俗記録 | high |
| 道後温泉の白鷺と玉の石 | site | 道後温泉 | site_anchor | 33.8521, 132.7863 | 松山市 | 道後温泉公式 + 松山市文化財資料 | high |
| 石手寺と衛門三郎 | site | 石手寺 | site_anchor | 33.8469, 132.7967 | 松山市 | 公共図書館レファレンス + 松山市文化財資料 | high |
| 宇和海の船幽霊と陰火 | marine | 宇和海・日振島方面・蒋淵―戸島間海上 | representative | 33.1414, 132.4225 | 宇和海沿岸 | 愛媛県史 + 『伊予の民俗』船幽霊記録 | high |
| 鬼北の鬼王段三郎 | multiple_locations | 等妙寺旧境内 + 松野町目黒 | site_anchor (等妙寺旧境内) | 33.226667, 132.676111 | 鬼北町・松野町 | 鬼北町公式・史跡資料 | high |
| 夜雀 | regional | 南宇和郡・愛南周辺 | representative | 32.965, 132.58 | 愛南町周辺 | 南宇和郡の民俗採集記録 | high |
| 伸上り | multiple_locations | 宇和島市下波 + 西予市の記録 | representative | 33.242, 132.703 | 宇和島市・西予市 | 下波村聞書 + 西予市の別民俗記録 | high |
| 怒和島の歳徳神の火 | locality | 怒和島 | representative | 33.98325, 132.54742 | 松山市 | 『綜合日本民俗語彙』書誌・登録記録 | medium |

Coordinates marked `representative` are display anchors and do not increase the evidentiary precision of their legend.

## Evidence policy

Location claims prioritize official national/prefectural/municipal sources, libraries, institutional records, and directly addressable folklore records. Search-result pages are discovery aids only. `public/data/ehime_location_evidence.json` records the location-specific interpretation separately from the article evidence, including source title, URL, source type, evidence summary, confidence and notes.

The lowest-confidence record is the Nuwa Island New Year fire (`kane_no_kami_no_hi`). The registered dictionary establishes Nuwa Island and the position relative to an unnamed tutelary shrine, but the original collection record and shrine identity remain unresolved. It is therefore `locality`, not `site` or `exact`.

## Projection and runtime contract

The geographic authority is `public/data/geo/ehime-municipalities.geojson`. Production `js/ehime.js` loads that local N03 dataset directly and computes the normal-view legend marker positions with the Phase A N03-derived projection. It does not use `MAP_BOUNDS`, legacy `mapPosition`, image-relative geographic offsets, or a fallback manual percentage position.

The geographic path is therefore:

`lng / lat` → N03-derived `projectPoint(lng, lat)` → projected SVG/map coordinates.

`MARKER_LABEL_OFFSETS` remains only as a visual label displacement after the geographic anchor has been projected. It is not geographic data and does not alter the canonical anchor.

`js/ehime-map-debug.js` uses the same local N03 geometry and projection parameters to overlay the 20 municipality polygons, 20 P05 office anchors and 11 Phase B legend anchors for inspection. The generated background image remains decorative and never determines marker coordinates.

Final marker DOM is required to expose:

- `data-projection-source="local-n03-2026"`
- `data-location-precision`
- `data-coordinate-role`
- finite projected X/Y

The map and marker layer expose Phase B/common-projection contracts that Playwright verifies.

## Validation semantics

`validate_ehime_location_precision.py` is precision-aware rather than requiring every point to lie on municipal land.

- all 11 legends must have a valid precision and evidence ledger entry;
- every named modern municipality must exist in the N03 20-municipality set;
- `site` anchors must lie inside their named municipality;
- representative points for regional/broad/marine/locality records must be explicitly cartographic-only;
- `marine` representative points must not lie on N03 municipal land;
- `multiple_locations` must name at least two places;
- legacy `mapPosition`, hard-coded `MAP_BOUNDS`, and `projectMapPosition()` are forbidden from the production Phase B geographic path;
- the Phase B Desktop/390px Playwright spec must be wired into both Ehime and full E2E commands;
- Phase A 20/20 office containment remains a separate mandatory gate.

Thus a marine point outside a municipality is correct behavior, not a validation exception.

## UI and debug

Normal markers expose their precision in accessible descriptions/titles. Non-site precision classes receive a subtle dashed outline rather than being styled as exact sites. `?geoDebug=1` and the existing `?mapDebug=1` alias show:

- N03 20 municipality polygons;
- P05 20 office anchors;
- all 11 legend anchors;
- legend name, precision class and coordinate role.

All are drawn against the same N03-derived geographic frame.

## Phase C boundary

Phase B deliberately stops at point/site/multiple-location semantics and representative anchors. A future Phase C can add fuzzy regional polygons, historical-region polygons, marine polygons, multiple-location visualization, confidence visualization, temporal layers and spatial clustering without changing the Phase B distinction between evidence precision and display coordinates.
