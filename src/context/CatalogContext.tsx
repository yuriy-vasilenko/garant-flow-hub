import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { categories as defaultCategories } from '@/data/categories';
import { products as defaultProducts } from '@/data/products';
import type { Category, Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const STORAGE_KEY = 'garant_catalog_v1';
const FORCE_LOCAL_KEY = 'garant_force_local_catalog';

type CategoryInput = Omit<Category, 'id' | 'productCount'>;
type ProductInput = Omit<Product, 'id'>;

interface CatalogContextValue {
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  isLocalMode: boolean;
  addCategory: (payload: CategoryInput) => Promise<{ ok: boolean; message?: string }>;
  updateCategory: (id: string, payload: CategoryInput) => Promise<{ ok: boolean; message?: string }>;
  deleteCategory: (id: string) => Promise<{ ok: boolean; message?: string }>;
  addProduct: (payload: ProductInput) => Promise<{ ok: boolean; message?: string }>;
  updateProduct: (id: string, payload: ProductInput) => Promise<{ ok: boolean; message?: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; message?: string }>;
  refreshCatalog: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

const getId = () => Math.random().toString(36).slice(2, 10);

const normalizeCategories = (items: Category[], products: Product[]): Category[] =>
  items.map(category => ({
    ...category,
    productCount: products.filter(product => product.categorySlug === category.slug).length,
  }));

const toJson = (value: unknown): Json => value as Json;

const readStorage = (): { categories: Category[]; products: Product[] } | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { categories: Category[]; products: Product[] };
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.products)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(() => localStorage.getItem(FORCE_LOCAL_KEY) === 'true');

  const saveLocal = (nextCategories: Category[], nextProducts: Product[]): { ok: boolean; message?: string } => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          categories: normalizeCategories(nextCategories, nextProducts),
          products: nextProducts,
        }),
      );
      return { ok: true };
    } catch (e) {
      const msg = e instanceof DOMException && e.name === 'QuotaExceededError'
        ? 'Память браузера переполнена (слишком много товаров для localStorage). Экспортируйте каталог или подключите Supabase.'
        : 'Не удалось сохранить каталог в браузере';
      console.error('saveLocal failed:', e);
      return { ok: false, message: msg };
    }
  };

  /** Актуальные категории/товары для локального режима — при пакетном импорте React state ещё не обновлён между await */
  const localSnapshotRef = useRef<{ categories: Category[]; products: Product[] }>({ categories: [], products: [] });
  useEffect(() => {
    localSnapshotRef.current = { categories, products };
  }, [categories, products]);

  const loadLocal = () => {
    const stored = readStorage();
    if (stored) {
      const cats = normalizeCategories(stored.categories, stored.products);
      setCategories(cats);
      setProducts(stored.products);
      localSnapshotRef.current = { categories: cats, products: stored.products };
      return;
    }
    setCategories(normalizeCategories(defaultCategories, defaultProducts));
    setProducts(defaultProducts);
    saveLocal(defaultCategories, defaultProducts);
    localSnapshotRef.current = {
      categories: normalizeCategories(defaultCategories, defaultProducts),
      products: defaultProducts,
    };
  };

  const refreshCatalog = async () => {
    setIsLoading(true);
    if (isLocalMode) {
      loadLocal();
      setIsLoading(false);
      return;
    }

    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from('categories').select('*').order('title', { ascending: true }),
      supabase.from('products').select('*').order('title', { ascending: true }),
    ]);

    if (categoriesRes.error || productsRes.error) {
      setIsLocalMode(true);
      localStorage.setItem(FORCE_LOCAL_KEY, 'true');
      loadLocal();
      setIsLoading(false);
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
    localSnapshotRef.current = { categories: nc, products: mappedProducts };
    setIsLoading(false);
  };

  useEffect(() => {
    void refreshCatalog();
  }, [isLocalMode]);

  const addCategory = async (payload: CategoryInput) => {
    if (isLocalMode) {
      const { categories: c, products: p } = localSnapshotRef.current;
      const nextRaw = [...c, { ...payload, id: getId(), productCount: 0 }];
      const nextCategories = normalizeCategories(nextRaw, p);
      localSnapshotRef.current = { categories: nextCategories, products: p };
      setCategories(nextCategories);
      const saved = saveLocal(nextCategories, p);
      if (!saved.ok) return saved;
      return { ok: true };
    }

    const { error } = await supabase.from('categories').insert({
      slug: payload.slug,
      title: payload.title,
      description: payload.description,
      icon: payload.icon,
      subcategories: toJson(payload.subcategories || []),
    });
    if (error) return { ok: false, message: error.message };
    await refreshCatalog();
    return { ok: true };
  };

  const updateCategory = async (id: string, payload: CategoryInput) => {
    if (isLocalMode) {
      const { categories: c, products: p } = localSnapshotRef.current;
      const old = c.find(item => item.id === id);
      if (!old) return { ok: false, message: 'Категория не найдена' };

      const nextProducts = p.map(product => {
        if (product.categorySlug !== old.slug) return product;
        return {
          ...product,
          categorySlug: payload.slug,
          category: payload.title,
        };
      });
      const nextCategoriesRaw = c.map(item =>
        item.id === id ? { ...payload, id, productCount: item.productCount } : item,
      );
      const nextCategories = normalizeCategories(nextCategoriesRaw, nextProducts);
      localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
      setProducts(nextProducts);
      setCategories(nextCategories);
      const saved = saveLocal(nextCategoriesRaw, nextProducts);
      if (!saved.ok) return saved;
      return { ok: true };
    }

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
    await refreshCatalog();
    return { ok: true };
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(item => item.id === id);
    if (!category) return { ok: false, message: 'Категория не найдена' };

    const hasProducts = products.some(product => product.categorySlug === category.slug);
    if (hasProducts) {
      return { ok: false, message: 'Сначала удалите товары из этой категории' };
    }

    if (isLocalMode) {
      const { categories: c, products: p } = localSnapshotRef.current;
      const nextCategoriesRaw = c.filter(item => item.id !== id);
      const nextCategories = normalizeCategories(nextCategoriesRaw, p);
      localSnapshotRef.current = { categories: nextCategories, products: p };
      setCategories(nextCategories);
      const saved = saveLocal(nextCategoriesRaw, p);
      if (!saved.ok) return saved;
      return { ok: true };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { ok: false, message: error.message };
    await refreshCatalog();
    return { ok: true };
  };

  const addProduct = async (payload: ProductInput) => {
    if (isLocalMode) {
      const { categories: c, products: p } = localSnapshotRef.current;
      const nextProducts = [...p, { ...payload, id: getId() }];
      const nextCategories = normalizeCategories(c, nextProducts);
      localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
      setProducts(nextProducts);
      setCategories(nextCategories);
      const saved = saveLocal(c, nextProducts);
      if (!saved.ok) return saved;
      return { ok: true };
    }

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
    await refreshCatalog();
    return { ok: true };
  };

  const updateProduct = async (id: string, payload: ProductInput) => {
    if (isLocalMode) {
      const { categories: c, products: p } = localSnapshotRef.current;
      const nextProducts = p.map(item => (item.id === id ? { ...payload, id } : item));
      const nextCategories = normalizeCategories(c, nextProducts);
      localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
      setProducts(nextProducts);
      setCategories(nextCategories);
      const saved = saveLocal(c, nextProducts);
      if (!saved.ok) return saved;
      return { ok: true };
    }

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
    await refreshCatalog();
    return { ok: true };
  };

  const deleteProduct = async (id: string) => {
    if (isLocalMode) {
      const { categories: c, products: p } = localSnapshotRef.current;
      const nextProducts = p.filter(item => item.id !== id);
      const nextCategories = normalizeCategories(c, nextProducts);
      localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
      setProducts(nextProducts);
      setCategories(nextCategories);
      const saved = saveLocal(c, nextProducts);
      if (!saved.ok) return saved;
      return { ok: true };
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { ok: false, message: error.message };
    await refreshCatalog();
    return { ok: true };
  };

  const value = useMemo<CatalogContextValue>(
    () => ({
      categories: normalizeCategories(categories, products),
      products,
      isLoading,
      isLocalMode,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshCatalog,
    }),
    [categories, products, isLoading, isLocalMode],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
};
