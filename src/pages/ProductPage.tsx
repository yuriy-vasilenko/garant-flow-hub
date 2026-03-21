import { useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestForm } from '@/components/RequestForm';
import { ProductCard } from '@/components/ProductCard';
import { Send, Truck, MapPin, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useCatalog } from '@/context/CatalogContext';

const ProductPage = () => {
  const { products } = useCatalog();
  const { slug } = useParams<{ slug: string }>();
  const product = products.find(item => item.slug === (slug || ''));
  const { addToCart } = useCart();

  useLayoutEffect(() => {
    const resetToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetToTop();
    const raf = requestAnimationFrame(resetToTop);
    const timer = window.setTimeout(resetToTop, 80);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [slug]);

  if (!product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Товар не найден</h1>
          <Link to="/catalog" className="text-primary hover:underline">Вернуться в каталог</Link>
        </div>
      </PageLayout>
    );
  }

  const related = products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  return (
    <PageLayout>
      <PageHeader
        title={product.title}
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'Каталог', to: '/catalog' },
          { label: product.category, to: `/catalog?category=${product.categorySlug}` },
          { label: product.title },
        ]}
      />

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-square p-8 bg-secondary/30">
                <img src={product.image} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <StatusBadge status={product.status} />
                <span className="text-sm text-muted-foreground">{product.category}</span>
              </div>

              <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>

              <div className="text-3xl font-extrabold text-foreground">
                {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    addToCart(product);
                    toast.success('Товар добавлен в корзину');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Добавить в корзину
                </button>
                <a
                  href="https://t.me/garantmarketdn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Написать в Telegram
                </a>
              </div>

              {/* Mini delivery */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Самовывоз: ул. Дагестанская, 50Б — <span className="text-foreground font-medium">бесплатно</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Доставка по Донецку — <span className="text-foreground font-medium">500 ₽</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Гарантия производителя</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specs */}
          {Object.keys(product.specs).length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-4">Характеристики</h2>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-secondary/30' : ''}>
                        <td className="px-4 py-3 text-muted-foreground font-medium w-1/3">{key}</td>
                        <td className="px-4 py-3 text-foreground tabular-nums">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Form */}
          <div className="mt-12 bg-card rounded-xl border border-border p-6 max-w-lg">
            <h3 className="text-lg font-bold text-foreground mb-1">Оставить заявку на этот товар</h3>
            <p className="text-sm text-muted-foreground mb-4">Укажите ваши данные — мы свяжемся для уточнения деталей</p>
            <RequestForm productTitle={product.title} compact />
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-4">Похожие товары</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default ProductPage;
