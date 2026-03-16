import { Link } from 'react-router-dom';
import { categories } from '@/data/categories';
import { Waves, Flame, LayoutGrid, Thermometer, Container, Wrench, Droplets, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Waves, Flame, LayoutGrid, Thermometer, Container, Wrench, Droplets,
};

export const CategoryCard = ({ slug, title, description, icon, productCount }: {
  slug: string;
  title: string;
  description: string;
  icon: string;
  productCount: number;
}) => {
  const Icon = iconMap[icon] || Waves;

  return (
    <Link
      to={`/catalog?category=${slug}`}
      className="group bg-card rounded-xl p-6 transition-all duration-300 hover:shadow-elevated border border-transparent hover:border-border"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-bold text-card-foreground text-lg mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      <p className="text-xs text-muted-foreground mt-3">{productCount} товаров</p>
    </Link>
  );
};

export const CategoriesGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {categories.map(cat => (
      <CategoryCard key={cat.id} {...cat} />
    ))}
  </div>
);
