import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { useCatalog } from '@/context/CatalogContext';
import type { Availability, Category, Product } from '@/types/product';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

const defaultImage = 'https://placehold.co/600x600?text=Product';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const specsToText = (specs: Record<string, string>) =>
  Object.entries(specs)
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');

const textToSpecs = (value: string): Record<string, string> =>
  value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...rest] = line.split(':');
      if (!key || rest.length === 0) return acc;
      acc[key.trim()] = rest.join(':').trim();
      return acc;
    }, {});

type CategoryForm = Omit<Category, 'id' | 'productCount'>;
type ProductForm = Omit<Product, 'id' | 'specs'> & { specsText: string; priceText: string };

const emptyCategoryForm: CategoryForm = {
  slug: '',
  title: '',
  description: '',
  icon: 'Waves',
  subcategories: [],
};

const emptyProductForm: ProductForm = {
  slug: '',
  title: '',
  category: '',
  categorySlug: '',
  subcategorySlug: '',
  priceText: '',
  status: 'available',
  image: defaultImage,
  images: [],
  specsText: '',
  description: '',
  featured: false,
};

const Admin = () => {
  const { categories, products, isLoading, isLocalMode, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct } = useCatalog();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.title.localeCompare(b.title)), [categories]);
  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.title.localeCompare(b.title)), [products]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  const submitCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title.trim()) return toast.error('Введите название категории');

    const slug = slugify(categoryForm.slug || categoryForm.title);
    if (!slug) return toast.error('Некорректный slug категории');

    const payload: CategoryForm = {
      ...categoryForm,
      title: categoryForm.title.trim(),
      description: categoryForm.description.trim(),
      icon: categoryForm.icon.trim() || 'Waves',
      slug,
    };

    if (editingCategoryId) {
      const result = await updateCategory(editingCategoryId, payload);
      if (!result.ok) return toast.error(result.message || 'Ошибка обновления');
      toast.success('Категория обновлена');
    } else {
      const result = await addCategory(payload);
      if (!result.ok) return toast.error(result.message || 'Ошибка добавления');
      toast.success('Категория добавлена');
    }
    resetCategoryForm();
  };

  const submitProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) return toast.error('Введите название товара');
    if (!productForm.categorySlug) return toast.error('Выберите категорию');

    const category = categories.find(item => item.slug === productForm.categorySlug);
    if (!category) return toast.error('Категория не найдена');

    const slug = slugify(productForm.slug || productForm.title);
    if (!slug) return toast.error('Некорректный slug товара');

    const specs = textToSpecs(productForm.specsText);
    const parsedPrice = productForm.priceText.trim() ? Number(productForm.priceText.replace(',', '.')) : undefined;
    if (productForm.priceText.trim() && Number.isNaN(parsedPrice)) {
      return toast.error('Цена должна быть числом');
    }

    const payload: Omit<Product, 'id'> = {
      slug,
      title: productForm.title.trim(),
      category: category.title,
      categorySlug: category.slug,
      subcategorySlug: productForm.subcategorySlug.trim() || undefined,
      price: parsedPrice,
      status: productForm.status as Availability,
      image: productForm.image.trim() || defaultImage,
      images: productForm.images,
      specs,
      description: productForm.description.trim(),
      featured: productForm.featured,
    };

    if (editingProductId) {
      const result = await updateProduct(editingProductId, payload);
      if (!result.ok) return toast.error(result.message || 'Ошибка обновления');
      toast.success('Товар обновлен');
    } else {
      const result = await addProduct(payload);
      if (!result.ok) return toast.error(result.message || 'Ошибка добавления');
      toast.success('Товар добавлен');
    }
    resetProductForm();
  };

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Вход выполнен');
    setCredentials({ email: '', password: '' });
  };

  if (authLoading) {
    return (
      <PageLayout>
        <section className="py-16">
          <div className="container mx-auto px-4 text-center text-muted-foreground">Проверка доступа...</div>
        </section>
      </PageLayout>
    );
  }

  if (!session && !isLocalMode) {
    return (
      <PageLayout>
        <PageHeader title="Админ панель" description="Войдите в аккаунт администратора Supabase." breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Админ панель' }]} />
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-bold mb-4">Вход администратора</h2>
              <form onSubmit={signIn} className="space-y-3">
                <Input placeholder="Email" type="email" value={credentials.email} onChange={e => setCredentials(prev => ({ ...prev, email: e.target.value }))} required />
                <Input placeholder="Пароль" type="password" value={credentials.password} onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))} required />
                <button type="submit" className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                  Войти
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('garant_force_local_catalog', 'true');
                    window.location.reload();
                  }}
                  className="w-full px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
                >
                  Временный локальный режим (для GitHub Pages)
                </button>
              </form>
            </div>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Админ панель"
        description={
          isLocalMode
            ? 'Временный локальный режим: изменения сохраняются в localStorage текущего браузера.'
            : `Управление категориями и товарами через Supabase. Вы вошли как ${session?.user.email}.`
        }
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'Админ панель' },
        ]}
      />

      <section className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          <div className="flex justify-end gap-2">
            {isLocalMode ? (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('garant_force_local_catalog');
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
              >
                Вернуться к Supabase режиму
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success('Вы вышли из админки');
                }}
                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
              >
                Выйти
              </button>
            )}
          </div>
          {isLoading && <p className="text-sm text-muted-foreground">Загрузка каталога из Supabase...</p>}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-bold mb-4">{editingCategoryId ? 'Редактировать категорию' : 'Новая категория'}</h2>
              <form onSubmit={submitCategory} className="space-y-3">
                <Input
                  value={categoryForm.title}
                  onChange={e => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Название категории"
                />
                <Input
                  value={categoryForm.slug}
                  onChange={e => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Slug (можно оставить пустым)"
                />
                <Input
                  value={categoryForm.icon}
                  onChange={e => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Иконка Lucide (например Waves)"
                />
                <Textarea
                  value={categoryForm.description}
                  onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание категории"
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                    {editingCategoryId ? 'Сохранить' : 'Добавить'}
                  </button>
                  {editingCategoryId && (
                    <button type="button" onClick={resetCategoryForm} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium">
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-bold mb-4">{editingProductId ? 'Редактировать товар' : 'Новый товар'}</h2>
              <form onSubmit={submitProduct} className="space-y-3">
                <Input
                  value={productForm.title}
                  onChange={e => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Название товара"
                />
                <Input
                  value={productForm.slug}
                  onChange={e => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Slug (можно оставить пустым)"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={productForm.categorySlug}
                    onChange={e => {
                      const slug = e.target.value;
                      const currentCategory = categories.find(item => item.slug === slug);
                      setProductForm(prev => ({
                        ...prev,
                        categorySlug: slug,
                        category: currentCategory?.title || '',
                      }));
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Категория</option>
                    {sortedCategories.map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  <select
                    value={productForm.status}
                    onChange={e => setProductForm(prev => ({ ...prev, status: e.target.value as Availability }))}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="available">В наличии</option>
                    <option value="check">Уточнить</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={productForm.subcategorySlug}
                    onChange={e => setProductForm(prev => ({ ...prev, subcategorySlug: e.target.value }))}
                    placeholder="Subcategory slug (необязательно)"
                  />
                  <Input
                    value={productForm.priceText}
                    onChange={e => setProductForm(prev => ({ ...prev, priceText: e.target.value }))}
                    placeholder="Цена (например 12500)"
                  />
                </div>
                <Input
                  value={productForm.image}
                  onChange={e => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="URL картинки"
                />
                <Textarea
                  value={productForm.description}
                  onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание товара"
                />
                <Textarea
                  value={productForm.specsText}
                  onChange={e => setProductForm(prev => ({ ...prev, specsText: e.target.value }))}
                  placeholder={'Характеристики построчно:\nМощность: 1.5 кВт\nНапряжение: 220 В'}
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={e => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  Показывать в популярных
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                    {editingProductId ? 'Сохранить' : 'Добавить'}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={resetProductForm} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium">
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-bold mb-4">Категории ({sortedCategories.length})</h3>
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {sortedCategories.map(category => (
                  <div key={category.id} className="rounded-md border border-border p-3">
                    <p className="font-semibold">{category.title}</p>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">{category.productCount} товаров</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setCategoryForm({
                            slug: category.slug,
                            title: category.title,
                            description: category.description,
                            icon: category.icon,
                            subcategories: category.subcategories || [],
                          });
                        }}
                        className="px-3 py-1.5 rounded-md text-sm bg-secondary text-secondary-foreground"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await deleteCategory(category.id);
                          if (!result.ok) {
                            toast.error(result.message || 'Не удалось удалить категорию');
                            return;
                          }
                          toast.success('Категория удалена');
                          if (editingCategoryId === category.id) resetCategoryForm();
                        }}
                        className="px-3 py-1.5 rounded-md text-sm bg-destructive text-destructive-foreground"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-bold mb-4">Товары ({sortedProducts.length})</h3>
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {sortedProducts.map(product => (
                  <div key={product.id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{product.title}</p>
                        <p className="text-sm text-muted-foreground">{product.slug}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                        </p>
                      </div>
                      <Link to={`/catalog/${product.slug}`} className="text-xs text-primary hover:underline">
                        Открыть
                      </Link>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(product.id);
                          setProductForm({
                            slug: product.slug,
                            title: product.title,
                            category: product.category,
                            categorySlug: product.categorySlug,
                            subcategorySlug: product.subcategorySlug || '',
                            priceText: product.price?.toString() || '',
                            status: product.status,
                            image: product.image,
                            images: product.images || [],
                            specsText: specsToText(product.specs),
                            description: product.description,
                            featured: Boolean(product.featured),
                          });
                        }}
                        className="px-3 py-1.5 rounded-md text-sm bg-secondary text-secondary-foreground"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await deleteProduct(product.id);
                          if (!result.ok) {
                            toast.error(result.message || 'Не удалось удалить товар');
                            return;
                          }
                          toast.success('Товар удален');
                          if (editingProductId === product.id) resetProductForm();
                        }}
                        className="px-3 py-1.5 rounded-md text-sm bg-destructive text-destructive-foreground"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Admin;
