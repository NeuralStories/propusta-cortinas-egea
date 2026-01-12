import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const publicImageDir = path.join(repoRoot, 'public', 'image');

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', 'public']);
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.html', '.md']);
const imagePathPattern = /\/?images?\/[^"'`\s)]+/g;
const imageExtPattern = /\.(png|jpe?g|svg|webp|gif)(\?|#|$)/i;

const readDirNames = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.map((entry) => entry.name);
};

const pathExistsWithCase = async (baseDir, relPath) => {
  let currentDir = baseDir;
  const parts = relPath.split('/').filter(Boolean);
  for (let i = 0; i < parts.length; i += 1) {
    const segment = parts[i];
    const names = await readDirNames(currentDir);
    if (!names.includes(segment)) {
      return false;
    }
    currentDir = path.join(currentDir, segment);
  }
  return true;
};

const extractImagePaths = (content) => {
  const matches = [];
  const seen = new Set();
  let match;
  while ((match = imagePathPattern.exec(content)) !== null) {
    const value = match[0];
    if (!imageExtPattern.test(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    matches.push(value);
  }
  return matches;
};

const scanFile = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  const rawMatches = extractImagePaths(content);
  return rawMatches.map((raw) => ({ filePath, raw }));
};

const walk = async (dir, results = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(entryPath, results);
      continue;
    }
    if (!SCAN_EXTENSIONS.has(path.extname(entry.name))) continue;
    const matches = await scanFile(entryPath);
    results.push(...matches);
  }
  return results;
};

const normalizeToRepoPath = (filePath) => path.relative(repoRoot, filePath);

const main = async () => {
  const matches = await walk(repoRoot);
  const invalidRelative = [];
  const missingFiles = [];

  for (const match of matches) {
    const raw = match.raw;
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
      continue;
    }

    if (!raw.startsWith('/image/')) {
      invalidRelative.push({
        file: normalizeToRepoPath(match.filePath),
        value: raw
      });
      continue;
    }

    const cleaned = raw.split(/[?#]/)[0].replace(/^\/image\//, '');
    if (!cleaned) {
      invalidRelative.push({
        file: normalizeToRepoPath(match.filePath),
        value: raw
      });
      continue;
    }

    const exists = await pathExistsWithCase(publicImageDir, cleaned);
    if (!exists) {
      missingFiles.push({
        file: normalizeToRepoPath(match.filePath),
        value: raw
      });
    }
  }

  if (invalidRelative.length === 0 && missingFiles.length === 0) {
    console.log('check:images OK');
    return;
  }

  console.error('check:images failed');
  if (invalidRelative.length > 0) {
    console.error('\nNon-absolute image paths (must start with /image/):');
    for (const item of invalidRelative) {
      console.error(`- ${item.file}: ${item.value}`);
    }
  }
  if (missingFiles.length > 0) {
    console.error('\nMissing or case-mismatched files in public/image:');
    for (const item of missingFiles) {
      console.error(`- ${item.file}: ${item.value}`);
    }
  }
  process.exitCode = 1;
};

main().catch((error) => {
  console.error('check:images failed with error');
  console.error(error);
  process.exitCode = 1;
});
