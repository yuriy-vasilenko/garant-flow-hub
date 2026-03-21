import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { categories as defaultCategories } from '@/data/categories';
import { products as defaultProducts } from '@/data/products';
import type { Category, Product } from '@/types/product';

type CategoryInput = Omit<Category, 'id' | 'productCount'>;
type ProductInput = Omit<Product, 'id'>;

interface CatalogContextValue {
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  catalogError: string | null;
  addCategory: (payload: CategoryInput) => Promise<{ ok: boolean; message?: string }>;
  updateCategory: (id: string, payload: CategoryInput) => Promise<{ ok: boolean; message?: string }>;
  deleteCategory: (id: string) => Promise<{ ok: boolean; message?: string }>;
  addProduct: (payload: ProductInput) => Promise<{ ok: boolean; message?: string }>;
  updateProduct: (id: string, payload: ProductInput) => Promise<{ ok: boolean; message?: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; message?: string }>;
  refreshCatalog: () => Promise<void>;
  broadcastCatalogReload: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

const normalizeCategories = (items: Category[], products: Product[]): Category[] =>
  items.map(category => ({
    ...category,
    productCount: products.filter(product => product.categorySlug === category.slug).length,
  }));

const STORAGE_KEY = 'garant_catalog_v1';
const getId = () => Math.random().toString(36).slice(2, 10);

const readStorage = (): { categories: Category[]; products: Product[] } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { categories: Category[]; products: Product[] };
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.products)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeStorage = (categories: Category[], products: Product[]) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      categories: normalizeCategories(categories, products),
      products,
    }),
  );
};

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogError] = useState<string | null>(null);
  const localSnapshotRef = useRef<{ categories: Category[]; products: Product[] }>({
    categories: [],
    products: [],
  });

  const loadLocal = () => {
    const stored = readStorage();
    if (stored) {
      const nc = normalizeCategories(stored.categories, stored.products);
      localSnapshotRef.current = { categories: nc, products: stored.products };
      setCategories(nc);
      setProducts(stored.products);
      setIsLoading(false);
      return;
    }
    const nc = normalizeCategories(defaultCategories, defaultProducts);
    localSnapshotRef.current = { categories: nc, products: defaultProducts };
    setCategories(nc);
    setProducts(defaultProducts);
    writeStorage(defaultCategories, defaultProducts);
    setIsLoading(false);
  };

  const refreshCatalog = async () => {
    setIsLoading(true);
    loadLocal();
  };

  const broadcastCatalogReload = async () => {
    return;
  };

  useEffect(() => {
    loadLocal();
  }, []);

  const addCategory = async (payload: CategoryInput) => {
    const { categories: c, products: p } = localSnapshotRef.current;
    const nextRaw = [...c, { ...payload, id: getId(), productCount: 0 }];
    const nextCategories = normalizeCategories(nextRaw, p);
    localSnapshotRef.current = { categories: nextCategories, products: p };
    setCategories(nextCategories);
    writeStorage(nextRaw, p);
    return { ok: true };
  };

  const updateCategory = async (id: string, payload: CategoryInput) => {
    const { categories: c, products: p } = localSnapshotRef.current;
    const old = c.find(item => item.id === id);
    if (!old) return { ok: false, message: 'Категория не найдена' };
    const nextProducts = p.map(item =>
      item.categorySlug === old.slug
        ? { ...item, categorySlug: payload.slug, category: payload.title }
        : item,
    );
    const nextRaw = c.map(item => (item.id === id ? { ...payload, id, productCount: item.productCount } : item));
    const nextCategories = normalizeCategories(nextRaw, nextProducts);
    localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
    setCategories(nextCategories);
    setProducts(nextProducts);
    writeStorage(nextRaw, nextProducts);
    return { ok: true };
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(item => item.id === id);
    if (!category) return { ok: false, message: 'Категория не найдена' };

    const hasProducts = products.some(product => product.categorySlug === category.slug);
    if (hasProducts) {
      return { ok: false, message: 'Сначала удалите товары из этой категории' };
    }

    const { categories: c, products: p } = localSnapshotRef.current;
    const nextRaw = c.filter(item => item.id !== id);
    const nextCategories = normalizeCategories(nextRaw, p);
    localSnapshotRef.current = { categories: nextCategories, products: p };
    setCategories(nextCategories);
    writeStorage(nextRaw, p);
    return { ok: true };
  };

  const addProduct = async (payload: ProductInput) => {
    const { categories: c, products: p } = localSnapshotRef.current;
    const nextProducts = [...p, { ...payload, id: getId() }];
    const nextCategories = normalizeCategories(c, nextProducts);
    localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
    setProducts(nextProducts);
    setCategories(nextCategories);
    writeStorage(c, nextProducts);
    return { ok: true };
  };

  const updateProduct = async (id: string, payload: ProductInput) => {
    const { categories: c, products: p } = localSnapshotRef.current;
    const nextProducts = p.map(item => (item.id === id ? { ...payload, id } : item));
    const nextCategories = normalizeCategories(c, nextProducts);
    localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
    setProducts(nextProducts);
    setCategories(nextCategories);
    writeStorage(c, nextProducts);
    return { ok: true };
  };

  const deleteProduct = async (id: string) => {
    const { categories: c, products: p } = localSnapshotRef.current;
    const nextProducts = p.filter(item => item.id !== id);
    const nextCategories = normalizeCategories(c, nextProducts);
    localSnapshotRef.current = { categories: nextCategories, products: nextProducts };
    setProducts(nextProducts);
    setCategories(nextCategories);
    writeStorage(c, nextProducts);
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
