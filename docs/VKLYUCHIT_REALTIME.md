# Как включить мгновенное обновление каталога (Supabase Realtime)

Сделайте **один раз** в своём проекте Supabase.

После **импорта** и **любой правки** в админке приложение **само** шлёт сигнал **Broadcast** `catalog_reload` (с небольшой задержкой при пакетном импорте), и все открытые вкладки/телефоны подтягивают каталог из БД. Дополнительно — опрос БД примерно раз в **20 секунд**. В проекте Supabase должен быть включён **Realtime**. SQL ниже — для событий **postgres_changes** по строкам таблиц.

## Шаг 1

Откройте [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект.

## Шаг 2

Слева: **SQL Editor** → **New query**.

## Шаг 3

Вставьте весь текст ниже и нажмите **Run** (или Ctrl+Enter).

```sql
-- Трансляция изменений каталога всем клиентам (Supabase Realtime / postgres_changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;
```

Должно выполниться без ошибки (можно запускать повторно — скрипт безопасный).

## Шаг 4

Перезагрузите сайт на телефоне и ПК. После правок в админке каталог у других обновится почти сразу (плюс у вас уже есть опрос раз в 60 секунд как запасной вариант).

---

**Альтернатива:** в папке проекта выполните `npm run realtime-sql` — в консоль выведется тот же SQL для копирования.
