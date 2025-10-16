
import { Product } from "@/core/types";

// Mock data for products
export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "New York Yankees Navy 59FIFTY Fitted",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "NYC Cap Co.",
    isNew: true,
  },
  {
    id: "2",
    title: "LA Dodgers Black 59FIFTY Fitted",
    price: 42.99,
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "West Coast Caps",
  },
  {
    id: "3",
    title: "Chicago Bulls Red 59FIFTY Fitted",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1584724108142-8a48ac774673?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1528&q=80",
    storeName: "Windy City Headwear",
  },
  {
    id: "4",
    title: "Boston Red Sox Green 59FIFTY Fitted",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1595118649362-19176f3d16dc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "East Coast Caps",
    isSoldOut: true,
  },
  {
    id: "5",
    title: "Miami Marlins Teal 59FIFTY Fitted",
    price: 41.99,
    image: "https://images.unsplash.com/photo-1595118649362-19176f3d16dc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "South Beach Caps",
    isNew: true,
  },
  {
    id: "6",
    title: "Seattle Mariners Navy 59FIFTY Fitted",
    price: 43.99,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1936&q=80",
    storeName: "Northwest Caps",
  },
  {
    id: "7",
    title: "Toronto Blue Jays Blue 59FIFTY Fitted",
    price: 46.99,
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2480&q=80",
    storeName: "Canadian Caps",
  },
  {
    id: "8",
    title: "Detroit Tigers Orange 59FIFTY Fitted",
    price: 40.99,
    image: "https://images.unsplash.com/photo-1581701152188-3d5c86c2986a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1527&q=80",
    storeName: "Motor City Caps",
    isSoldOut: true,
  },
];

// Function to get related products
export const getRelatedProducts = (selectedProduct: Product | null, allProducts: Product[]) => {
  // In a real app, this would be based on categories, tags, or ML recommendations
  // For now, we'll just return a few random products that aren't the selected one
  return selectedProduct ? 
    allProducts.filter(p => p.id !== selectedProduct.id).slice(0, 3) : 
    [];
};
