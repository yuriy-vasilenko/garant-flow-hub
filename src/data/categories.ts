import { Category } from '@/types/product';

export const categories: Category[] = [
  {
    id: '1',
    slug: 'nasosy',
    title: 'Насосы',
    description: 'Циркуляционные, скважинные, дренажные и поверхностные насосы для систем отопления и водоснабжения от ведущих производителей.',
    icon: 'Waves',
    productCount: 45,
  },
  {
    id: '2',
    slug: 'kotly',
    title: 'Котлы',
    description: 'Газовые, электрические и твердотопливные котлы для отопления частных домов и коммерческих помещений.',
    icon: 'Flame',
    productCount: 32,
  },
  {
    id: '3',
    slug: 'radiatory',
    title: 'Радиаторы',
    description: 'Алюминиевые, биметаллические и стальные радиаторы отопления различных типоразмеров.',
    icon: 'LayoutGrid',
    productCount: 58,
  },
  {
    id: '4',
    slug: 'vodonagrevateli',
    title: 'Водонагреватели',
    description: 'Накопительные и проточные водонагреватели для горячего водоснабжения.',
    icon: 'Thermometer',
    productCount: 27,
  },
  {
    id: '5',
    slug: 'emkosti',
    title: 'Ёмкости',
    description: 'Расширительные баки, гидроаккумуляторы и ёмкости для систем водоснабжения и отопления.',
    icon: 'Container',
    productCount: 19,
  },
  {
    id: '6',
    slug: 'santehnika',
    title: 'Инженерная сантехника',
    description: 'Фитинги, трубы, запорная арматура и комплектующие для монтажа систем отопления и водоснабжения.',
    icon: 'Wrench',
    productCount: 124,
  },
  {
    id: '7',
    slug: 'vodopodgotovka',
    title: 'Водоподготовка',
    description: 'Фильтры, умягчители, системы очистки воды для бытового и промышленного применения.',
    icon: 'Droplets',
    productCount: 36,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}
