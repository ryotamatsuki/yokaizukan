# 愛媛版 Geographic Base Phase A provenance

更新日: 2026-08-26

## 1. 目的と設計原則

愛媛ふしぎ伝承図鑑では、AI生成背景画像に手動座標を重ねる方式だけでは、市町・島嶼・寺社・山・海域・複数地点伝承を相互に正しい位置関係で比較できない。

Phase Aでは、行政区域と校正点を実緯度経度から同一projectionへ通す地理基盤を確立した。`ehime_generated_map.png` 等の生成画像は今後もtexture / atmosphereとして使用できるが、県形・市町境界・marker anchorの地理的正本にはしない。

通常の `ehime.html` は既存11伝承の見せ方を維持し、`ehime.html?geoDebug=1`（互換alias: `?mapDebug=1`）で20市町の行政区域と役所・役場本庁アンカーを検査できる。

## 2. 行政区域の正本: 国土数値情報 N03 2026

- 提供: 国土交通省 国土数値情報
- データ: 行政区域データ N03 2026年版
- 対象: 愛媛県（都道府県コード38）
- 基準日: 2026-01-01
- 公式ファイル: `N03-20260101_38_GML.zip`
- 公式URL: `https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2026/N03-20260101_38_GML.zip`
- 取得ZIP SHA-256: `88061f7ae784bbdd7b81f514ea904dcef853645b6d477691c1ba31091ab41dbf`
- 取得ZIP: 12,542,884 bytes
- 元GeoJSON: `N03-20260101_38.geojson` / 16,841,979 bytes
- ランタイム固定成果物: `public/data/geo/ehime-municipalities.geojson`
- metadata: `public/data/geo/ehime-municipalities.meta.json`

ブラウザ実行時には国土地理院、国交省、Geoloniaその他の外部GeoJSON endpointへアクセスしない。外部取得はメンテナンス時の生成scriptに限定する。

## 3. dissolve / simplification

`scripts/vendor_ehime_n03.py` が公式N03を取得し、以下の処理を行う。

1. `N03_007`（全国地方公共団体コード）で愛媛県20市町を抽出する。
2. municipality単位でdissolveする。Polygon / MultiPolygon / holeを維持する。
3. WGS84/JGD2011の度単位のまま簡略化せず、JGD2011 / 平面直角座標系IV `EPSG:6672` へ投影する。
4. Shapely `simplify(..., preserve_topology=True)` を用いる。
5. 5 / 10 / 15 / 20 / 25 / 50 / 75 / 100mを比較する。
6. polygon component維持、20/20役場包含、最大面積誤差0.1%以下をHard Gateとする。

選定結果は10m。

- dissolve直後 vertex count: 451,208
- 簡略化後 vertex count: 55,543
- vertex reduction: 87.690156%
- 最大面積誤差: 0.07295222182972971%
- 平均面積誤差: 0.010701718661439456%
- raw polygon components: 4,778
- simplified polygon components: 4,778
- component preservation: PASS
- 出力GeoJSON: 1,760,840 bytes

15m以上は最大面積誤差0.1%を満たさなかったため採用していない。閾値を緩和して軽量化するのではなく、地理精度を優先した。

松山市、今治市、宇和島市、上島町等の島嶼をMultiPolygonとして残し、全component数の同一性をCIで検査する。

## 4. 20市町役所・役場アンカー: 国土数値情報 P05 2022

`public/data/ehime_municipality_anchors.json` は、国土交通省「市町村役場等及び公的集会施設 P05 2022年版」を正本とする。

- 基準年月: 2022-04
- 愛媛県ファイル: `P05-22_38_GML.zip`
- 公式掲載ページ: `https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-P05-2022.html`
- 公式取得URL: `https://nlftp.mlit.go.jp/ksj/gml/data/P05/P05-22/P05-22_38_GML.zip`
- 取得ZIP SHA-256: `9187eca50edbb6a4e48e9d70d64d2ad3380b80d4d4069ea981a1bceccedecc61`
- 取得ZIP: 239,332 bytes
- 使用ファイル: `P05-22_38.geojson`
- 施設分類: `P05_002 = 1`（本庁）
- license: CC BY 4.0

`scripts/vendor_ehime_office_anchors.py` は現在の愛媛県20市町コードについて施設分類1が各1件だけ存在することを要求し、そのpoint・名称・所在地を固定する。

これらはprojectionのcontrol point / calibration anchorであり、妖怪・伝承地点の代替ではない。

## 5. 20/20 point-in-polygon Hard Gate

`scripts/validate_ehime_geographic_base.py` と `scripts/validate_ehime_geographic_base.mjs` は、固定済みP05本庁pointと固定済みN03 municipality geometryを読み、対応コードごとにpoint-in-polygonを行う。

Hard Gate:

- municipality geometry: 20/20
- municipality office anchor: 20/20
- point-in-polygon: 20/20
- Polygon / MultiPolygon以外: FAIL
- invalid geometry: FAIL
- raw/simplified component数不一致: FAIL
- 主要島嶼自治体のMultiPolygon消失: FAIL
- 選択simplificationの面積誤差上限超過: FAIL

19/20以下ではmergeしない。

## 6. projection / SVG

`js/ehime-map-debug.js` がローカルN03 GeoJSON全体から地理boundsを算出し、単一の `projectPoint(lng, lat)` を生成する。

同じ `projectPoint` を以下に適用する。

- municipality polygon
- municipality office marker
- 将来のlegend /伝承marker

SVG viewBoxは `1000 760`、`preserveAspectRatio="xMidYMid meet"`。表示paddingは42で、地理boundsとは別の値として扱う。旧 `mapPosition` や手書き `MAP_BOUNDS` を行政区域SVG・役場markerの別系統計算には使用しない。

表示用projectionは全座標の平均緯度を用いてlongitudeをcos補正し、GeoJSON全体をviewBoxへfitする。図鑑UI上の相対位置表示が目的であり、測量距離・面積計算用ではない。

## 7. debug / browser QA

`?geoDebug=1` または `?mapDebug=1` で以下を表示する。

- 愛媛県20市町境界
- 20市町役所・役場本庁anchor
- 市町名一覧
- 各anchorの区域内判定
- 20/20 status

Playwrightではdesktopと390px smartphoneの双方について、ローカルGeoJSONの200 response、20 geometry、20 anchor、SVG path、marker projected bounds、外部GeoJSON requestがないこと、console/page errorがないこと、スマートフォン横overflowがないこと、上島町等の島嶼部がDOM上で存在・操作できることを検査する。

## 8. 既存表示とのレイヤー関係

Phase Aでは通常表示の既存世界観を維持する。

1. generated image: 装飾・texture
2. geographic SVG: N03を正本とする地理レイヤー（Phase Aではdebug表示）
3. marker layer: 共通projection上のpoint（Phase AではP05 calibration anchors）

既存11伝承を役場へ一律移動しない。

## 9. 石鎚山座標の修正

`public/data/locations.json` の石鎚山・天狗岳は、旧 `33.21, 133.06` を廃止し、国土地理院の天狗岳座標 N33°46′04″ / E133°06′54″ に対応する `33.767778, 133.115` へ修正した。

この修正以外はPhase Aで11伝承すべてのlocation precision調査へ拡張しない。

## 10. Phase Bへの接続

Phase Bでは11伝承ごとにlocation precisionを整理する。

- exact
- site
- municipality
- regional
- broad historical area
- multiple locations

道後温泉・石手寺・石鎚山等の実地点、宇和島牛鬼等の代表地点、伊予の婆さん等の歴史的広域、宇和海怪異等の海域を区別し、今回確立した `lng/lat -> projectPoint()` 基盤へ載せ替える。

役場anchorはPhase Bでも校正用のままであり、伝承位置として流用しない。
