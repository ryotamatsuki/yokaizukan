$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sheetDir = 'C:\Users\Owner\.codex\generated_images\019e5095-6500-7be2-919f-a108641b9ba2'
$outDir = Join-Path $PSScriptRoot '..\public\assets\ehime\generated\children'
$sheetOutDir = Join-Path $outDir '_sheets'
New-Item -ItemType Directory -Force -Path $outDir, $sheetOutDir | Out-Null

$sheets = @(
  @{
    name = 'uwajima_ushioni_children'
    source = 'ig_022c7125a611c082016a14d60247288191aa9c2f591399ff3f.png'
    cols = 3
    rows = 2
    items = @('uwajima_ushioni', 'ushioni_matsuri', 'ushioni_buchi', 'warei_jinja_ushioni', 'yamabushi_ushioni')
  },
  @{
    name = 'matsuyama_tanuki_children'
    source = 'ig_022c7125a611c082016a14d6bf09188191ac2eb4c89edee066.png'
    cols = 3
    rows = 2
    items = @('inugami_gyobu', 'matsuyama_sodo_tanuki', 'happyakuya_tanuki', 'matsuyama_castle_tanuki', 'tanuki_bi', 'tanuki_bayashi')
  },
  @{
    name = 'iyo_basan_children'
    source = 'ig_022c7125a611c082016a14d7820b148191a569c7af3dc4469a.png'
    cols = 2
    rows = 2
    items = @('basan', 'basabasa', 'inuhoo', 'fire_breathing_bird')
  },
  @{
    name = 'ishizuchi_tengu_children'
    source = 'ig_022c7125a611c082016a14d7e079a481919df32a63d41faa2a.png'
    cols = 3
    rows = 2
    items = @('ishizuchi_tengu', 'tengudake_tengu', 'ishizuchi_yamagami', 'ishizuchi_shugen', 'ishizuchi_kaika', 'horagai_sound')
  },
  @{
    name = 'dogo_myth_children'
    source = 'ig_022c7125a611c082016a14d838313881918be233348a2a1024.png'
    cols = 3
    rows = 2
    items = @('dogo_shirasagi', 'sukunahikona_toji', 'okuninushi_dogo', 'tama_no_ishi', 'dogo_yugami')
  },
  @{
    name = 'ishiteji_emon_saburo_children'
    source = 'ig_022c7125a611c082016a14d894091c819196d1dafa1e45a2c8.png'
    cols = 2
    rows = 2
    items = @('emon_saburo', 'emon_saburo_rebirth', 'kobodaishi_legend', 'ishiteji_reiseki')
  },
  @{
    name = 'uwakai_sea_mystery_children'
    source = 'ig_022c7125a611c082016a14d979b6ec819192291cddd0a01c01.png'
    cols = 3
    rows = 2
    items = @('uwakai_funayurei', 'uwakai_umibozu', 'hiburijima_kairei', 'kushima_yobi', 'toshima_kairei')
  },
  @{
    name = 'setouchi_murakami_kaizoku_children'
    source = 'ig_022c7125a611c082016a14da3a98608191a268142bbcdae90d.png'
    cols = 3
    rows = 1
    items = @('murakami_kaizoku_ghost', 'noshima_yobi', 'kurushima_funayurei')
  },
  @{
    name = 'kihoku_oni_children'
    source = 'ig_022c7125a611c082016a14da8068d481919f8f2d351531b653.png'
    cols = 2
    rows = 2
    items = @('kihoku_oni', 'onigajo_oni', 'onio_maru', 'yukihime')
  },
  @{
    name = 'ehime_night_road_children'
    source = 'ig_022c7125a611c082016a14db4238488191adf0fc26c93bdad9.png'
    cols = 2
    rows = 2
    items = @('yosuzume', 'nobiagari', 'yukibaba', 'kane_no_kami_no_hi')
  }
)

foreach ($sheet in $sheets) {
  $sourcePath = Join-Path $sheetDir $sheet.source
  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source sheet not found: $sourcePath"
  }

  Copy-Item -LiteralPath $sourcePath -Destination (Join-Path $sheetOutDir "$($sheet.name).png") -Force

  $image = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $cols = [int]$sheet['cols']
    $rows = [int]$sheet['rows']
    $items = $sheet['items']
    $cellWidth = [int][Math]::Floor($image.Width / $cols)
    $cellHeight = [int][Math]::Floor($image.Height / $rows)

    for ($i = 0; $i -lt $items.Count; $i++) {
      $col = $i % $cols
      $row = [int][Math]::Floor($i / $cols)
      $x = $col * $cellWidth
      $y = $row * $cellHeight
      $w = if ($col -eq $cols - 1) { $image.Width - $x } else { $cellWidth }
      $h = if ($row -eq $rows - 1) { $image.Height - $y } else { $cellHeight }

      $bitmap = New-Object System.Drawing.Bitmap($w, $h)
      try {
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
          $graphics.DrawImage($image, 0, 0, (New-Object System.Drawing.Rectangle($x, $y, $w, $h)), [System.Drawing.GraphicsUnit]::Pixel)
        } finally {
          $graphics.Dispose()
        }
        $outPath = Join-Path $outDir "$($items[$i]).png"
        $bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $bitmap.Dispose()
      }
    }
  } finally {
    $image.Dispose()
  }
}

Write-Output "Cropped $($sheets.Count) source sheets into $outDir"
