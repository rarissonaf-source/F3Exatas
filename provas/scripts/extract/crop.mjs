import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

// Usage: node crop.mjs <input.png> <output.png> <left> <top> <width> <height>
const [, , input, output, left, top, width, height] = process.argv;

if (!input || !output || left === undefined) {
  console.error(
    "Usage: node crop.mjs <input.png> <output.png> <left> <top> <width> <height>"
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(output), { recursive: true });

sharp(input)
  .extract({
    left: parseInt(left, 10),
    top: parseInt(top, 10),
    width: parseInt(width, 10),
    height: parseInt(height, 10),
  })
  .png({ compressionLevel: 9 })
  .toFile(output)
  .then(() => console.log("cropped ->", output))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
