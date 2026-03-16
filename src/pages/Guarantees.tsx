import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { ShieldCheck, RefreshCw, Headphones, FileText } from 'lucide-react';

const Guarantees = () => (
  <PageLayout>
    <PageHeader
      title="Гарантии и сервис"
      description="Мы дорожим каждым клиентом и отвечаем за качество"
      breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Гарантии и сервис' }]}
    />
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {[
          { icon: ShieldCheck, title: 'Гарантия производителя', desc: 'Всё оборудование, представленное в каталоге, поставляется с официальной гарантией производителя. Сроки гарантии зависят от конкретного товара и бренда.' },
          { icon: FileText, title: 'Документация', desc: 'К каждому товару прилагаются необходимые документы: паспорт изделия, гарантийный талон, инструкция по эксплуатации (при наличии у производителя).' },
          { icon: RefreshCw, title: 'Обмен и возврат', desc: 'Обмен и возврат товара осуществляются в соответствии с действующим законодательством. По всем вопросам обращайтесь к менеджеру.' },
          { icon: Headphones, title: 'Консультация', desc: 'Мы помогаем с подбором оборудования, уточнением характеристик и решением вопросов по эксплуатации. Свяжитесь с нами любым удобным способом.' },
        ].map((item, i) => (
          <div key={i} className="bg-card rounded-xl p-6 border border-border flex gap-4">
            <item.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </PageLayout>
);

export default Guarantees;
