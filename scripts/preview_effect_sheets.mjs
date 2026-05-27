import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.env.USERPROFILE || "", ".codex", "generated_images");
const files = fs
  .readdirSync(root, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.join(entry.parentPath, entry.name))
  .filter((file) => fs.statSync(file).size > 0)
  .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)
  .slice(-40);

const effectSheetFiles = [];
for (const file of files) {
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

  const magentaRatio = magentaPixels / pixels;
  if (magentaRatio > 0.18) {
    effectSheetFiles.push(file);
  }
}

const selectedFiles = effectSheetFiles.slice(-10);

const thumbs = [];
for (let index = 0; index < selectedFiles.length; index += 1) {
  const label = Buffer.from(
    `<svg width="260" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="260" height="30" fill="white"/><text x="8" y="20" font-size="15" fill="black">${index}</text></svg>`
  );
  const image = await sharp(selectedFiles[index])
    .resize(240, 160, { fit: "contain", background: "#eeeeee" })
    .extend({ top: 30, bottom: 10, left: 10, right: 10, background: "#ffffff" })
    .composite([{ input: label, left: 0, top: 0 }])
    .png()
    .toBuffer();
  thumbs.push({ input: image, left: (index % 4) * 260, top: Math.floor(index / 4) * 200 });
}

fs.mkdirSync(path.join("public", "assets", "effects", "_preview"), { recursive: true });

await sharp({ create: { width: 1040, height: Math.ceil(selectedFiles.length / 4) * 200, channels: 4, background: "#dddddd" } })
  .composite(thumbs)
  .png()
  .toFile(path.join("public", "assets", "effects", "_preview", "effect_sheet_contact.png"));

selectedFiles.forEach((file, index) => {
  const stat = fs.statSync(file);
  console.log(`${index}\t${stat.mtime.toISOString()}\t${file}`);
});
