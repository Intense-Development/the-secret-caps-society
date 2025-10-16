
import { useState } from 'react';
import { Store } from '@/core/types';
import { useQuery } from '@tanstack/react-query';
import { StoreRepository } from '@/domain/stores/repositories/storeRepository';

export const useStores = (initialQuery: string = '') => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  const { 
    data: stores = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['stores'],
    queryFn: StoreRepository.getAllStores,
  });
  
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    stores: filteredStores,
    allStores: stores,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
  };
};
