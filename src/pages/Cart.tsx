import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { Minus, Plus, ShoppingCart, Trash2, Loader2, Send } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', comment: '' });

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (!item.product.price) return sum;
        return sum + item.product.price * item.quantity;
      }, 0),
    [items],
  );

  const hasUnknownPrice = items.some(item => !item.product.price);

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Добавьте товары в корзину');
      return;
    }

    const lines = items.map(
      item =>
        `- ${item.product.title} x${item.quantity}${item.product.price ? ` (${item.product.price.toLocaleString('ru-RU')} ₽)` : ' (цена по запросу)'}`,
    );

    const orderComment = [
      'Заявка из корзины:',
      ...lines,
      form.comment.trim() ? `Комментарий: ${form.comment.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    setLoading(true);
    const { error } = await supabase.from('contact_requests').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      comment: orderComment,
      product_title: 'Корзина',
    });
    setLoading(false);

    if (error) {
      toast.error('Не удалось отправить заявку. Попробуйте позже.');
      return;
    }

    toast.success('Заявка отправлена. Скоро свяжемся с вами.');
    clearCart();
    setForm({ name: '', phone: '', comment: '' });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Корзина"
        description="Проверьте список товаров и отправьте единую заявку на обработку."
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'Корзина' },
        ]}
      />

      <section className="py-10">
        <div className="container mx-auto px-4">
          {items.length === 0 ? (
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
          ) : (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-xl font-bold text-foreground mb-4">Список покупок</h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3 border border-border rounded-lg p-3">
                      <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-contain bg-secondary/30 rounded-md p-2" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground line-clamp-2">{item.product.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.price ? `${item.product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 rounded-md border border-border flex items-center justify-center disabled:opacity-50"
                              aria-label="Уменьшить количество"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-md border border-border flex items-center justify-center"
                              aria-label="Увеличить количество"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 h-fit">
                <h2 className="text-xl font-bold text-foreground mb-1">Оформление заявки</h2>
                <p className="text-sm text-muted-foreground mb-4">Отправим весь список одним сообщением.</p>

                <div className="text-sm border border-border rounded-md p-3 mb-4 space-y-1">
                  <p className="text-muted-foreground">Позиций: <span className="text-foreground font-semibold">{items.length}</span></p>
                  <p className="text-muted-foreground">
                    Сумма: <span className="text-foreground font-semibold">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                  </p>
                  {hasUnknownPrice && <p className="text-xs text-muted-foreground">Часть товаров с ценой по запросу, итог уточнит менеджер.</p>}
                </div>

                <form onSubmit={submitOrder} className="space-y-3">
                  <Input
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Телефон"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="Комментарий к заказу"
                    value={form.comment}
                    onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Отправка...' : 'Отправить заявку'}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Cart;
