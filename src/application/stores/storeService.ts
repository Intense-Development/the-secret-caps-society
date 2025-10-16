
import { Store } from '@/core/types';
import { postgresStoreRepository } from '@/infrastructure/repositories/postgresStoreRepository';

// Use repository from infrastructure layer (dependency inversion)
export const storeService = {
  getAllStores: async (): Promise<Store[]> => {
    try {
      return await postgresStoreRepository.findAll();
    } catch (error) {
      console.error('Error fetching all stores:', error);
      throw error;
    }
  },
  
  getStoreById: async (id: number): Promise<Store | null> => {
    try {
      return await postgresStoreRepository.findById(id);
    } catch (error) {
      console.error(`Error fetching store ${id}:`, error);
      throw error;
    }
  },
  
  searchStores: async (query: string): Promise<Store[]> => {
    try {
      return await postgresStoreRepository.searchStores(query);
    } catch (error) {
      console.error('Error searching stores:', error);
      throw error;
    }
  },
  
  createStore: async (store: Omit<Store, 'id'>): Promise<Store> => {
    try {
      return await postgresStoreRepository.create(store);
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  },
  
  updateStore: async (id: number, store: Partial<Store>): Promise<Store | null> => {
    try {
      return await postgresStoreRepository.update(id, store);
    } catch (error) {
      console.error(`Error updating store ${id}:`, error);
      throw error;
    }
  },
  
  deleteStore: async (id: number): Promise<boolean> => {
    try {
      return await postgresStoreRepository.delete(id);
    } catch (error) {
      console.error(`Error deleting store ${id}:`, error);
      throw error;
    }
  }
};
