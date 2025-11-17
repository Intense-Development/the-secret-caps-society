
// Core types used across the application

// Product types
export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  storeName: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isSoldOut?: boolean;
  providerId?: string; // ID of the provider
  providerName?: string; // Name of the provider
}

// Store types
export interface Store {
  id: number;
  name: string;
  owner: string;
  products: number;
  verified: boolean;
  location: string;
  photo?: string;
  managers?: string[]; // Store managers by user ID
}

// Provider types
export interface Provider {
  id: string;
  name: string;
  contactNumber: string;
  location: string;
  email?: string;
  website?: string;
  products: ProviderProduct[];
}

export interface ProviderProduct {
  productId: string;
  productName: string;
  wholesalePrice: number;
  suggestedRetailPrice: number;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeIds?: number[]; // Stores this user has access to (for owners and managers)
  managedStoreIds?: number[]; // Stores this user manages (for managers only)
}

// Refined user roles
export type UserRole = 
  | 'super_admin'  // Can manage all stores and users
  | 'store_owner'  // Can manage their own stores
  | 'store_manager' // Can manage assigned stores
  | 'customer';    // Regular buyer

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  storeName: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
