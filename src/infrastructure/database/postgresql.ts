
// This is a mock implementation for PostgreSQL in browser environment
// In a real application, you would use an API gateway to connect to PostgreSQL

// Mock connection status for UI feedback
const connectionStatus = {
  connected: true,
  error: null
};

// Simulated connection events
setTimeout(() => {
  console.log('Connected to PostgreSQL database (mock)');
}, 500);

// Mock query function that simulates database queries
export const query = async (text: string, params?: any[]) => {
  try {
    console.log('Executing mock query', { text, params });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data based on the query
    if (text.includes('SELECT * FROM stores')) {
      return {
        rows: [
          { id: 1, name: "CapCity Store", owner: "Jane Smith", products: 45, verified: true, location: "New York, NY", photo: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&h=350&fit=crop" },
          { id: 2, name: "East Coast Caps", owner: "Michael Wilson", products: 32, verified: true, location: "Boston, MA", photo: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&h=350&fit=crop" },
          { id: 3, name: "West Side Hats", owner: "Robert Brown", products: 18, verified: false, location: "Los Angeles, CA", photo: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=500&h=350&fit=crop" },
          { id: 4, name: "South Cap Depot", owner: "Amanda Lee", products: 27, verified: true, location: "Miami, FL", photo: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=500&h=350&fit=crop" },
          { id: 5, name: "Midwest Cap Collection", owner: "David Miller", products: 15, verified: false, location: "Chicago, IL", photo: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=500&h=350&fit=crop" }
        ],
        rowCount: 5
      };
    } else if (text.includes('SELECT * FROM products WHERE is_featured = true')) {
      return {
        rows: [
          { id: "1", title: "Classic Yankees Cap", price: 29.99, image: "/images/caps/yankees.jpg", storeName: "CapCity Store", isNew: false, isFeatured: true, isSoldOut: false },
          { id: "2", title: "LA Dodgers Fitted", price: 34.99, image: "/images/caps/dodgers.jpg", storeName: "West Side Hats", isNew: true, isFeatured: true, isSoldOut: false },
          { id: "3", title: "Chicago Cubs Limited Edition", price: 45.99, image: "/images/caps/cubs.jpg", storeName: "Midwest Cap Collection", isNew: true, isFeatured: true, isSoldOut: false }
        ],
        rowCount: 3
      };
    } else if (text.includes('SELECT * FROM products')) {
      return {
        rows: [
          { id: "1", title: "Classic Yankees Cap", price: 29.99, image: "/images/caps/yankees.jpg", storeName: "CapCity Store", isNew: false, isFeatured: true, isSoldOut: false },
          { id: "2", title: "LA Dodgers Fitted", price: 34.99, image: "/images/caps/dodgers.jpg", storeName: "West Side Hats", isNew: true, isFeatured: true, isSoldOut: false },
          { id: "3", title: "Chicago Cubs Limited Edition", price: 45.99, image: "/images/caps/cubs.jpg", storeName: "Midwest Cap Collection", isNew: true, isFeatured: true, isSoldOut: false },
          { id: "4", title: "Boston Red Sox Cap", price: 32.99, image: "/images/caps/redsox.jpg", storeName: "East Coast Caps", isNew: false, isFeatured: false, isSoldOut: false },
          { id: "5", title: "Miami Marlins Snapback", price: 27.99, image: "/images/caps/marlins.jpg", storeName: "South Cap Depot", isNew: false, isFeatured: false, isSoldOut: true }
        ],
        rowCount: 5
      };
    } else if (text.includes('SELECT * FROM stores WHERE')) {
      // Mock search results
      return {
        rows: [
          { id: 1, name: "CapCity Store", owner: "Jane Smith", products: 45, verified: true, location: "New York, NY", photo: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&h=350&fit=crop" },
        ],
        rowCount: 1
      };
    } else if (text.includes('INSERT INTO')) {
      return {
        rows: [{ id: Math.floor(Math.random() * 1000), ...params }],
        rowCount: 1
      };
    } else if (text.includes('UPDATE')) {
      return {
        rows: [{ id: params[params.length - 1], ...params }],
        rowCount: 1
      };
    } else if (text.includes('DELETE')) {
      return {
        rows: [{ id: params[0] }],
        rowCount: 1
      };
    }
    
    // Default empty response
    return {
      rows: [],
      rowCount: 0
    };
  } catch (error) {
    console.error('Error executing mock query', error);
    throw error;
  }
};

export default {
  query,
  connectionStatus
};
