import { PageLayout } from '@/components/layout/PageLayout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { RequestForm } from '@/components/RequestForm';
import { categories } from '@/data/categories';
import { getFeaturedProducts } from '@/data/products';
import { Link } from 'react-router-dom';
import { Send, Truck, MapPin, Package, ShieldCheck, Headphones, ArrowRight, ClipboardList } from 'lucide-react';
import heroImage from '@/assets/hero-equipment.png';

const featuredProducts = getFeaturedProducts();

const steps = [
  { icon: Package, title: 'Выбираете товар', desc: 'Изучаете каталог, характеристики и наличие' },
  { icon: ClipboardList, title: 'Оставляете заявку', desc: 'Через форму на сайте или Telegram' },
  { icon: Headphones, title: 'Уточняем детали', desc: 'Подтверждаем наличие, цену, сроки' },
  { icon: Truck, title: 'Получаете товар', desc: 'Самовывоз или доставка по Донецку' },
];

const advantages = [
  { icon: Package, title: 'Широкий ассортимент', desc: 'Насосы, котлы, радиаторы, водонагреватели и комплектующие для инженерных систем' },
  { icon: Headphones, title: 'Помощь с подбором', desc: 'Поможем выбрать оборудование под ваши задачи и бюджет' },
  { icon: Truck, title: 'Доставка и самовывоз', desc: 'Доставка по Донецку от 500 ₽ или самовывоз из магазина' },
  { icon: ShieldCheck, title: 'Понятный статус наличия', desc: 'Всегда видно, что есть на складе, а что нужно уточнить' },
  { icon: ClipboardList, title: 'Работа по наличию и под заказ', desc: 'Если товара нет прямо сейчас — оперативно закажем у поставщика' },
  { icon: Send, title: 'Удобная подача заявки', desc: 'Оставьте заявку на сайте или напишите нам в Telegram' },
];

const Index = () => (
  <PageLayout>
    {/* Hero */}
    <section className="relative bg-card overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] text-balance">
            Инженерные решения для{' '}
            <span className="text-primary">отопления</span> и водоснабжения
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-[50ch] leading-relaxed">
            Garant Market — профессиональный подбор оборудования в Донецке.
            От бытовых насосов до систем водоподготовки.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-base"
            >
              Перейти в каталог
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://t.me/garantmarketdn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Send className="w-4 h-4" />
              Telegram
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <div>
              <div className="text-2xl font-extrabold text-foreground">1500+</div>
              <div className="text-sm text-muted-foreground">Товаров в ассортименте</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-foreground">Донецк</div>
              <div className="text-sm text-muted-foreground">Собственный склад</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-foreground">24ч</div>
              <div className="text-sm text-muted-foreground">Быстрая доставка</div>
            </div>
          </div>
        </div>
        <div className="relative aspect-square bg-background rounded-2xl shadow-hero border border-border p-6 overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <img src={heroImage} alt="Инженерное оборудование Garant Market" className="relative z-10 object-contain w-full h-full" />
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Популярные категории</h2>
            <p className="mt-1 text-muted-foreground">Основные направления нашего ассортимента</p>
          </div>
          <Link to="/catalog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Все категории <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(cat => (
            <CategoryCard key={cat.id} {...cat} />
          ))}
        </div>
      </div>
    </section>

    {/* Advantages */}
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Почему Garant Market</h2>
        <p className="text-muted-foreground mb-8">Работаем для тех, кто ценит надёжность и удобство</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((adv, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-xl bg-background border border-transparent hover:border-border transition-all hover:shadow-base">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <adv.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{adv.title}</h3>
                <p className="text-sm text-muted-foreground">{adv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Featured Products */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Популярные товары</h2>
            <p className="mt-1 text-muted-foreground">Часто заказывают наши клиенты</p>
          </div>
          <Link to="/catalog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
            Весь каталог <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {featuredProducts.slice(0, 8).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Как мы работаем</h2>
        <p className="text-muted-foreground mb-10">Простой и понятный процесс заказа</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative p-6 bg-background rounded-xl">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Delivery Block */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Доставка и самовывоз</h2>
        <p className="text-muted-foreground mb-8">Удобные способы получения заказа</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MapPin, title: 'Самовывоз', desc: 'Из магазина по адресу ул. Дагестанская, 50Б', price: 'Бесплатно' },
            { icon: Truck, title: 'Донецк', desc: 'Доставка по городу', price: '500 ₽' },
            { icon: Truck, title: 'Макеевка', desc: 'Доставка по Макеевке', price: '1 000 ₽' },
            { icon: Headphones, title: 'Область', desc: 'По согласованию с менеджером', price: 'Индивидуально' },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border">
              <item.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              <p className="text-lg font-bold text-foreground mt-3">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Trust */}
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Работаем для вас</h2>
            <p className="text-muted-foreground mb-6">Garant Market — это не абстрактный интернет-магазин, а реальный бизнес с магазином и складом в Донецке.</p>
            <ul className="space-y-3">
              {[
                'Прозрачная работа с заказом — вы всегда знаете статус',
                'Живой контакт с менеджером через Telegram или по телефону',
                'Уточнение наличия по любой позиции',
                'Помощь с подбором оборудования под ваши задачи',
                'Работа с ассортиментом под запрос клиента',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background rounded-xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-1">Оставить заявку</h3>
            <p className="text-sm text-muted-foreground mb-4">Расскажите, что вас интересует — мы свяжемся и поможем с подбором</p>
            <RequestForm />
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Index;
