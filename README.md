# Гарант Маркет (garant-flow-hub)

Каталог на **React + Vite + Supabase**. Данные общие для всех пользователей.

## Локальная разработка

1. `npm install`
2. Файл `.env` в корне проекта:
   - `VITE_SUPABASE_URL` — URL проекта Supabase
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — anon / publishable key
3. `npm run dev`

## Деплой на GitHub Pages

### Отправить код на GitHub одной командой (после настройки Git)

В корне проекта:

```bash
npm run ship
```

Со своим текстом коммита:

```bash
npm run ship -- "описание изменений"
```

После успешного `push` в **`main`** workflow сам соберёт сайт и выложит на Pages.

В **Settings → Secrets and variables → Actions** задайте:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Пуш в ветку **`main`** запускает workflow **Deploy to GitHub Pages** (см. `.github/workflows/deploy-pages.yml`).

Сайт: `https://<ваш-логин>.github.io/garant-flow-hub/` (базовый путь `/garant-flow-hub/` задан в `vite.config.ts`).

## Автообновление каталога у всех

В приложении уже есть:

- подписка **Supabase Realtime** на таблицы `categories` и `products`;
- **тихая перезагрузка** при возврате на вкладку;
- **опрос раз в ~20 секунд** — чтобы телефоны и вкладки подтягивали изменения даже без WebSocket.

### Включить Realtime в Supabase (рекомендуется, мгновенные обновления)

Пошагово: **[docs/VKLYUCHIT_REALTIME.md](./docs/VKLYUCHIT_REALTIME.md)** (скопировать SQL в SQL Editor).

Или в терминале проекта:

```bash
npm run realtime-sql
```

Скопируйте вывод и вставьте в Supabase → **SQL Editor** → **Run**.

Файл миграции: `supabase/migrations/20260322120000_realtime_catalog.sql`  
Либо CLI: `supabase db push` (если проект привязан).

## Админка

Вход на сайте: логин **admin**, пароль **admin** (см. код в `src/lib/adminAuth.ts`).  
Изменения товаров/категорий пишутся в Supabase (нужны политики RLS для `authenticated` и публичное чтение для витрины).
