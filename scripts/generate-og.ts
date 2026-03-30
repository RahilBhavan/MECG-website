/**
 * Writes public/og.png (1200×630) for Open Graph / Twitter cards.
 * Run: bun run scripts/generate-og.ts
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(import.meta.dirname, "..", "public");
const outPath = path.join(publicDir, "og.png");

const width = 1200;
const height = 630;
const bg = "#111111";
const accent = "#c9a962";

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect x="64" y="64" width="${width - 128}" height="${height - 128}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/>
  <text x="80" y="280" font-family="Georgia, serif" font-size="72" font-weight="600" fill="#fafafa">MECG</text>
  <text x="80" y="360" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" fill="#b8b8b8" letter-spacing="0.12em">MICHIGAN ECONOMICS CONSULTING GROUP</text>
  <text x="80" y="480" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" fill="${accent}" opacity="0.9">Apply · Review · Network</text>
</svg>
`;

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

await sharp(Buffer.from(svg)).png().toFile(outPath);
console.log("Wrote", outPath);
