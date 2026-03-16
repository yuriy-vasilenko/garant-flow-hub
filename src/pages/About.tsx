import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { MapPin, ShieldCheck, Package, Clock, Users } from 'lucide-react';

const About = () => (
  <PageLayout>
    <PageHeader
      title="О компании"
      description="Garant Market — надёжный поставщик инженерного оборудования в Донецке"
      breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'О компании' }]}
    />
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Garant Market — компания, специализирующаяся на продаже товаров для отопления, водоснабжения, инженерной сантехники и водоподготовки. Мы работаем с проверенными производителями и предлагаем широкий ассортимент оборудования как для бытового, так и для коммерческого применения.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: MapPin, title: 'Розничный магазин', desc: 'г. Донецк, ул. Дагестанская, 50Б, конт. 45' },
            { icon: Package, title: 'Собственный склад', desc: 'Основные позиции всегда в наличии' },
            { icon: Users, title: 'Консультация', desc: 'Помогаем подобрать оборудование под задачи клиента' },
            { icon: Clock, title: 'Оперативная работа', desc: 'Быстрая обработка заявок и доставка' },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border flex gap-4">
              <item.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-3">Наши направления</h3>
          <ul className="space-y-2">
            {['Насосное оборудование', 'Отопительные котлы', 'Радиаторы отопления', 'Водонагреватели и газовые колонки', 'Расширительные баки и гидроаккумуляторы', 'Инженерная сантехника и комплектующие', 'Системы водоподготовки и фильтрации'].map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground">
          Мы ориентированы на долгосрочное сотрудничество: помогаем с выбором, оперативно уточняем наличие и организуем доставку. Если нужной позиции нет на складе — закажем у поставщика в кратчайшие сроки.
        </p>
      </div>
    </section>
  </PageLayout>
);

export default About;
