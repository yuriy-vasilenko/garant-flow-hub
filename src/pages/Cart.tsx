import { Link } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { ShoppingCart } from 'lucide-react';

const Cart = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Корзина"
        description="Раздел корзины готов для дальнейшего подключения логики оформления заказа."
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'Корзина' },
        ]}
      />

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Корзина пока пуста</h2>
            <p className="text-muted-foreground mb-6">
              Добавьте товары из каталога, чтобы продолжить оформление.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Cart;
