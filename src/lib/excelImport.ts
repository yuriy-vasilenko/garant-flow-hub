import * as XLSX from 'xlsx';
import type { Availability } from '@/types/product';

export type ExcelProductRow = {
  title: string;
  slug: string;
  categorySlug: string;
  subcategorySlug?: string;
  price?: number;
  status: Availability;
  description: string;
  image: string;
  featured: boolean;
};

const normKey = (k: string) =>
  k
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/ё/g, 'е');

function rowGet(row: Record<string, unknown>, aliases: string[]): string {
  const keys = Object.keys(row);
  const map = new Map<string, unknown>();
  for (const k of keys) {
    map.set(normKey(k), row[k]);
  }
  for (const a of aliases) {
    const v = map.get(normKey(a));
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s !== '') return s;
  }
  return '';
}

function parseStatus(raw: string): Availability {
  const s = raw.toLowerCase().trim();
  if (!s || s === 'available' || s === 'в наличии' || s === 'да' || s === '1') return 'available';
  if (s === 'check' || s === 'уточнить' || s === 'под заказ') return 'check';
  return 'available';
}

function parseFeatured(raw: string): boolean {
  const s = raw.toLowerCase().trim();
  return s === '1' || s === 'да' || s === 'yes' || s === 'true' || s === 'популярный';
}

function parsePrice(raw: string): number | undefined {
  if (!raw) return undefined;
  const n = Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/**
 * Читает первый лист Excel. Ожидаемые колонки (любой из вариантов названия):
 * - Название / title / наименование
 * - Slug / чпу (необязательно)
 * - Категория slug / category_slug / категория
 * - Подкатегория slug / subcategory_slug (необязательно)
 * - Цена / price (необязательно)
 * - Статус / status: available | check или «в наличии» | «уточнить»
 * - Описание / description (необязательно)
 * - Фото / image / url (необязательно)
 * - Популярный / featured: да/нет/1/0
 */
export function parseExcelProducts(buffer: ArrayBuffer): ExcelProductRow[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const out: ExcelProductRow[] = [];
  const usedSlugs = new Set<string>();

  for (const row of rows) {
    const title = rowGet(row, ['название', 'title', 'наименование', 'name', 'товар']);
    if (!title) continue;

    let slug = rowGet(row, ['slug', 'чпу', 'url_slug']);
    if (!slug) slug = slugify(title);
    slug = slugify(slug);
    if (!slug) continue;

    let unique = slug;
    let n = 1;
    while (usedSlugs.has(unique)) {
      unique = `${slug}-${n++}`;
    }
    usedSlugs.add(unique);
    slug = unique;

    const categorySlug = slugify(
      rowGet(row, ['категория_slug', 'category_slug', 'категория', 'category', 'кат_slug']),
    );
    if (!categorySlug) continue;

    const subRaw = rowGet(row, ['подкатегория_slug', 'subcategory_slug', 'подкатегория', 'subcategory']);
    const subcategorySlug = subRaw ? slugify(subRaw) : undefined;

    const price = parsePrice(rowGet(row, ['цена', 'price', 'стоимость']));
    const status = parseStatus(rowGet(row, ['статус', 'status', 'наличие']));
    const description = rowGet(row, ['описание', 'description', 'комментарий']);
    const image = rowGet(row, ['фото', 'image', 'url', 'картинка', 'ссылка_на_фото']) || 'https://placehold.co/600x600?text=Product';
    const featured = parseFeatured(rowGet(row, ['популярный', 'featured', 'избранное']));

    out.push({
      title,
      slug,
      categorySlug,
      subcategorySlug: subcategorySlug || undefined,
      price,
      status,
      description,
      image,
      featured,
    });
  }

  return out;
}
