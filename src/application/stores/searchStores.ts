
import { Store } from '@/core/types';
import { storeService } from './storeService';

export const searchStores = async (query: string): Promise<Store[]> => {
  try {
    return await storeService.searchStores(query);
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
};
