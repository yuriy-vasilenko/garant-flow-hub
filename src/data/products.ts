import { Product } from '@/types/product';
import pumpGrundfosUps from '@/assets/products/pump-grundfos-ups.png';
import pumpWiloStar from '@/assets/products/pump-wilo-star.png';
import pumpGrundfosSq from '@/assets/products/pump-grundfos-sq.png';
import boilerBaxi from '@/assets/products/boiler-baxi-eco.png';
import boilerBuderus from '@/assets/products/boiler-buderus.png';
import radiatorRifar from '@/assets/products/radiator-rifar.png';
import radiatorRoyalThermo from '@/assets/products/radiator-royal-thermo.png';
import heaterAriston from '@/assets/products/heater-ariston.png';
import heaterElectrolux from '@/assets/products/heater-electrolux.png';
import heaterBosch from '@/assets/products/heater-bosch-wr.png';
import tankHydro50 from '@/assets/products/tank-hydro-50.png';
import tankWester24 from '@/assets/products/tank-wester-24.png';
import filterGeyser from '@/assets/products/filter-geyser.png';
import valveValtec from '@/assets/products/valve-valtec.png';
import pipePprValtec from '@/assets/products/pipe-ppr-valtec.png';

export const products: Product[] = [
  {
    id: '1',
    slug: 'grundfos-ups-25-60',
    title: 'Циркуляционный насос Grundfos UPS 25-60',
    category: 'Насосы',
    categorySlug: 'nasosy',
    price: 8500,
    status: 'available',
    image: pumpGrundfosUps,
    specs: {
      'Производитель': 'Grundfos',
      'Тип': 'Циркуляционный',
      'Напор, м': '6',
      'Производительность, м³/ч': '3.5',
      'Мощность, Вт': '60',
      'Присоединение': 'G 1½"',
      'Напряжение': '220 В',
    },
    description: 'Надёжный циркуляционный насос для систем отопления и кондиционирования. Три скорости вращения, низкий уровень шума, длительный срок службы.',
    featured: true,
  },
  {
    id: '2',
    slug: 'wilo-star-rs-25-4',
    title: 'Циркуляционный насос Wilo Star-RS 25/4',
    category: 'Насосы',
    categorySlug: 'nasosy',
    price: 6200,
    status: 'available',
    image: pumpWiloStar,
    specs: {
      'Производитель': 'Wilo',
      'Тип': 'Циркуляционный',
      'Напор, м': '4',
      'Производительность, м³/ч': '3',
      'Мощность, Вт': '48',
      'Присоединение': 'G 1½"',
    },
    description: 'Компактный и экономичный циркуляционный насос для бытовых систем отопления. Ручная регулировка скорости.',
    featured: true,
  },
  {
    id: '3',
    slug: 'baxi-eco-four-24f',
    title: 'Газовый котёл Baxi ECO Four 24 F',
    category: 'Котлы',
    categorySlug: 'kotly',
    price: 42000,
    status: 'available',
    image: boilerBaxi,
    specs: {
      'Производитель': 'Baxi',
      'Тип': 'Настенный двухконтурный',
      'Мощность, кВт': '24',
      'КПД': '92.9%',
      'Камера сгорания': 'Закрытая',
      'Площадь обогрева, м²': 'до 240',
      'Расход газа, м³/ч': '2.73',
    },
    description: 'Двухконтурный газовый котёл с закрытой камерой сгорания для отопления и горячего водоснабжения. Компактный настенный монтаж, встроенный циркуляционный насос.',
    featured: true,
  },
  {
    id: '4',
    slug: 'buderus-logamax-u072-24k',
    title: 'Газовый котёл Buderus Logamax U072-24K',
    category: 'Котлы',
    categorySlug: 'kotly',
    price: 48500,
    status: 'check',
    image: boilerBuderus,
    specs: {
      'Производитель': 'Buderus',
      'Тип': 'Настенный двухконтурный',
      'Мощность, кВт': '24',
      'КПД': '92%',
      'Камера сгорания': 'Закрытая',
      'Площадь обогрева, м²': 'до 250',
    },
    description: 'Газовый настенный котёл с удобным управлением и высокой надёжностью. Подходит для квартир и частных домов.',
  },
  {
    id: '5',
    slug: 'rifar-base-500-8',
    title: 'Радиатор Rifar Base 500 (8 секций)',
    category: 'Радиаторы',
    categorySlug: 'radiatory',
    price: 7600,
    status: 'available',
    image: radiatorRifar,
    specs: {
      'Производитель': 'Rifar',
      'Тип': 'Биметаллический',
      'Межосевое расстояние': '500 мм',
      'Количество секций': '8',
      'Теплоотдача (на секцию)': '204 Вт',
      'Рабочее давление': '20 атм',
      'Вес (на секцию)': '1.92 кг',
    },
    description: 'Биметаллический радиатор отопления с высокой теплоотдачей. Стальная внутренняя часть и алюминиевое оребрение обеспечивают надёжность и эффективный обогрев.',
    featured: true,
  },
  {
    id: '6',
    slug: 'royal-thermo-revolution-500-10',
    title: 'Радиатор Royal Thermo Revolution 500 (10 секций)',
    category: 'Радиаторы',
    categorySlug: 'radiatory',
    price: 6800,
    status: 'available',
    image: radiatorRoyalThermo,
    specs: {
      'Производитель': 'Royal Thermo',
      'Тип': 'Алюминиевый',
      'Межосевое расстояние': '500 мм',
      'Количество секций': '10',
      'Теплоотдача (на секцию)': '171 Вт',
      'Рабочее давление': '20 атм',
    },
    description: 'Алюминиевый секционный радиатор с современным дизайном и эффективной теплоотдачей.',
  },
  {
    id: '7',
    slug: 'ariston-pro1-r-80v',
    title: 'Водонагреватель Ariston PRO1 R 80 V',
    category: 'Водонагреватели',
    categorySlug: 'vodonagrevateli',
    price: 14500,
    status: 'available',
    image: heaterAriston,
    specs: {
      'Производитель': 'Ariston',
      'Тип': 'Накопительный',
      'Объём, л': '80',
      'Мощность, кВт': '1.5',
      'Время нагрева, мин': '180',
      'Монтаж': 'Вертикальный',
      'Покрытие бака': 'Эмаль',
    },
    description: 'Накопительный электрический водонагреватель с эмалированным внутренним покрытием. Надёжная защита от коррозии, экономичный режим работы.',
    featured: true,
  },
  {
    id: '8',
    slug: 'electrolux-ewh-50-formax',
    title: 'Водонагреватель Electrolux EWH 50 Formax',
    category: 'Водонагреватели',
    categorySlug: 'vodonagrevateli',
    price: 18900,
    status: 'check',
    image: heaterElectrolux,
    specs: {
      'Производитель': 'Electrolux',
      'Тип': 'Накопительный',
      'Объём, л': '50',
      'Мощность, кВт': '2',
      'Монтаж': 'Универсальный',
      'Покрытие бака': 'Нержавеющая сталь',
    },
    description: 'Водонагреватель с баком из нержавеющей стали и возможностью горизонтального или вертикального монтажа. Сухой ТЭН.',
  },
  {
    id: '9',
    slug: 'gilex-vodotok-gidroakkumulyator-50',
    title: 'Гидроаккумулятор Джилекс Водоток 50 л',
    category: 'Ёмкости',
    categorySlug: 'emkosti',
    price: 4200,
    status: 'available',
    image: tankImg,
    specs: {
      'Производитель': 'Джилекс',
      'Тип': 'Гидроаккумулятор',
      'Объём, л': '50',
      'Рабочее давление': '8 атм',
      'Присоединение': '1"',
      'Ориентация': 'Горизонтальный',
    },
    description: 'Горизонтальный гидроаккумулятор для систем автономного водоснабжения. Мембрана из пищевой резины.',
    featured: true,
  },
  {
    id: '10',
    slug: 'rasshiritelnyy-bak-wester-wrv-24',
    title: 'Расширительный бак Wester WRV 24',
    category: 'Ёмкости',
    categorySlug: 'emkosti',
    price: 2800,
    status: 'available',
    image: tankImg,
    specs: {
      'Производитель': 'Wester',
      'Тип': 'Расширительный бак',
      'Объём, л': '24',
      'Рабочее давление': '5 атм',
      'Присоединение': '¾"',
    },
    description: 'Мембранный расширительный бак для закрытых систем отопления.',
  },
  {
    id: '11',
    slug: 'filtr-geyzer-prestige',
    title: 'Фильтр обратного осмоса Гейзер Престиж',
    category: 'Водоподготовка',
    categorySlug: 'vodopodgotovka',
    price: 11500,
    status: 'available',
    image: filterImg,
    specs: {
      'Производитель': 'Гейзер',
      'Тип': 'Обратный осмос',
      'Количество ступеней': '5',
      'Производительность': '0.13 л/мин',
      'Объём накопителя': '12 л',
      'Ресурс мембраны': '3500 л',
    },
    description: 'Система обратного осмоса для глубокой очистки питьевой воды. Пять ступеней фильтрации, накопительный бак в комплекте.',
    featured: true,
  },
  {
    id: '12',
    slug: 'kran-sharovoy-valtec-34',
    title: 'Кран шаровой Valtec ¾" ВВ',
    category: 'Инженерная сантехника',
    categorySlug: 'santehnika',
    price: 450,
    status: 'available',
    image: plumbingImg,
    specs: {
      'Производитель': 'Valtec',
      'Тип': 'Шаровой кран',
      'Диаметр': '¾"',
      'Присоединение': 'Внутреннее-внутреннее',
      'Рабочее давление': '40 атм',
      'Материал': 'Латунь CW617N',
    },
    description: 'Полнопроходной шаровой кран из латуни для систем водоснабжения и отопления.',
  },
  {
    id: '13',
    slug: 'nasos-skvazhinnyy-grundfos-sq-3-55',
    title: 'Скважинный насос Grundfos SQ 3-55',
    category: 'Насосы',
    categorySlug: 'nasosy',
    status: 'check',
    image: pumpImg,
    specs: {
      'Производитель': 'Grundfos',
      'Тип': 'Скважинный',
      'Напор, м': '68',
      'Производительность, м³/ч': '3.5',
      'Мощность, кВт': '1.15',
      'Диаметр скважины': 'от 76 мм',
    },
    description: 'Многоступенчатый скважинный насос с частотным регулированием и защитой от сухого хода.',
  },
  {
    id: '14',
    slug: 'kolonka-gazovaya-bosch-wr-10-2p',
    title: 'Газовая колонка Bosch WR 10-2P',
    category: 'Водонагреватели',
    categorySlug: 'vodonagrevateli',
    price: 16800,
    status: 'available',
    image: waterHeaterImg,
    specs: {
      'Производитель': 'Bosch',
      'Тип': 'Проточный газовый',
      'Мощность, кВт': '17.4',
      'Производительность': '10 л/мин',
      'Розжиг': 'Пьезоэлектрический',
      'Камера сгорания': 'Открытая',
    },
    description: 'Газовая проточная колонка с пьезорозжигом. Компактный дизайн, медный теплообменник.',
    featured: true,
  },
  {
    id: '15',
    slug: 'truba-polipropilenovaya-valtec-25',
    title: 'Труба ППР Valtec 25×4.2 мм (армированная)',
    category: 'Инженерная сантехника',
    categorySlug: 'santehnika',
    price: 95,
    status: 'available',
    image: plumbingImg,
    specs: {
      'Производитель': 'Valtec',
      'Тип': 'Полипропиленовая армированная',
      'Диаметр, мм': '25',
      'Толщина стенки, мм': '4.2',
      'Армирование': 'Стекловолокно',
      'Рабочая температура': 'до 95°C',
      'Цена за': '1 п.м.',
    },
    description: 'Полипропиленовая труба, армированная стекловолокном, для горячего водоснабжения и отопления.',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
}
