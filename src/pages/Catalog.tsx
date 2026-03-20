import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { ProductCard } from '@/components/ProductCard';
import { products, searchProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { Menu, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let result = query ? searchProducts(query) : products;
    if (activeCategory) {
      result = result.filter(p => p.categorySlug === activeCategory);
    }
    return result;
  }, [query, activeCategory]);

  const setCategory = (slug: string) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const activeCategoryData = categories.find(c => c.slug === activeCategory);
  const categoryButtonBase = 'w-full text-left px-3 py-2 text-sm rounded-md transition-colors';

  return (
    <PageLayout>
      <PageHeader
        title={activeCategoryData ? activeCategoryData.title : 'Каталог'}
        description={activeCategoryData ? activeCategoryData.description : 'Инженерное оборудование для отопления, водоснабжения и водоподготовки'}
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          ...(activeCategoryData
            ? [{ label: 'Каталог', to: '/catalog' }, { label: activeCategoryData.title }]
            : [{ label: 'Каталог' }]),
        ]}
      />

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            {/* Left categories list */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-card border border-border rounded-lg p-3">
                <h3 className="text-sm font-semibold text-foreground mb-3 px-3">Категории</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategory('')}
                    className={`${categoryButtonBase} ${
                      !activeCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    Все категории
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => setCategory(cat.slug)}
                      className={`${categoryButtonBase} ${
                        activeCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div>
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                      <Menu className="w-4 h-4" />
                      Категории
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:max-w-[320px] p-4">
                    <SheetHeader className="mb-4">
                      <SheetTitle>Категории</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <button
                          onClick={() => setCategory('')}
                          className={`${categoryButtonBase} ${
                            !activeCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
                          }`}
                        >
                          Все категории
                        </button>
                      </SheetClose>
                      {categories.map(cat => (
                        <SheetClose asChild key={cat.slug}>
                          <button
                            onClick={() => setCategory(cat.slug)}
                            className={`${categoryButtonBase} ${
                              activeCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
                            }`}
                          >
                            {cat.title}
                          </button>
                        </SheetClose>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по каталогу..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="pl-9 bg-card"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Ничего не найдено. Попробуйте изменить запрос или категорию.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">Найдено: {filtered.length} товаров</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </>
              )}

              {/* CTA */}
              <div className="mt-12 bg-card rounded-xl p-8 border border-border text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Не нашли нужный товар?</h3>
                <p className="text-muted-foreground mb-4">Напишите нам в Telegram — поможем подобрать или закажем у поставщика</p>
                <a
                  href="https://t.me/garantmarketdn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
                >
                  Написать в Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Catalog;
