import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Send, Menu, X, Phone, Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : '/catalog');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 text-foreground tracking-tight">
          {!logoLoadError ? (
            <img
              src="/garant-market-logo.jpg"
              alt="Логотип Гарант Маркет"
              className="w-9 h-9 rounded-md object-cover border border-border shrink-0"
              onError={() => setLogoLoadError(true)}
            />
          ) : (
            <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-sm font-black shrink-0">G</div>
          )}
          <span className="font-extrabold text-lg leading-tight">Гарант Маркет</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-nowrap whitespace-nowrap">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors shrink-0 ${
                location.pathname === link.to
                  ? 'text-primary bg-primary/5 whitespace-nowrap'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary whitespace-nowrap'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex items-center relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по каталогу..."
            className="pl-9 pr-3 bg-background"
          />
        </form>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 px-3 py-2 border border-border text-sm font-medium rounded-md text-foreground hover:bg-secondary transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Корзина
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <a href="tel:+70000000000" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-4 h-4" />
            Позвонить
          </a>
          <a
            href="https://t.me/garantmarketdn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
            Telegram
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Меню"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4">
          <form onSubmit={submitSearch} className="relative pt-3">
            <Search className="absolute left-3 top-[calc(50%+6px)] -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по каталогу..."
              className="pl-9 pr-3 bg-background"
            />
          </form>

          <nav className="flex flex-col gap-1 py-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 text-sm font-medium rounded-md ${
                  location.pathname === link.to
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 text-sm font-medium rounded-md ${
                location.pathname === '/cart'
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Корзина {totalItems > 0 ? `(${totalItems})` : ''}
            </Link>
          </nav>
          <div className="flex gap-2 pt-2">
            <a href="tel:+70000000000" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-md">
              <Phone className="w-4 h-4" /> Позвонить
            </a>
            <a href="https://t.me/garantmarketdn" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md">
              <Send className="w-4 h-4" /> Telegram
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
