import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { Truck, MapPin, Headphones, Send } from 'lucide-react';

const deliveryOptions = [
  { icon: MapPin, title: 'Самовывоз', price: 'Бесплатно', desc: 'Из магазина: г. Донецк, ул. Дагестанская, 50Б, конт. 45. Пн-Сб: 9:00–18:00.' },
  { icon: Truck, title: 'Доставка по Донецку', price: '500 ₽', desc: 'Доставка по городу в течение 1–2 рабочих дней после подтверждения заказа.' },
  { icon: Truck, title: 'Доставка по Макеевке', price: '1 000 ₽', desc: 'Доставка в Макеевку. Срок — 1–3 рабочих дня.' },
  { icon: Headphones, title: 'Доставка по области', price: 'По согласованию', desc: 'Стоимость и сроки обсуждаются индивидуально с менеджером.' },
];

const Delivery = () => (
  <PageLayout>
    <PageHeader
      title="Оплата и доставка"
      description="Способы получения заказа и условия оплаты"
      breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Доставка' }]}
    />
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {deliveryOptions.map((opt, i) => (
          <div key={i} className="bg-card rounded-xl p-6 border border-border flex gap-4">
            <opt.icon className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground">{opt.title}</h3>
                <span className="text-lg font-bold text-foreground">{opt.price}</span>
              </div>
              <p className="text-sm text-muted-foreground">{opt.desc}</p>
            </div>
          </div>
        ))}

        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-bold text-foreground mb-2">Оплата</h3>
          <p className="text-sm text-muted-foreground">
            Оплата производится при получении товара наличными или по безналичному расчёту. Детали оплаты уточняйте у менеджера при оформлении заказа.
          </p>
        </div>

        <div className="text-center pt-4">
          <p className="text-muted-foreground mb-3">Остались вопросы по доставке?</p>
          <a
            href="https://t.me/garantmarketdn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" /> Написать в Telegram
          </a>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Delivery;
