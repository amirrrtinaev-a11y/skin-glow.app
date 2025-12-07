import { Product, ProductType, SkincareBox, User } from '../types';

const PRODUCTS_KEY = 'skinglow_products';
const BOXES_KEY = 'skinglow_boxes';
const USER_KEY = 'skinglow_user'; // Simple auth persistence

// Seed Data
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Gentle Hydrating Cleanser',
    brand: 'CeraVe',
    type: ProductType.CLEANSER,
    price: 900,
    description: 'Мягкое очищающее средство для нормальной и сухой кожи с керамидами.',
    imageUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'p2',
    name: 'Salicylic Acid Cleanser',
    brand: 'The Inkey List',
    type: ProductType.CLEANSER,
    price: 1200,
    description: 'Очищающий гель с салициловой кислотой для борьбы с акне.',
    imageUrl: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'p3',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    type: ProductType.SERUM,
    price: 850,
    description: 'Сыворотка для борьбы с высыпаниями и регулирования себума.',
    imageUrl: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'p4',
    name: 'Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    type: ProductType.SERUM,
    price: 950,
    description: 'Глубокое увлажнение для всех типов кожи.',
    imageUrl: 'https://picsum.photos/200/200?random=4'
  },
  {
    id: 'p5',
    name: 'Natural Moisturizing Factors + HA',
    brand: 'The Ordinary',
    type: ProductType.CREAM,
    price: 1100,
    description: 'Увлажняющий крем, восстанавливающий барьер.',
    imageUrl: 'https://picsum.photos/200/200?random=5'
  },
  {
    id: 'p6',
    name: 'Invisible Fluid SPF 50+',
    brand: 'La Roche-Posay',
    type: ProductType.SPF,
    price: 1800,
    description: 'Легкий солнцезащитный флюид, не оставляющий белых следов.',
    imageUrl: 'https://picsum.photos/200/200?random=6'
  },
  {
    id: 'p7',
    name: 'Retinol 0.5% in Squalane',
    brand: 'The Ordinary',
    type: ProductType.SERUM,
    price: 1300,
    description: 'Антивозрастная сыворотка с ретинолом.',
    imageUrl: 'https://picsum.photos/200/200?random=7'
  },
  {
    id: 'p8',
    name: 'Effaclar Duo(+)',
    brand: 'La Roche-Posay',
    type: ProductType.CREAM,
    price: 1600,
    description: 'Корректирующий крем-гель для проблемной кожи.',
    imageUrl: 'https://picsum.photos/200/200?random=8'
  }
];

export const storage = {
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(stored);
  },

  addProduct: (product: Product) => {
    const products = storage.getProducts();
    products.push(product);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  updateProduct: (updatedProduct: Product) => {
    const products = storage.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = updatedProduct;
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    }
  },

  deleteProduct: (id: string) => {
    const products = storage.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  },

  getBoxes: (): SkincareBox[] => {
    const stored = localStorage.getItem(BOXES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getUserBoxes: (userId: string): SkincareBox[] => {
    const boxes = storage.getBoxes();
    return boxes.filter(b => b.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  saveBox: (box: SkincareBox) => {
    const boxes = storage.getBoxes();
    boxes.push(box);
    localStorage.setItem(BOXES_KEY, JSON.stringify(boxes));
  },

  // Mock User Session
  login: (email: string): User => {
    const isAdmin = email.includes('admin');
    const user: User = {
      id: isAdmin ? 'admin-id' : email, // using email as ID for simplicity
      email,
      name: email.split('@')[0],
      role: isAdmin ? 'admin' : 'user'
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  }
};
