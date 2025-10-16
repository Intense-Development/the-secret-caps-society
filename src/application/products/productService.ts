
import { Product } from '@/core/types';
import { postgresProductRepository } from '@/infrastructure/repositories/postgresProductRepository';

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      return await postgresProductRepository.findAll();
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },
  
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      return await postgresProductRepository.findById(id);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      return await postgresProductRepository.getFeaturedProducts();
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },
  
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      return await postgresProductRepository.create(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product | null> => {
    try {
      return await postgresProductRepository.update(id, product);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      return await postgresProductRepository.delete(id);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
};
