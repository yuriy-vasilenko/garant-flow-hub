/**
 * Печатает SQL для включения Realtime каталога.
 * Запуск: npm run realtime-sql
 * Скопируйте вывод → Supabase → SQL Editor → Run
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const migration = join(root, 'supabase', 'migrations', '20260322120000_realtime_catalog.sql');

console.log(readFileSync(migration, 'utf8'));
