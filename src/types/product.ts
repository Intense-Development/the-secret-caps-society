
export interface ProductType {
  id: number;
  name: string;
  price: number;
  store: string;
  inStock: boolean;
  sales: number;
  images: string[];
  image?: string;
  description?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isSoldOut?: boolean;
  sizes?: string[];
  colors?: string[];
  teams?: string[];
  relatedProducts?: number[];
  providerId?: string;
  providerName?: string;
  discount?: number;
  discountType?: 'percentage' | 'amount';
}

export interface EditProductFormType {
  name: string;
  price: number;
  store: string;
  inStock: boolean;
  providerId?: string;
  discount?: number;
  discountType: 'percentage' | 'amount';
  images: string[];
}
