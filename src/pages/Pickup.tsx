import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { MapPin, Clock, Phone } from 'lucide-react';

const Pickup = () => (
  <PageLayout>
    <PageHeader
      title="Самовывоз"
      description="Заберите заказ из нашего магазина в Донецке"
      breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Самовывоз' }]}
    />
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <div className="bg-card rounded-xl p-6 border border-border space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Адрес магазина</h3>
              <p className="text-sm text-muted-foreground mt-1">г. Донецк, ул. Дагестанская, 50Б, контейнер 45</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Режим работы</h3>
              <p className="text-sm text-muted-foreground mt-1">Понедельник — Суббота: 9:00 — 18:00</p>
              <p className="text-sm text-muted-foreground">Воскресенье: выходной</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Телефон</h3>
              <p className="text-sm text-muted-foreground mt-1"><a href="tel:+70000000000" className="hover:text-foreground transition-colors">+7 (000) 000-00-00</a></p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-bold text-foreground mb-2">Как забрать заказ</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Оставьте заявку на сайте или в Telegram</li>
            <li>Дождитесь подтверждения от менеджера</li>
            <li>Приезжайте по адресу в рабочее время</li>
            <li>Заберите товар и оплатите при получении</li>
          </ol>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Pickup;
