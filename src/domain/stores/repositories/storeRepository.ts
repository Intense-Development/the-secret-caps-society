
import { Store } from '@/core/types';

// Mock data for stores
const STORES = [
  { id: 1, name: "CapCity Store", owner: "Jane Smith", products: 45, verified: true, location: "New York, NY", photo: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&h=350&fit=crop" },
  { id: 2, name: "East Coast Caps", owner: "Michael Wilson", products: 32, verified: true, location: "Boston, MA", photo: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&h=350&fit=crop" },
  { id: 3, name: "West Side Hats", owner: "Robert Brown", products: 18, verified: false, location: "Los Angeles, CA", photo: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=500&h=350&fit=crop" },
  { id: 4, name: "South Cap Depot", owner: "Amanda Lee", products: 27, verified: true, location: "Miami, FL", photo: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=500&h=350&fit=crop" },
  { id: 5, name: "Midwest Cap Collection", owner: "David Miller", products: 15, verified: false, location: "Chicago, IL", photo: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=500&h=350&fit=crop" },
];

export const StoreRepository = {
  getAllStores: async (): Promise<Store[]> => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(STORES), 300);
    });
  },
  
  getStoreById: async (id: number): Promise<Store | null> => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      const store = STORES.find(s => s.id === id) || null;
      setTimeout(() => resolve(store), 300);
    });
  },
  
  searchStores: async (query: string): Promise<Store[]> => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      const filteredStores = STORES.filter(store => 
        store.name.toLowerCase().includes(query.toLowerCase()) ||
        store.owner.toLowerCase().includes(query.toLowerCase()) ||
        store.location.toLowerCase().includes(query.toLowerCase())
      );
      setTimeout(() => resolve(filteredStores), 300);
    });
  }
};
