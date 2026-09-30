import { readdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const log = [];

// --- 1. env: import.meta.env -> process.env -------------------------------
const ENV_RE = /import\.meta\.env\.PROD\b/g;
const VITE_RE = /import\.meta\.env\.VITE_([A-Z0-9_]+)\b/g;

function transformEnv(src) {
  return src
    .replace(ENV_RE, 'process.env.NODE_ENV === "production"')
    .replace(VITE_RE, (_m, name) => `process.env.NEXT_PUBLIC_${name}`);
}

// --- 2. react-router -> Next navigation shim ------------------------------
const RR_RE = /from\s+['"]react-router(-dom)?['"]/g;

function transformRouter(src) {
  return src.replace(RR_RE, "from '@/lib/navigation'");
}

// --- 3. 'use client' directive -------------------------------------------
// Весь UI ранее рендерился на клиенте (Vite SPA), поэтому все компоненты
// помечаются как клиентские: поведение сохраняется без переписывания логики.
function withClientDirective(src) {
  if (/^\s*['"]use client['"]/.test(src)) return src;
  return `'use client';\n${src}`;
}

const componentsDir = join(ROOT, 'src/components');
for (const file of readdirSync(componentsDir)) {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
  const path = join(componentsDir, file);
  let src = readFileSync(path, 'utf8');
  const before = src;

  src = transformRouter(src);
  src = transformEnv(src);
  src = withClientDirective(src);

  if (src !== before) {
    writeFileSync(path, src);
    log.push(`components/${file}`);
  }
}

// --- 4. services / hooks / utils / data / types ---------------------------
for (const dir of ['services', 'hooks', 'utils', 'data', 'types']) {
  const abs = join(ROOT, 'src', dir);
  if (!existsSync(abs)) continue;
  for (const file of readdirSync(abs)) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const path = join(abs, file);
    const src = readFileSync(path, 'utf8');
    const next = transformEnv(src);
    if (next !== src) {
      writeFileSync(path, next);
      log.push(`${dir}/${file}`);
    }
  }
}

// --- 5. удалить Vite-специфичные файлы ----------------------------------
const obsolete = [
  join(ROOT, 'src/vite-env.d.ts'),
  join(ROOT, 'src/main.tsx'),
  join(ROOT, 'src/App.tsx'),
];
for (const f of obsolete) {
  if (existsSync(f)) {
    rmSync(f);
    log.push(`REMOVED ${f.replace(ROOT + '/', '')}`);
  }
}

console.log(log.join('\n'));
console.log(`\nchanged: ${log.length}`);
