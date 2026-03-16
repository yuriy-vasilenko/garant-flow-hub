import { Link } from 'react-router-dom';
import { Send, MapPin, Phone, Clock } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 font-extrabold text-xl mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm font-black">G</div>
            Garant Market
          </div>
          <p className="text-sm text-primary-foreground/60 leading-relaxed">
            Товары для отопления, водоснабжения и водоподготовки. Профессиональный подбор оборудования в Донецке.
          </p>
          <a
            href="https://t.me/garantmarketdn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" /> Telegram-канал
          </a>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-primary-foreground/40">Каталог</h4>
          <ul className="space-y-2 text-sm">
            {['Насосы', 'Котлы', 'Радиаторы', 'Водонагреватели', 'Ёмкости', 'Сантехника', 'Водоподготовка'].map(cat => (
              <li key={cat}>
                <Link to="/catalog" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-primary-foreground/40">Информация</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">О компании</Link></li>
            <li><Link to="/delivery" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Доставка</Link></li>
            <li><Link to="/pickup" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Самовывоз</Link></li>
            <li><Link to="/how-to-order" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Как заказать</Link></li>
            <li><Link to="/guarantees" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Гарантии и сервис</Link></li>
            <li><Link to="/privacy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Политика конфиденциальности</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-primary-foreground/40">Контакты</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 text-primary-foreground/60">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              г. Донецк, ул. Дагестанская, 50Б, конт. 45
            </li>
            <li className="flex items-center gap-2 text-primary-foreground/60">
              <Phone className="w-4 h-4 shrink-0" />
              <a href="tel:+70000000000" className="hover:text-primary-foreground transition-colors">+7 (000) 000-00-00</a>
            </li>
            <li className="flex items-center gap-2 text-primary-foreground/60">
              <Clock className="w-4 h-4 shrink-0" />
              Пн-Сб: 9:00 — 18:00
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/40">
        <p>© {new Date().getFullYear()} Garant Market. Все права защищены.</p>
        <Link to="/privacy" className="hover:text-primary-foreground/60 transition-colors">Политика конфиденциальности</Link>
      </div>
    </div>
  </footer>
);
