import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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

  const saveLocal = (nextCategories: Category[], nextProducts: Product[]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        categories: normalizeCategories(nextCategories, nextProducts),
        products: nextProducts,
      }),
    );
  };

  const loadLocal = () => {
    const stored = readStorage();
    if (stored) {
      setCategories(normalizeCategories(stored.categories, stored.products));
      setProducts(stored.products);
      return;
    }
    setCategories(normalizeCategories(defaultCategories, defaultProducts));
    setProducts(defaultProducts);
    saveLocal(defaultCategories, defaultProducts);
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

    setCategories(normalizeCategories(mappedCategories, mappedProducts));
    setProducts(mappedProducts);
    setIsLoading(false);
  };

  useEffect(() => {
    void refreshCatalog();
  }, [isLocalMode]);

  const addCategory = async (payload: CategoryInput) => {
    if (isLocalMode) {
      const nextCategories = [...categories, { ...payload, id: getId(), productCount: 0 }];
      setCategories(normalizeCategories(nextCategories, products));
      saveLocal(nextCategories, products);
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
      const old = categories.find(item => item.id === id);
      if (!old) return { ok: false, message: 'Категория не найдена' };

      const nextProducts = products.map(product => {
        if (product.categorySlug !== old.slug) return product;
        return {
          ...product,
          categorySlug: payload.slug,
          category: payload.title,
        };
      });
      const nextCategories = categories.map(item =>
        item.id === id ? { ...payload, id, productCount: item.productCount } : item,
      );
      setProducts(nextProducts);
      setCategories(normalizeCategories(nextCategories, nextProducts));
      saveLocal(nextCategories, nextProducts);
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
      const nextCategories = categories.filter(item => item.id !== id);
      setCategories(nextCategories);
      saveLocal(nextCategories, products);
      return { ok: true };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { ok: false, message: error.message };
    await refreshCatalog();
    return { ok: true };
  };

  const addProduct = async (payload: ProductInput) => {
    if (isLocalMode) {
      const nextProducts = [...products, { ...payload, id: getId() }];
      setProducts(nextProducts);
      setCategories(normalizeCategories(categories, nextProducts));
      saveLocal(categories, nextProducts);
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
      const nextProducts = products.map(item => (item.id === id ? { ...payload, id } : item));
      setProducts(nextProducts);
      setCategories(normalizeCategories(categories, nextProducts));
      saveLocal(categories, nextProducts);
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
      const nextProducts = products.filter(item => item.id !== id);
      setProducts(nextProducts);
      setCategories(normalizeCategories(categories, nextProducts));
      saveLocal(categories, nextProducts);
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
