import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { RequestForm } from '@/components/RequestForm';
import { MapPin, Phone, Clock, Send } from 'lucide-react';

const Contacts = () => (
  <PageLayout>
    <PageHeader
      title="Контакты"
      description="Свяжитесь с нами удобным способом"
      breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Контакты' }]}
    />
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            {[
              { icon: MapPin, title: 'Адрес', text: 'г. Донецк, ул. Дагестанская, 50Б, конт. 45' },
              { icon: Phone, title: 'Телефон', text: '+7 (000) 000-00-00', href: 'tel:+70000000000' },
              { icon: Clock, title: 'Режим работы', text: 'Пн-Сб: 9:00 — 18:00' },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border flex gap-4">
                <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.text}</a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  )}
                </div>
              </div>
            ))}
            <a
              href="https://t.me/garantmarketdn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card rounded-xl p-5 border border-border hover:border-primary/30 transition-colors"
            >
              <Send className="w-5 h-5 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Telegram</h3>
                <p className="text-sm text-muted-foreground">@garantmarketdn</p>
              </div>
            </a>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-1">Написать нам</h3>
            <p className="text-sm text-muted-foreground mb-4">Оставьте заявку — мы свяжемся с вами</p>
            <RequestForm />
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Contacts;
