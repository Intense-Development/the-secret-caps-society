
import { Product } from '@/core/types';

// Mock data for featured products - this would be replaced with API calls
const FEATURED_PRODUCTS = [
  {
    id: "1",
    title: "New York Yankees Navy 59FIFTY Fitted",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "NYC Cap Co.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "LA Dodgers Black 59FIFTY Fitted",
    price: 42.99,
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "West Coast Caps",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Chicago Bulls Red 59FIFTY Fitted",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1584724108142-8a48ac774673?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1528&q=80",
    storeName: "Windy City Headwear",
    isFeatured: true,
  },
  {
    id: "4",
    title: "Boston Red Sox Green 59FIFTY Fitted",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1595118802-9a161f3af291?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2530&q=80",
    storeName: "East Coast Caps",
    isSoldOut: true,
    isFeatured: true,
  },
];

export const ProductRepository = {
  getFeaturedProducts: async (): Promise<Product[]> => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(FEATURED_PRODUCTS), 300);
    });
  },
  
  getAllProducts: async (): Promise<Product[]> => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(FEATURED_PRODUCTS), 300);
    });
  },
  
  getProductById: async (id: string): Promise<Product | null> => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      const product = FEATURED_PRODUCTS.find(p => p.id === id) || null;
      setTimeout(() => resolve(product), 300);
    });
  }
};
