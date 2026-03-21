/**
 * Одна команда: закоммитить все изменения и отправить в origin (main) → GitHub Actions задеплоит Pages.
 *
 *   npm run ship
 *   npm run ship -- "сообщение коммита"
 *
 * Нужны: установленный Git, настроенный remote, права push.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    ...opts,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status ?? 1;
}

if (!existsSync(join(root, '.git'))) {
  console.error(`
В этой папке нет Git-репозитория (.git).

Сделайте один раз:
  cd "${root}"
  git init
  git remote add origin https://github.com/ВАШ_ЛОГИН/garant-flow-hub.git
  git branch -M main
  git add .
  git commit -m "Первый коммит"
  git push -u origin main

Дальше можно использовать: npm run ship
`);
  process.exit(1);
}

const msg = process.argv.slice(2).join(' ').trim() || 'deploy: обновление сайта';

if (run('git', ['add', '-A']) !== 0) process.exit(1);

const st = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: root });
if (st.status === 0) {
  console.log('Нет изменений для коммита. Если нужен только деплой — сделайте пустой коммит:');
  console.log('  git commit --allow-empty -m "chore: redeploy" && git push origin main');
  process.exit(0);
}

if (run('git', ['commit', '-m', msg]) !== 0) process.exit(1);

const branch =
  spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout?.trim() ||
  'main';

console.log(`\n→ git push origin ${branch} …\n`);
if (run('git', ['push', 'origin', branch]) !== 0) {
  console.error('\nPush не удался. Проверьте: git remote -v, вход в GitHub (token/SSH).');
  process.exit(1);
}

console.log('\nГотово. Откройте GitHub → Actions → дождитесь «Deploy to GitHub Pages».');
process.exit(0);
