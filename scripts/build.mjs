// Copies the static site into dist/ (functions/ stays at the project root, as Cloudflare Pages expects).
import { rmSync, mkdirSync, cpSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const f of ['index.html', 'styles.css', 'app.js', 'game.js']) cpSync(f, 'dist/' + f);
for (const d of ['admin', 'assets']) cpSync(d, 'dist/' + d, { recursive: true });
