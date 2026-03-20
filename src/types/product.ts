export type Availability = 'available' | 'check';

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  subcategorySlug?: string;
  price?: number;
  status: Availability;
  image: string;
  images?: string[];
  specs: Record<string, string>;
  description: string;
  featured?: boolean;
}

export interface Subcategory {
  slug: string;
  title: string;
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  productCount: number;
  subcategories?: Subcategory[];
  image?: string;
}
