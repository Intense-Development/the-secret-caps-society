
import { Product } from '@/core/types';
import { productService } from './productService';

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    return await productService.getFeaturedProducts();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};
