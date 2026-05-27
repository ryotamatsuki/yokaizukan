import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const generatedRoot = path.join(process.env.USERPROFILE || "", ".codex", "generated_images");
const outRoot = path.join("public", "assets", "effects");
const sheetOutRoot = path.join(outRoot, "_sheets");

const sheets = [
  {
    category: "water",
    cols: 2,
    rows: 3,
    files: ["water_splash", "ripple", "water_drops", "water_spiral", "big_splash", "_water_mist_extra"]
  },
  {
    category: "wind",
    cols: 2,
    rows: 3,
    files: ["wind_swirl", "wind_tornado", "flying_leaves", "leaves", "feather", "feathers"]
  },
  {
    category: "impact",
    cols: 2,
    rows: 2,
    files: ["impact_burst", "dust", "dust_cloud", "shockwave"]
  },
  {
    category: "magic",
    cols: 2,
    rows: 2,
    files: ["spooky_trail", "stretch_shadow", "stretch_line", "sparkle_trail"]
  },
  {
    category: "cat",
    cols: 2,
    rows: 2,
    files: ["tail_trail", "pawprints", "pawprint_circle", "moon_sparkle"]
  },
  {
    category: "pop",
    cols: 2,
    rows: 2,
    files: ["jump_dust", "pop_mark", "paper_confetti", "star_pop"]
  },
  {
    category: "glow",
    cols: 2,
    rows: 2,
    files: ["lantern_glow", "warm_light", "lantern_light_burst", "warm_light_orbs"]
  },
  {
    category: "snow",
    cols: 2,
    rows: 2,
    files: ["snow_crystal", "snow_magic_circle", "ice_crystals", "cold_mist"]
  },
  {
    category: "wall",
    cols: 3,
    rows: 2,
    files: ["wall_shadow", "dust_slide", "wall_guard", "stone_dust", "impact_ring", "_pebble_sparkle_extra"]
  },
  {
    category: "bone",
    cols: 3,
    rows: 1,
    files: ["bone_fragments", "giant_shadow_soft", "moon_glow"]
  }
];

function listCandidateFiles() {
  return fs
    .readdirSync(generatedRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .filter((file) => fs.statSync(file).size > 0)
    .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)
    .slice(-40);
}

async function hasMagentaKey(file) {
  const { data, info } = await sharp(file)
    .resize(80, 80, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let magentaPixels = 0;
  const pixels = info.width * info.height;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    if (red > 210 && green < 80 && blue > 210) {
      magentaPixels += 1;
    }
  }

  return magentaPixels / pixels > 0.18;
}

async function keyedCellBuffer(input, extract) {
  const { data, info } = await sharp(input)
    .extract(extract)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const magentaDistance = Math.abs(red - 255) + Math.abs(green - 0) + Math.abs(blue - 255);

    if (red > 175 && green < 140 && blue > 175 && magentaDistance < 230) {
      data[offset + 3] = 0;
    }
  }

  return sharp(data, { raw: info })
    .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
}

fs.mkdirSync(outRoot, { recursive: true });
fs.mkdirSync(sheetOutRoot, { recursive: true });

const selectedSheets = [];
for (const file of listCandidateFiles()) {
  if (await hasMagentaKey(file)) {
    selectedSheets.push(file);
  }
}

const sources = selectedSheets.slice(-sheets.length);
if (sources.length !== sheets.length) {
  throw new Error(`Expected ${sheets.length} effect sheets, found ${sources.length}.`);
}

const written = [];
for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex += 1) {
  const sheet = sheets[sheetIndex];
  const source = sources[sheetIndex];
  const metadata = await sharp(source).metadata();
  const cellWidth = Math.floor(metadata.width / sheet.cols);
  const cellHeight = Math.floor(metadata.height / sheet.rows);
  const categoryDir = path.join(outRoot, sheet.category);
  fs.mkdirSync(categoryDir, { recursive: true });
  fs.copyFileSync(source, path.join(sheetOutRoot, `${sheet.category}_sheet.png`));

  for (let index = 0; index < sheet.files.length; index += 1) {
    const name = sheet.files[index];
    if (name.startsWith("_")) {
      continue;
    }

    const left = (index % sheet.cols) * cellWidth;
    const top = Math.floor(index / sheet.cols) * cellHeight;
    const width = index % sheet.cols === sheet.cols - 1 ? metadata.width - left : cellWidth;
    const height = Math.floor(index / sheet.cols) === sheet.rows - 1 ? metadata.height - top : cellHeight;
    const buffer = await keyedCellBuffer(source, { left, top, width, height });
    const outPath = path.join(categoryDir, `${name}.webp`);
    fs.writeFileSync(outPath, buffer);
    written.push(outPath.replaceAll("\\", "/"));
  }
}

console.log(`Wrote ${written.length} effect assets.`);
written.forEach((file) => console.log(file));
