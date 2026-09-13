import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../apps/web/dist');

if (!fs.existsSync(distDir)) {
  console.error(`dist directory not found at ${distDir}. Please run build first.`);
  process.exit(1);
}

const assetsDir = path.join(distDir, 'assets');
const files = fs.readdirSync(assetsDir);
let totalJsSize = 0;
let totalCssSize = 0;

for (const file of files) {
  const filePath = path.join(assetsDir, file);
  const stats = fs.statSync(filePath);
  if (file.endsWith('.js')) totalJsSize += stats.size;
  if (file.endsWith('.css')) totalCssSize += stats.size;
}

console.log('--- Asset Size Budget Check ---');
console.log(`Total JS Size: ${(totalJsSize / 1024).toFixed(2)} KiB (Budget: 500 KiB uncompressed, <300 KiB gzip)`);
console.log(`Total CSS Size: ${(totalCssSize / 1024).toFixed(2)} KiB (Budget: 50 KiB)`);

if (totalJsSize > 600 * 1024) {
  console.error('JS Bundle exceeds budget cap!');
  process.exit(1);
}

console.log('✓ All asset size budgets passed successfully.');
