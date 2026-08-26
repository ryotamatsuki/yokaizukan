# 愛媛版 地理基盤データ provenance

更新日: 2026-08-26

## 1. 目的

愛媛ふしぎ伝承図鑑の地図について、AI生成背景画像に手動座標を重ねる構造から、実際の行政区域と緯度経度を同一投影で扱う構造へ移行する。

Phase Aでは本番地図を直ちに置き換えず、`ehime.html?mapDebug=1` の校正モードだけで20市町の行政区域と役所・役場アンカーを表示する。通常の `ehime.html` は既存地図を維持する。

## 2. 本番地理基盤の正本候補: 国土数値情報 N03

- データ: 国土数値情報 行政区域データ（N03）
- 提供: 国土交通省
- 対象: 愛媛県（都道府県コード38）
- データ基準年月日: 2026-01-01
- ファイル: `N03-20260101_38_GML.zip`
- 公式掲載ページ: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2026.html
- 公式ダウンロードURL: https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2026/N03-20260101_38_GML.zip
- 座標系: JGD2011
- 形状: 面
- 主な属性: 都道府県名、市区町村名、全国地方公共団体コード
- 使用許諾条件: 公式ページの表示では CC BY 4.0。原典に国土地理院の測量成果を含むため、公開時は国土地理院の利用手続案内も確認する。

取得物の再現性確認用として、外部の公開データパイプライン `TakashiSasaki/museum-yama-data` が同一公式URLから取得した2026年愛媛県版について、以下を記録している。

- raw ZIP SHA-256: `88061f7ae784bbdd7b81f514ea904dcef853645b6d477691c1ba31091ab41dbf`
- extracted GeoJSON: `N03-20260101_38.geojson`
- extracted GeoJSON SHA-256: `16e3af28d9af3a864922869826cec6bfe55adc11d51a81fbc2a12000555adc11`

Phase Bで本番地図へ移行する前に、公式N03成果物からWeb用GeoJSON/SVGを生成し、リポジトリへ固定する。ランタイムで第三者サービスへ依存する構成にはしない。

## 3. Phase Aの境界ブートストラップ

Phase Aの校正表示では、Geolonia `japanese-admins` の市町村別GeoJSON endpointを一時的に利用する。

- repository: https://github.com/geolonia/japanese-admins
- endpoint: `https://geolonia.github.io/japanese-admins/38/{municipalityCode}.json`
- 同repositoryのREADMEでは、国土交通省「国土数値情報（行政区域データ）」を加工して作成したデータと説明されている。

用途は `?mapDebug=1` の校正表示のみ。本番地図の正本にはしない。Phase Aの目的は、20市町を同一座標系で描画し、投影・レスポンシブ・アンカーの問題を先に発見することにある。

## 4. 20市町役所・役場アンカー

`public/data/ehime_municipality_anchors.json` に20市町の仮校正点を保存する。

Phase A初期値は、公開されている「全国市区町村の city code および役所の緯度経度」一覧（2025-11-28更新）を参照した。これらは `calibration_only` であり、伝承の公開位置には使用しない。

正式確認対象は国土数値情報「市町村役場等及び公的集会施設データ」（P05）2022年版とする。

- 公式掲載ページ: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-P05-2022.html
- 愛媛県ファイル: `P05-22_38_GML.zip`
- P05の施設分類1（本庁）を基本に照合する。

Phase B開始前に20件をP05または各自治体公式所在地と照合し、差異がある場合は `ehime_municipality_anchors.json` を更新する。

## 5. Phase A投影ルール

- 全20市町のGeoJSONとアンカーを同一projection関数へ通す。
- SVG viewBoxは `1000 760`。
- longitudeは平均緯度のcosで補正した簡易正距円筒系とし、全境界のboundsから一括fitする。
- SVGは `preserveAspectRatio="xMidYMid meet"` を使用し、縦横を別々に伸縮しない。
- 各役所・役場点について、対応する市町polygon内に入るか point-in-polygon で検証する。
- 位置確認のための番号・市町リストは校正モードだけに表示する。

この投影は図鑑上の相対位置表示を目的としたWeb表示用であり、測量成果として座標・距離・面積を提供する機能ではない。

## 6. Phase Aで変更しないもの

- 11伝承の `locationId`
- `public/data/locations.json` の既存座標・`mapPosition`
- 通常表示の `ehime_generated_map.png`
- オープニングの生成背景地図と11灯の手動配置

これらはPhase B/Cで、地理基盤の校正結果を確認してから移行する。

## 7. Phase A Hard Gate

- 愛媛県20市町のコード・名称が一意に揃う。
- 20件の校正アンカーが存在する。
- `?mapDebug=1` だけが新しい地理校正表示を有効化する。
- 20市町を単一SVG・単一projectionで描画する。
- 20アンカーのpolygon包含判定を画面上とE2Eで確認できる。
- 通常表示では11伝承の既存地図が維持される。
- desktop / 390px smartphoneの双方で校正マップを確認できる。
- Phase B開始前に公式N03 2026成果物のローカル固定とP05アンカー照合を完了する。
