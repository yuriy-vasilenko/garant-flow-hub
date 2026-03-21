import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Category, Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type CategoryInput = Omit<Category, 'id' | 'productCount'>;
type ProductInput = Omit<Product, 'id'>;

interface CatalogContextValue {
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  /** Сообщение об ошибке загрузки из Supabase (каталог общий для всех пользователей) */
  catalogError: string | null;
  addCategory: (payload: CategoryInput) => Promise<{ ok: boolean; message?: string }>;
  updateCategory: (id: string, payload: CategoryInput) => Promise<{ ok: boolean; message?: string }>;
  deleteCategory: (id: string) => Promise<{ ok: boolean; message?: string }>;
  addProduct: (payload: ProductInput) => Promise<{ ok: boolean; message?: string }>;
  updateProduct: (id: string, payload: ProductInput) => Promise<{ ok: boolean; message?: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; message?: string }>;
  /** Полная перезагрузка с индикатором загрузки (первая загрузка, кнопка «Повторить») */
  refreshCatalog: () => Promise<void>;
  /**
   * Сигнал всем открытым вкладкам/браузерам: немедленно перезагрузить каталог из БД.
   * Нужен после массового импорта (Realtime postgres_changes может не успеть или быть отключён).
   */
  broadcastCatalogReload: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

const normalizeCategories = (items: Category[], products: Product[]): Category[] =>
  items.map(category => ({
    ...category,
    productCount: products.filter(product => product.categorySlug === category.slug).length,
  }));

const toJson = (value: unknown): Json => value as Json;

const REALTIME_DEBOUNCE_MS = 450;
const VISIBILITY_REFRESH_MIN_MS = 8000;
/** Частый опрос — если у кого-то не сработал WebSocket, данные подтянутся за ~20 с */
const POLL_CATALOG_MS = 20_000;
/** После пакетного импорта — одна рассылка всем, а не на каждую строку */
const BROADCAST_NOTIFY_DEBOUNCE_MS = 500;

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const realtimeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastNotifyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVisibilityRefreshRef = useRef(0);
  const catalogChannelRef = useRef<RealtimeChannel | null>(null);

  /** Однократно убираем старые ключи локального режима у пользователей, которые его включали */
  useEffect(() => {
    try {
      localStorage.removeItem('garant_force_local_catalog');
      localStorage.removeItem('garant_catalog_v1');
    } catch {
      /* ignore */
    }
  }, []);

  const loadCatalog = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    if (!silent) {
      setIsLoading(true);
      setCatalogError(null);
    }

    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from('categories').select('*').order('title', { ascending: true }),
      supabase.from('products').select('*').order('title', { ascending: true }),
    ]);

    if (categoriesRes.error || productsRes.error) {
      const msg =
        categoriesRes.error?.message ||
        productsRes.error?.message ||
        'Не удалось загрузить каталог из Supabase. Проверьте VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY и политики RLS.';
      if (!silent) {
        setCatalogError(msg);
        setCategories([]);
        setProducts([]);
      }
      if (!silent) setIsLoading(false);
      return;
    }

    const mappedCategories: Category[] = categoriesRes.data.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      icon: item.icon,
      productCount: 0,
      subcategories: Array.isArray(item.subcategories) ? (item.subcategories as Category['subcategories']) : [],
    }));

    const categoryMap = new Map(mappedCategories.map(category => [category.slug, category.title]));
    const mappedProducts: Product[] = productsRes.data.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      categorySlug: item.category_slug,
      category: categoryMap.get(item.category_slug) || item.category_slug,
      subcategorySlug: item.subcategory_slug || undefined,
      price: item.price ?? undefined,
      status: item.status as Product['status'],
      image: item.image,
      images: Array.isArray(item.images) ? (item.images as string[]) : undefined,
      specs: item.specs && typeof item.specs === 'object' ? (item.specs as Record<string, string>) : {},
      description: item.description,
      featured: item.featured,
    }));

    const nc = normalizeCategories(mappedCategories, mappedProducts);
    setCategories(nc);
    setProducts(mappedProducts);
    setCatalogError(null);
    if (!silent) setIsLoading(false);
  }, []);

  const scheduleSilentReload = useCallback(() => {
    if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
    realtimeDebounceRef.current = setTimeout(() => {
      realtimeDebounceRef.current = null;
      void loadCatalog({ silent: true });
    }, REALTIME_DEBOUNCE_MS);
  }, [loadCatalog]);

  const refreshCatalog = useCallback(() => loadCatalog({ silent: false }), [loadCatalog]);

  const broadcastCatalogReload = useCallback(async () => {
    const ch = catalogChannelRef.current;
    if (!ch) {
      void loadCatalog({ silent: true });
      return;
    }
    const { error } = await ch.send({
      type: 'broadcast',
      event: 'catalog_reload',
      payload: { t: Date.now() },
    });
    if (error) {
      console.warn('broadcast catalog_reload:', error.message);
      void loadCatalog({ silent: true });
    }
  }, [loadCatalog]);

  /** После любой успешной записи в каталог — уведомить остальные вкладки/телефоны (debounce для импорта) */
  const scheduleNotifyOtherClients = useCallback(() => {
    if (broadcastNotifyDebounceRef.current) clearTimeout(broadcastNotifyDebounceRef.current);
    broadcastNotifyDebounceRef.current = setTimeout(() => {
      broadcastNotifyDebounceRef.current = null;
      void broadcastCatalogReload();
    }, BROADCAST_NOTIFY_DEBOUNCE_MS);
  }, [broadcastCatalogReload]);

  useEffect(() => {
    void loadCatalog({ silent: false });
  }, [loadCatalog]);

  /** Realtime: postgres_changes + broadcast «перезагрузить каталог» (после импорта и т.п.) */
  useEffect(() => {
    catalogChannelRef.current = null;
    const channel = supabase
      .channel('catalog-sync', {
        /** Отправитель уже сделал loadCatalog после записи — не дублировать перезагрузку */
        config: { broadcast: { self: false } },
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => scheduleSilentReload(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => scheduleSilentReload(),
      )
      .on('broadcast', { event: 'catalog_reload' }, () => {
        void loadCatalog({ silent: true });
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') catalogChannelRef.current = channel;
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') catalogChannelRef.current = null;
      });

    return () => {
      if (realtimeDebounceRef.current) {
        clearTimeout(realtimeDebounceRef.current);
        realtimeDebounceRef.current = null;
      }
      if (broadcastNotifyDebounceRef.current) {
        clearTimeout(broadcastNotifyDebounceRef.current);
        broadcastNotifyDebounceRef.current = null;
      }
      catalogChannelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [scheduleSilentReload, loadCatalog]);

  /** После сворачивания вкладки / разблокировки телефона — подтянуть актуальный каталог */
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastVisibilityRefreshRef.current < VISIBILITY_REFRESH_MIN_MS) return;
      lastVisibilityRefreshRef.current = now;
      void loadCatalog({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [loadCatalog]);

  /** Резервное обновление по таймеру (телефон, вкладки без WebSocket и т.п.) */
  useEffect(() => {
    const id = window.setInterval(() => {
      void loadCatalog({ silent: true });
    }, POLL_CATALOG_MS);
    return () => window.clearInterval(id);
  }, [loadCatalog]);

  const addCategory = async (payload: CategoryInput) => {
    const { error } = await supabase.from('categories').insert({
      slug: payload.slug,
      title: payload.title,
      description: payload.description,
      icon: payload.icon,
      subcategories: toJson(payload.subcategories || []),
    });
    if (error) return { ok: false, message: error.message };
    await loadCatalog({ silent: true });
    scheduleNotifyOtherClients();
    return { ok: true };
  };

  const updateCategory = async (id: string, payload: CategoryInput) => {
    const { error } = await supabase
      .from('categories')
      .update({
        slug: payload.slug,
        title: payload.title,
        description: payload.description,
        icon: payload.icon,
        subcategories: toJson(payload.subcategories || []),
      })
      .eq('id', id);
    if (error) return { ok: false, message: error.message };
    await loadCatalog({ silent: true });
    scheduleNotifyOtherClients();
    return { ok: true };
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(item => item.id === id);
    if (!category) return { ok: false, message: 'Категория не найдена' };

    const hasProducts = products.some(product => product.categorySlug === category.slug);
    if (hasProducts) {
      return { ok: false, message: 'Сначала удалите товары из этой категории' };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { ok: false, message: error.message };
    await loadCatalog({ silent: true });
    scheduleNotifyOtherClients();
    return { ok: true };
  };

  const addProduct = async (payload: ProductInput) => {
    const { error } = await supabase.from('products').insert({
      slug: payload.slug,
      title: payload.title,
      category_slug: payload.categorySlug,
      subcategory_slug: payload.subcategorySlug || null,
      price: payload.price ?? null,
      status: payload.status,
      image: payload.image,
      images: toJson(payload.images || []),
      specs: toJson(payload.specs),
      description: payload.description,
      featured: Boolean(payload.featured),
    });
    if (error) return { ok: false, message: error.message };
    await loadCatalog({ silent: true });
    scheduleNotifyOtherClients();
    return { ok: true };
  };

  const updateProduct = async (id: string, payload: ProductInput) => {
    const { error } = await supabase
      .from('products')
      .update({
        slug: payload.slug,
        title: payload.title,
        category_slug: payload.categorySlug,
        subcategory_slug: payload.subcategorySlug || null,
        price: payload.price ?? null,
        status: payload.status,
        image: payload.image,
        images: toJson(payload.images || []),
        specs: toJson(payload.specs),
        description: payload.description,
        featured: Boolean(payload.featured),
      })
      .eq('id', id);
    if (error) return { ok: false, message: error.message };
    await loadCatalog({ silent: true });
    scheduleNotifyOtherClients();
    return { ok: true };
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { ok: false, message: error.message };
    await loadCatalog({ silent: true });
    scheduleNotifyOtherClients();
    return { ok: true };
  };

  const value = useMemo<CatalogContextValue>(
    () => ({
      categories: normalizeCategories(categories, products),
      products,
      isLoading,
      catalogError,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshCatalog,
      broadcastCatalogReload,
    }),
    [categories, products, isLoading, catalogError, refreshCatalog, broadcastCatalogReload],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
};
