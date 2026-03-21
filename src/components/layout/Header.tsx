import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Send, Menu, X, Phone, Search, ShoppingCart, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { isSiteAdmin } from '@/lib/adminAuth';

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/about', label: 'О компании' },
  { to: '/delivery', label: 'Доставка' },
  { to: '/contacts', label: 'Контакты' },
];

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoLoadError, setLogoLoadError] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}photo_5422750417609161911_y.jpg`;
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const adminLogged = isSiteAdmin();

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : '/catalog');
    setMenuOpen(false);
  };

  const navClass = (to: string) =>
    `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 shrink-0 ${
      location.pathname === to
        ? 'text-primary-foreground bg-primary shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/80 shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-3 h-[4.25rem] px-4">
        <Link to="/" className="group flex items-center gap-3 text-foreground tracking-tight shrink-0">
          {!logoLoadError ? (
            <img
              src={logoSrc}
              alt="Логотип Гарант Маркет"
              className="w-10 h-10 rounded-xl object-cover border border-border/60 shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-[1.03]"
              onError={() => setLogoLoadError(true)}
            />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-sm font-black shrink-0">G</div>
          )}
          <span className="font-extrabold text-lg leading-tight hidden sm:inline">Гарант Маркет</span>
        </Link>

        <nav className="hidden lg:flex items-center p-1 rounded-full bg-muted/50 border border-border/60">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={navClass(link.to)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex items-center relative flex-1 max-w-xs min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по каталогу..."
            className="pl-9 h-10 rounded-full bg-background/80 border-border/70 focus-visible:bg-background"
          />
        </form>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-full border border-border/70 text-foreground hover:bg-secondary transition-colors"
            title="Корзина"
            aria-label="Корзина"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
          <Link
            to="/cabinet"
            className={`inline-flex items-center justify-center h-10 w-10 rounded-full border transition-colors ${
              adminLogged
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            title="Личный кабинет"
            aria-label="Личный кабинет"
          >
            <UserRound className="w-[18px] h-[18px]" />
          </Link>
          <a
            href="tel:+70000000000"
            className="hidden xl:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            <Phone className="w-4 h-4" />
            Позвонить
          </a>
          <a
            href="https://t.me/garantmarketdn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            Telegram
          </a>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2.5 rounded-full hover:bg-secondary text-foreground" aria-label="Меню">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border/80 bg-card/95 backdrop-blur-md px-4 pb-5 pt-2 space-y-3">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по каталогу..."
              className="pl-9 h-11 rounded-full bg-background"
            />
          </form>

          <nav className="flex flex-col gap-1 p-1 rounded-2xl bg-muted/40 border border-border/60">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-xl ${
                  location.pathname === link.to ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cabinet"
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-2 ${
                location.pathname === '/cabinet' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background'
              }`}
            >
              <UserRound className="w-4 h-4" />
              Личный кабинет
            </Link>
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-2 ${
                location.pathname === '/cart' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Корзина {totalItems > 0 ? `(${totalItems})` : ''}
            </Link>
          </nav>
          <div className="flex gap-2">
            <a
              href="tel:+70000000000"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
            >
              <Phone className="w-4 h-4" /> Позвонить
            </a>
            <a
              href="https://t.me/garantmarketdn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              <Send className="w-4 h-4" /> Telegram
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
