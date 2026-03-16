import { Product } from '@/types/product';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => (
  <div className="group relative bg-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-elevated border border-transparent hover:border-border">
    <Link to={`/catalog/${product.slug}`} className="block">
      <div className="relative aspect-square bg-secondary/50 overflow-hidden p-6">
        <img
          src={product.image}
          alt={product.title}
          className="object-contain w-full h-full mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={product.status} />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">{product.category}</p>
        <h3 className="font-semibold text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors text-sm">
          {product.title}
        </h3>
        <div className="text-lg font-bold text-card-foreground">
          {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
        </div>
      </div>
    </Link>
    <div className="px-4 pb-4 flex gap-2">
      <Link
        to={`/catalog/${product.slug}`}
        className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-md text-center hover:bg-primary/90 transition-colors"
      >
        Оставить заявку
      </Link>
      <a
        href={`https://t.me/garantmarketdn`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-md bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        title="Написать в Telegram"
      >
        <Send className="w-4 h-4" />
      </a>
    </div>
  </div>
);
