import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { Package, ClipboardList, Headphones, Truck, Send } from 'lucide-react';

const steps = [
  { icon: Package, num: '1', title: 'Выберите товар', desc: 'Изучите каталог на сайте. Ознакомьтесь с характеристиками, статусом наличия и ценами.' },
  { icon: ClipboardList, num: '2', title: 'Оставьте заявку', desc: 'Нажмите «Оставить заявку» на странице товара, заполните форму или напишите нам в Telegram.' },
  { icon: Headphones, num: '3', title: 'Мы свяжемся с вами', desc: 'Менеджер уточнит наличие, согласует стоимость, ответит на вопросы и поможет с подбором.' },
  { icon: Truck, num: '4', title: 'Получите товар', desc: 'Заберите заказ самовывозом из магазина или оформите доставку по Донецку или области.' },
];

const HowToOrder = () => (
  <PageLayout>
    <PageHeader
      title="Как заказать"
      description="Простой процесс от выбора товара до получения"
      breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Как заказать' }]}
    />
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="bg-card rounded-xl p-6 border border-border flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              {step.num}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
            </div>
          </div>
        ))}

        <div className="text-center pt-4">
          <p className="text-muted-foreground mb-3">Готовы оформить заказ?</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
              Перейти в каталог
            </a>
            <a href="https://t.me/garantmarketdn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors">
              <Send className="w-4 h-4" /> Telegram
            </a>
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default HowToOrder;
