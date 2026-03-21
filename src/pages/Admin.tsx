import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { useCatalog } from '@/context/CatalogContext';
import type { Availability, Category, Product, Subcategory } from '@/types/product';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isSiteAdmin, logoutSiteAdmin } from '@/lib/adminAuth';
import { parseExcelProducts, parseMoySkladStockReportIfMatch } from '@/lib/excelImport';
import { Upload, FileSpreadsheet, ImagePlus, Trash2, Plus } from 'lucide-react';

const defaultImage = 'https://placehold.co/600x600?text=Product';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

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
  const navigate = useNavigate();
  const {
    categories,
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
  } = useCatalog();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [importBusy, setImportBusy] = useState(false);
  /** Для товаров «Прочее» (нет строки-группы выше в файле) — положить в выбранную категорию вместо новой «Прочее» */
  const [stockReportCategorySlug, setStockReportCategorySlug] = useState('');

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.title.localeCompare(b.title)), [categories]);
  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.title.localeCompare(b.title)), [products]);

  if (!isSiteAdmin()) {
    return <Navigate to="/cabinet" replace />;
  }

  const productCategory = categories.find(c => c.slug === productForm.categorySlug);
  const subcategoryOptions: Subcategory[] = productCategory?.subcategories || [];

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  const addSubcategoryRow = () => {
    setCategoryForm(prev => ({
      ...prev,
      subcategories: [...(prev.subcategories || []), { title: '', slug: '' }],
    }));
  };

  const updateSubRow = (index: number, patch: Partial<Subcategory>) => {
    setCategoryForm(prev => {
      const list = [...(prev.subcategories || [])];
      const current = list[index] || { title: '', slug: '' };
      const next = { ...current, ...patch };
      if (patch.title !== undefined && !patch.slug) {
        next.slug = slugify(patch.title);
      }
      list[index] = next;
      return { ...prev, subcategories: list };
    });
  };

  const removeSubRow = (index: number) => {
    setCategoryForm(prev => ({
      ...prev,
      subcategories: (prev.subcategories || []).filter((_, i) => i !== index),
    }));
  };

  const onImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите файл изображения');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Файл слишком большой (макс. 2 МБ для сохранения в каталоге)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setProductForm(prev => ({ ...prev, image: result || prev.image }));
      toast.success('Фото загружено');
    };
    reader.readAsDataURL(file);
  };

  const onExcelImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const stockRows = parseMoySkladStockReportIfMatch(buf);

      if (stockRows !== null) {
        if (stockRows.length === 0) {
          toast.error('В отчёте не найдено строк с наименованием');
          return;
        }

        const usedCatSlugs = new Set(categories.map(c => c.slug));
        const titleToSlug = new Map<string, string>();
        const uniqueSectionTitles = [...new Set(stockRows.map(r => r.sectionCategoryTitle))];

        for (const t of uniqueSectionTitles) {
          let base = slugify(t);
          if (!base) base = 'kategoriya';
          let s = base;
          let n = 1;
          while (usedCatSlugs.has(s)) {
            s = `${base}-${n++}`;
          }
          usedCatSlugs.add(s);
          titleToSlug.set(t, s);
        }

        for (const t of uniqueSectionTitles) {
          const slug = titleToSlug.get(t)!;
          if (!categories.some(c => c.slug === slug)) {
            const result = await addCategory({
              slug,
              title: t,
              description: 'Импорт из отчёта «Остатки» (МойСклад)',
              icon: 'Waves',
              subcategories: [],
            });
            if (!result.ok) {
              toast.error(result.message || `Не удалось создать категорию «${t}»`);
            }
          }
        }

        await refreshCatalog();

        let fallbackCat: { slug: string; title: string } | undefined;
        const fallbackSlug = stockReportCategorySlug.trim();
        if (fallbackSlug) {
          const { data: fallbackRow } = await supabase
            .from('categories')
            .select('slug,title')
            .eq('slug', fallbackSlug)
            .maybeSingle();
          if (fallbackRow) fallbackCat = { slug: fallbackRow.slug, title: fallbackRow.title };
        }

        let ok = 0;
        for (const r of stockRows) {
          let catSlug = titleToSlug.get(r.sectionCategoryTitle)!;
          let catTitle = r.sectionCategoryTitle;

          if (r.sectionCategoryTitle === 'Прочее' && fallbackCat) {
            catSlug = fallbackCat.slug;
            catTitle = fallbackCat.title;
          }

          const payload: Omit<Product, 'id'> = {
            slug: r.slug,
            title: r.title,
            category: catTitle,
            categorySlug: catSlug,
            price: r.price,
            status: r.status,
            image: r.image || defaultImage,
            specs: {},
            description: r.description,
            featured: r.featured,
          };
          const res = await addProduct(payload);
          if (res.ok) ok++;
        }
        toast.success(
          `Импорт «Остатки»: категории по секциям файла, добавлено ${ok} из ${stockRows.length} товаров`,
        );
        return;
      }

      const rows = parseExcelProducts(buf);
      if (rows.length === 0) {
        toast.error('Формат не распознан как отчёт «Остатки». Для своего шаблона нужны колонки с названием и категорией (slug)');
        return;
      }
      const { data: catRowsForImport } = await supabase.from('categories').select('slug,title');
      const slugToCat = new Map((catRowsForImport ?? []).map(r => [r.slug, { slug: r.slug, title: r.title }]));
      let ok = 0;
      for (const r of rows) {
        const cat = slugToCat.get(r.categorySlug);
        if (!cat) continue;
        const payload: Omit<Product, 'id'> = {
          slug: r.slug,
          title: r.title,
          category: cat.title,
          categorySlug: cat.slug,
          subcategorySlug: r.subcategorySlug,
          price: r.price,
          status: r.status,
          image: r.image || defaultImage,
          specs: {},
          description: r.description,
          featured: r.featured,
        };
        const res = await addProduct(payload);
        if (res.ok) ok++;
      }
      toast.success(`Импорт: добавлено ${ok} из ${rows.length} строк (пропущены строки без совпадения категории)`);
    } catch (err) {
      console.error(err);
      toast.error('Не удалось прочитать Excel');
    } finally {
      setImportBusy(false);
    }
  };

  const submitCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title.trim()) return toast.error('Введите название категории');

    const slug = slugify(categoryForm.slug || categoryForm.title);
    if (!slug) return toast.error('Некорректный slug категории');

    const subs = (categoryForm.subcategories || [])
      .map(s => ({
        title: s.title.trim(),
        slug: slugify(s.slug || s.title),
      }))
      .filter(s => s.title && s.slug);

    const payload: CategoryForm = {
      ...categoryForm,
      title: categoryForm.title.trim(),
      description: categoryForm.description.trim(),
      icon: categoryForm.icon.trim() || 'Waves',
      slug,
      subcategories: subs,
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

    let subSlug = productForm.subcategorySlug.trim();
    if (subSlug && subcategoryOptions.length && !subcategoryOptions.some(s => s.slug === subSlug)) {
      toast.error('Подкатегория не входит в выбранную категорию');
      return;
    }
    if (!subSlug) subSlug = '';

    const payload: Omit<Product, 'id'> = {
      slug,
      title: productForm.title.trim(),
      category: category.title,
      categorySlug: category.slug,
      subcategorySlug: subSlug || undefined,
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

  return (
    <PageLayout>
      <PageHeader
        title="Админ панель"
        description={
          catalogError
            ? `Ошибка каталога: ${catalogError}`
            : 'Общий каталог в Supabase. После импорта и правок данные сами расходятся на все открытые сайты. Вход: admin / admin.'
        }
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'Админ панель' },
        ]}
      />

      <section className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              to="/cabinet"
              className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors"
            >
              В кабинет
            </Link>
            <button
              type="button"
              onClick={() => {
                logoutSiteAdmin();
                toast.success('Вы вышли');
                navigate('/cabinet', { replace: true });
              }}
              className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
            >
              Выйти из админки
            </button>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success('Сессия Supabase сброшена');
              }}
              className="px-4 py-2 rounded-xl text-sm border border-border"
            >
              Сброс Supabase auth
            </button>
            {catalogError && (
              <button
                type="button"
                onClick={() => void refreshCatalog()}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground"
              >
                Повторить загрузку каталога
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Импорт из Excel / отчёт МойСклад</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Отчёт «Остатки» (.xls)</strong> — строки-заголовки секций (например «Американки латунные» в колонке «Код», пустое «Наименование») становятся{' '}
                  <strong>категориями на сайте</strong> (создаются автоматически при импорте). Товары ниже попадают в эту категорию. Колонки «Наименование», «Цена продажи», «Доступно» — как раньше.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Свой шаблон</strong> — колонки: Название, Категория slug, опционально Slug, Подкатегория, Цена, Статус, Описание, Фото, Популярный.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-xl">
              <span className="text-sm font-medium text-foreground shrink-0">Без группы в файле →</span>
              <select
                value={stockReportCategorySlug}
                onChange={e => setStockReportCategorySlug(e.target.value)}
                className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Создать категорию «Прочее»</option>
                {sortedCategories.map(c => (
                  <option key={c.id} value={c.slug}>
                    В категорию: {c.title}
                  </option>
                ))}
              </select>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 disabled:opacity-50">
              <input type="file" accept=".xlsx,.xls" className="hidden" disabled={importBusy} onChange={onExcelImport} />
              {importBusy ? 'Импорт…' : 'Выбрать .xlsx / .xls'}
            </label>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Загрузка каталога…</p>}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">{editingCategoryId ? 'Редактировать категорию' : 'Новая категория'}</h2>
              <form onSubmit={submitCategory} className="space-y-3">
                <Input value={categoryForm.title} onChange={e => setCategoryForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Название" />
                <Input value={categoryForm.slug} onChange={e => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="Slug (необязательно)" />
                <Input value={categoryForm.icon} onChange={e => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))} placeholder="Иконка Lucide (Waves)" />
                <Textarea value={categoryForm.description} onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Описание" />

                <div className="rounded-xl border border-border p-3 space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Подкатегории</span>
                    <button type="button" onClick={addSubcategoryRow} className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Plus className="w-3.5 h-3.5" /> Добавить
                    </button>
                  </div>
                  {(categoryForm.subcategories || []).length === 0 && (
                    <p className="text-xs text-muted-foreground">Нет подкатегорий — фильтр в каталоге не покажет вложенность.</p>
                  )}
                  {(categoryForm.subcategories || []).map((sub, i) => (
                    <div key={i} className="flex flex-wrap gap-2 items-center">
                      <Input
                        className="flex-1 min-w-[120px]"
                        value={sub.title}
                        onChange={e => updateSubRow(i, { title: e.target.value })}
                        placeholder="Название"
                      />
                      <Input
                        className="w-36"
                        value={sub.slug}
                        onChange={e => updateSubRow(i, { slug: e.target.value })}
                        placeholder="slug"
                      />
                      <button type="button" onClick={() => removeSubRow(i)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Удалить">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                    {editingCategoryId ? 'Сохранить' : 'Добавить'}
                  </button>
                  {editingCategoryId && (
                    <button type="button" onClick={resetCategoryForm} className="px-4 py-2 rounded-xl bg-secondary text-sm">
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">{editingProductId ? 'Редактировать товар' : 'Новый товар'}</h2>
              <form onSubmit={submitProduct} className="space-y-3">
                <Input value={productForm.title} onChange={e => setProductForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Название" />
                <Input value={productForm.slug} onChange={e => setProductForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="Slug (необязательно)" />
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
                        subcategorySlug: '',
                      }));
                    }}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
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
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="available">В наличии</option>
                    <option value="check">Уточнить</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={productForm.subcategorySlug}
                    onChange={e => setProductForm(prev => ({ ...prev, subcategorySlug: e.target.value }))}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                    disabled={!subcategoryOptions.length}
                  >
                    <option value="">Подкатегория (необязательно)</option>
                    {subcategoryOptions.map(s => (
                      <option key={s.slug} value={s.slug}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={productForm.priceText}
                    onChange={e => setProductForm(prev => ({ ...prev, priceText: e.target.value }))}
                    placeholder="Цена"
                  />
                </div>

                <div className="flex flex-wrap items-start gap-3 rounded-xl border border-border p-3 bg-muted/15">
                  <div className="w-20 h-20 rounded-lg border border-border overflow-hidden bg-background shrink-0">
                    <img src={productForm.image} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-medium cursor-pointer hover:bg-secondary/80">
                      <ImagePlus className="w-4 h-4" />
                      Загрузить фото
                      <input type="file" accept="image/*" className="hidden" onChange={onImageFile} />
                    </label>
                    <p className="text-xs text-muted-foreground">Или укажите URL ниже (до 2 МБ для загрузки файла).</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    value={productForm.image}
                    onChange={e => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="URL картинки"
                  />
                </div>
                <Textarea value={productForm.description} onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Описание" />
                <Textarea
                  value={productForm.specsText}
                  onChange={e => setProductForm(prev => ({ ...prev, specsText: e.target.value }))}
                  placeholder={'Характеристики:\nПараметр: значение'}
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(prev => ({ ...prev, featured: e.target.checked }))} />
                  В блоке «Популярные» на главной
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                    {editingProductId ? 'Сохранить' : 'Добавить'}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={resetProductForm} className="px-4 py-2 rounded-xl bg-secondary text-sm">
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl border border-border p-6 max-h-[520px] flex flex-col shadow-sm">
              <h3 className="text-lg font-bold mb-4 shrink-0">Категории ({sortedCategories.length})</h3>
              <div className="space-y-2 overflow-auto pr-1 flex-1">
                {sortedCategories.map(category => (
                  <div key={category.id} className="rounded-xl border border-border p-3">
                    <p className="font-semibold">{category.title}</p>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                    {(category.subcategories?.length ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Подкатегорий: {category.subcategories!.length}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{category.productCount} товаров</p>
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
                            subcategories: category.subcategories?.length ? [...category.subcategories] : [],
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-secondary"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await deleteCategory(category.id);
                          if (!result.ok) {
                            toast.error(result.message || 'Не удалось удалить');
                            return;
                          }
                          toast.success('Удалено');
                          if (editingCategoryId === category.id) resetCategoryForm();
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-destructive text-destructive-foreground"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 max-h-[520px] flex flex-col shadow-sm">
              <h3 className="text-lg font-bold mb-4 shrink-0">Товары ({sortedProducts.length})</h3>
              <div className="space-y-2 overflow-auto pr-1 flex-1">
                {sortedProducts.map(product => (
                  <div key={product.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{product.title}</p>
                        <p className="text-sm text-muted-foreground">{product.slug}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                        </p>
                      </div>
                      <Link to={`/catalog/${product.slug}`} className="text-xs text-primary hover:underline shrink-0">
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
                        className="px-3 py-1.5 rounded-lg text-sm bg-secondary"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await deleteProduct(product.id);
                          if (!result.ok) {
                            toast.error(result.message || 'Ошибка');
                            return;
                          }
                          toast.success('Удалено');
                          if (editingProductId === product.id) resetProductForm();
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-destructive text-destructive-foreground"
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
