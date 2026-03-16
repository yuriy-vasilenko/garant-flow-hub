import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { ProductCard } from '@/components/ProductCard';
import { products, searchProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Все
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Ничего не найдено. Попробуйте изменить запрос или категорию.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">Найдено: {filtered.length} товаров</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      </section>
    </PageLayout>
  );
};

export default Catalog;
