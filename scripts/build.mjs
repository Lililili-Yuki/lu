import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';

execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-b'], {stdio:'inherit'});
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {stdio:'inherit'});
copyFileSync('dist/dev.html', 'dist/index.html');
// Keep the existing GitHub Pages branch/root publishing arrangement.
writeFileSync('index.html', readFileSync('dist/index.html', 'utf8').replaceAll('./assets/', './dist/assets/'));
