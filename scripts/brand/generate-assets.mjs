#!/usr/bin/env node
/**
 * Brand Asset Generator
 * Converts SVGs to required raster formats using sharp
 * Run with: node scripts/brand/generate-assets.mjs
 */

import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const BRAND_DIR = path.resolve('./public/brand');
const ASSETS_DIR = BRAND_DIR;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function generateAssets() {
  console.log('Generating brand raster assets...');

  // Read the symbol SVG
  const symbolSvg = await fs.readFile(path.join(BRAND_DIR, 'logo-symbol.svg'));
  const horizontalSvg = await fs.readFile(path.join(BRAND_DIR, 'logo-horizontal.svg'));
  const stackedSvg = await fs.readFile(path.join(BRAND_DIR, 'logo-stacked.svg'));
  const reversedSvg = await fs.readFile(path.join(BRAND_DIR, 'logo-reversed.svg'));
  const monoSvg = await fs.readFile(path.join(BRAND_DIR, 'logo-mono-black.svg'));

  // 1. favicon.ico (16, 32, 48)
  console.log('Creating favicon.ico...');
  await sharp(symbolSvg, { density: 300 })
    .resize(16, 16, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon-16.png'));
  
  await sharp(symbolSvg, { density: 300 })
    .resize(32, 32, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon-32.png'));
  
  await sharp(symbolSvg, { density: 300 })
    .resize(48, 48, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon-48.png'));

  // Create ICO from multiple sizes - write individual PNGs then use a simple ICO creator
  // For now, just use the 32x32 as favicon.ico (most browsers support PNG favicon)
  await sharp(symbolSvg, { density: 300 })
    .resize(32, 32, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.ico'));

  // 2. favicon.svg (copy symbol)
  await fs.copyFile(
    path.join(BRAND_DIR, 'logo-symbol.svg'),
    path.join(ASSETS_DIR, 'favicon.svg')
  );

  // 3. apple-touch-icon.png (180x180)
  console.log('Creating apple-touch-icon.png...');
  await sharp(horizontalSvg, { density: 300 })
    .resize(180, 180, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'apple-touch-icon.png'));

  // 4. icon-192.png
  console.log('Creating icon-192.png...');
  await sharp(horizontalSvg, { density: 300 })
    .resize(192, 192, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon-192.png'));

  // 5. icon-512.png
  console.log('Creating icon-512.png...');
  await sharp(horizontalSvg, { density: 300 })
    .resize(512, 512, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon-512.png'));

  // 6. icon-maskable-512.png (symbol in 80% safe zone on cream)
  console.log('Creating icon-maskable-512.png...');
  const maskableSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <rect width="512" height="512" fill="#F6F1E7"/>
      <g transform="translate(51, 51) scale(6.4)">
        <rect x="8" y="12" width="40" height="4" fill="#111111" rx="2"/>
        <rect x="8" y="28" width="30" height="4" fill="#111111" rx="2"/>
        <rect x="8" y="44" width="20" height="4" fill="#C2410C" rx="2"/>
      </g>
    </svg>
  `;
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon-maskable-512.png'));

  // 7. og-image.png (1200x630, cream, horizontal logo large + tagline)
  console.log('Creating og-image.png...');
  const ogSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
      <rect width="1200" height="630" fill="#F6F1E7"/>
      <!-- Horizontal logo centered -->
      <g transform="translate(180, 155) scale(2.5)">
        <rect x="8" y="12" width="40" height="4" fill="#111111" rx="2"/>
        <rect x="8" y="28" width="30" height="4" fill="#111111" rx="2"/>
        <rect x="8" y="44" width="20" height="4" fill="#C2410C" rx="2"/>
      </g>
      <g transform="translate(380, 160)" fill="#111111">
        <path d="M0 8 C0 2 6 -4 12 -4 L32 -4 C38 -4 44 2 44 8 L44 48 C44 54 38 60 32 60 L12 60 C6 60 0 54 0 48 Z M0 8 L0 48" stroke="#111111" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M12 -4 L32 -4" stroke="#111111" stroke-width="6" stroke-linecap="round"/>
        <path d="M12 60 L32 60" stroke="#111111" stroke-width="6" stroke-linecap="round"/>
        <path d="M52 -4 L52 56" stroke="#111111" stroke-width="6" stroke-linecap="round"/>
        <path d="M52 28 C52 22 58 16 64 16 L80 16 C86 16 92 22 92 28 L92 56" stroke="#111111" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M100 28 C100 16 110 6 122 6 C134 6 144 16 144 28 C144 40 134 50 122 50 C110 50 100 40 100 28 Z" stroke="#111111" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M156 -4 L156 56" stroke="#111111" stroke-width="6" stroke-linecap="round"/>
        <path d="M156 28 L172 6" stroke="#111111" stroke-width="6" stroke-linecap="round"/>
        <path d="M156 28 L172 50" stroke="#111111" stroke-width="6" stroke-linecap="round"/>
        <path d="M184 8 L184 48 C184 54 190 60 196 60 L208 60 C214 60 220 54 220 48 L220 8" stroke="#111111" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M232 -4 L232 56" stroke="#111111" stroke-width="6" stroke-linecap="round"/>
        <path d="M232 8 C232 0 238 -4 244 -4 L256 -4 C262 -4 268 0 268 8 C268 16 262 22 256 22 L244 22" stroke="#111111" stroke-width="6" stroke-linecap="round" fill="none"/>
      </g>
      <g transform="translate(380, 250)" fill="#9A958A" font-family="Inter, sans-serif" font-size="28" font-weight="500" letter-spacing="0.04em">
        <text x="0" y="0">System</text>
      </g>
      <!-- Tagline -->
      <text x="600" y="420" font-family="Inter, sans-serif" font-size="28" font-weight="400" fill="#5C5850" text-anchor="middle">Marks to decisions, instantly.</text>
    </svg>
  `;
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(ASSETS_DIR, 'og-image.png'));

  // 8. safari-pinned-tab.svg (single colour - monochrome symbol)
  console.log('Creating safari-pinned-tab.svg...');
  await fs.copyFile(
    path.join(BRAND_DIR, 'logo-mono-black.svg'),
    path.join(ASSETS_DIR, 'safari-pinned-tab.svg')
  );

  // Also create WebP versions for better compression
  console.log('Creating WebP versions...');
  await sharp(symbolSvg, { density: 300 })
    .resize(192, 192, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .webp({ quality: 85 })
    .toFile(path.join(ASSETS_DIR, 'icon-192.webp'));

  await sharp(symbolSvg, { density: 300 })
    .resize(512, 512, { fit: 'contain', background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .webp({ quality: 85 })
    .toFile(path.join(ASSETS_DIR, 'icon-512.webp'));

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .webp({ quality: 85 })
    .toFile(path.join(ASSETS_DIR, 'og-image.webp'));

  console.log('All assets generated successfully!');
  console.log('');
  console.log('Generated files:');
  const files = await fs.readdir(ASSETS_DIR);
  for (const file of files.sort()) {
    const stats = await fs.stat(path.join(ASSETS_DIR, file));
    console.log(`  ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
}

generateAssets().catch(console.error);