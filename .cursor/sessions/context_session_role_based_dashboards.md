# Context Session: Role-Based Dashboards Implementation

## Feature Request
Implement different dashboards for USER/BUYER role and ADMIN/SELLER role.

## Session Status
🟢 **PLANNING COMPLETE** - Updated: 2025-11-11
**Status**: Ready for implementation

---

## Exploration Summary

### Current State Analysis

#### Dashboard Implementation
- **Location**: `src/app/[locale]/dashboard/page.tsx`
- **Data Service**: `src/application/dashboard/getDashboardData.ts`
- **Components**: 
  - `SummaryCards` - displays summary metrics
  - `Charts` - revenue, category, inventory, traffic visualizations
- **Current Role Support**: 
  - Uses `DashboardRole = "buyer" | "seller" | "admin"`
  - Role determined from `users` table or user metadata
  - Conditional rendering based on `showInventory` flag

#### Database Schema Analysis
- **Users Table**: `role VARCHAR(50) CHECK (role IN ('buyer', 'seller', 'admin'))`
- **Orders Table**: `buyer_id UUID`, `total_amount`, `status` (indexed)
- **Products Table**: `store_id UUID`, `price`, `stock`, `category` (indexed)
- **Stores Table**: `owner_id UUID`, `verification_status`, `products_count` (indexed)
- **Order Items Table**: Links orders to products with quantity and price

#### Current Data Source
- **Mock Data**: `src/data/dashboardData.ts` - All dashboard data is currently mocked
- **No Real Queries**: Dashboard doesn't fetch real data from database yet
- **Role Detection**: Already implemented with fallback chain

---

## Clarification Questions - USER ANSWERS ✅

### A) Dashboard Routing Approach
**User Selection: C - Hybrid approach (separate components, same route)**
- ✅ Balance between separation and simplicity
- Keep single route `/dashboard` with role-based component rendering
- Extract role-specific sections to separate components
- Maintain shared layout and structure (Navbar, Footer, container)

### B) Data Integration Strategy
**User Selection: B - Incremental approach (real data for summary cards, mock charts initially)**
- ✅ Start with real database queries for summary cards
- Keep charts using mock data initially
- Incremental approach for easier testing and faster development

### C) Admin Dashboard Scope
**User Selection: A - Full admin dashboard**
- ✅ Complete admin experience
- Includes: Store approvals, user management, platform metrics, reports

### D) Performance Requirements
**User Selection: Target load time < 2 seconds**
- ✅ Server-side caching with Next.js `unstable_cache` (60s buyer/seller, 5min admin)
- ✅ Parallel data fetching where possible
- ✅ Minimal initial data load (summary cards only)

### E) Additional Features
**User Selection: Buyer features - All requested**
- ✅ **Buyer**: Social features, price tracking, comparison tools, loyalty points
- 📝 **Seller**: Core seller features only
- 📝 **Admin**: Full admin dashboard

---

## Team Selection & Advice

### Subagents Consulted (Advice Phase)

#### @frontend-developer
**Advice Provided:**
- **Architecture**: Follow clean architecture with clear separation (presentation → application → domain → infrastructure)
- **Component Structure**: Extract role-specific components to separate files while maintaining shared layout
- **Data Fetching**: Use Server Components for initial data loading, React Query only for client-side updates
- **State Management**: React Query for server state, Context for feature-level state (buyer cart, seller preferences)
- **Performance**: Leverage Next.js caching (60s buyer/seller, 5min admin) + RSC for optimal < 2s load time

#### @ui-ux-analyzer
**Advice Provided:**
- **Information Hierarchy**: Each role should see most relevant actions first (buyer: orders, seller: sales, admin: approvals)
- **Visual Consistency**: Maintain design system across all dashboards (shared Card, Badge, Chart components)
- **Responsive Design**: Mobile-first approach, ensure dashboard works on all screen sizes
- **Accessibility**: Proper ARIA labels, keyboard navigation, focus management
- **Loading States**: Skeleton loaders for async data, clear empty states

#### @typescript-test-explorer
**Advice Provided:**
- **Test Coverage**: Separate test strategies for Server Components (async data) vs Client Components (interactions)
- **Edge Cases**: Test role switching, missing data, permission boundaries
- **Type Safety**: Use discriminated unions for role-based types
- **Mock Strategy**: Mock Supabase client in tests, use MSW for API mocking

#### @qa-criteria-validation
**Advice Provided:**
- **Acceptance Criteria**: Define Given-When-Then scenarios for each role's dashboard flow
- **E2E Tests**: Playwright tests for full user journeys (login → dashboard → actions)
- **Performance Validation**: Verify < 2s load time in E2E tests
- **Accessibility Checks**: Automated a11y testing in E2E suite

---

## Final Implementation Plan

### Phase 1: Architecture Setup & Component Structure

#### 1.1 Component Structure (Hybrid Approach)
```
src/
├── app/[locale]/dashboard/
│   └── page.tsx (role-based component renderer)
├── components/dashboard/
│   ├── buyer/
│   │   ├── BuyerDashboard.tsx (main buyer view)
│   │   ├── BuyerOrderHistory.tsx
│   │   ├── BuyerWishlist.tsx (placeholder - future feature)
│   │   ├── BuyerRecommendations.tsx
│   │   └── BuyerSpendingChart.tsx (uses mock data initially)
│   ├── seller/
│   │   ├── SellerDashboard.tsx (main seller view)
│   │   ├── SellerRevenueChart.tsx (uses mock data initially)
│   │   ├── SellerInventoryChart.tsx (uses mock data initially)
│   │   ├── SellerOrderList.tsx
│   │   ├── SellerProductList.tsx
│   │   └── SellerLowStockAlerts.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx (main admin view)
│   │   ├── AdminStoreApprovals.tsx
│   │   ├── AdminPlatformMetrics.tsx
│   │   ├── AdminUserManagement.tsx
│   │   └── AdminRevenueChart.tsx (uses mock data initially)
│   └── shared/
│       ├── SummaryCards.tsx (existing - will use real data)
│       └── Charts.tsx (existing - will use mock data initially)
└── application/dashboard/
    ├── getDashboardData.ts (refactor to route to role-specific)
    ├── buyer/
    │   └── getBuyerDashboardData.ts (real queries for summary cards)
    ├── seller/
    │   └── getSellerDashboardData.ts (real queries for summary cards)
    └── admin/
        └── getAdminDashboardData.ts (real queries for summary cards)
```

#### 1.2 Refactor Dashboard Page
**File**: `src/app/[locale]/dashboard/page.tsx`

```typescript
// Pseudo-code structure
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login?redirectTo=/dashboard");
  
  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .maybeSingle();
  
  const role = determineRole(profile, user); // Existing logic
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      <main className="flex-1 py-10 md:py-12">
        <div className="container space-y-8">
          {role === "buyer" && <BuyerDashboard userId={user.id} />}
          {role === "seller" && <SellerDashboard userId={user.id} />}
          {role === "admin" && <AdminDashboard />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

### Phase 2: Buyer Dashboard Implementation

#### 2.1 Buyer Dashboard Data Service
**File**: `src/application/dashboard/buyer/getBuyerDashboardData.ts`

**Real Queries (Summary Cards):**
```typescript
// 1. Total orders count
SELECT COUNT(*) FROM orders WHERE buyer_id = userId

// 2. Total spent (lifetime)
SELECT SUM(total_amount) FROM orders 
WHERE buyer_id = userId AND status = 'completed'

// 3. Recent order date
SELECT MAX(created_at) FROM orders WHERE buyer_id = userId

// 4. Pending orders count
SELECT COUNT(*) FROM orders 
WHERE buyer_id = userId AND status IN ('pending', 'processing')
```

**Mock Data (Charts):**
- Spending trends chart (use existing mock data)
- Order history timeline (use mock data initially)
- Category distribution (use mock data initially)

#### 2.2 Buyer Dashboard Component
**File**: `src/components/dashboard/buyer/BuyerDashboard.tsx`

**Features:**
- Summary Cards (real data): Orders placed, Total spent, Recent order, Pending orders
- Order History Section (real data): List of recent orders with status
- Spending Trends Chart (mock data initially)
- Recommendations Section (future - placeholder)
- Action Items: Complete profile, Leave feedback, Add payment method

#### 2.3 i18n Integration
Add translation keys to `messages/en.json`, `messages/es.json`, `messages/ar.json`:
```json
{
  "dashboard": {
    "buyer": {
      "title": "Welcome back",
      "summary": {
        "ordersPlaced": "Orders placed",
        "totalSpent": "Total spent",
        "recentOrder": "Recent order",
        "pendingOrders": "Pending orders"
      }
    }
  }
}
```

---

### Phase 3: Seller Dashboard Implementation

#### 3.1 Seller Dashboard Data Service
**File**: `src/application/dashboard/seller/getSellerDashboardData.ts`

**Real Queries (Summary Cards):**
```typescript
// 1. Get user's stores
SELECT id FROM stores WHERE owner_id = userId

// 2. Total revenue (7 days)
SELECT SUM(oi.price * oi.quantity) 
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN stores s ON p.store_id = s.id
WHERE s.owner_id = userId
AND oi.created_at >= NOW() - INTERVAL '7 days'

// 3. Orders fulfilled (count)
SELECT COUNT(DISTINCT o.id)
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN stores s ON p.store_id = s.id
WHERE s.owner_id = userId
AND o.status = 'completed'

// 4. Products listed (count)
SELECT COUNT(*) FROM products 
WHERE store_id IN (SELECT id FROM stores WHERE owner_id = userId)

// 5. Low stock alerts (count)
SELECT COUNT(*) FROM products 
WHERE store_id IN (SELECT id FROM stores WHERE owner_id = userId)
AND stock < 10  -- or reorder_point if exists
```

**Mock Data (Charts):**
- Revenue trajectory chart (use existing mock data)
- Category distribution (use existing mock data)
- Inventory health chart (use existing mock data)

#### 3.2 Seller Dashboard Component
**File**: `src/components/dashboard/seller/SellerDashboard.tsx`

**Features:**
- Summary Cards (real data): Revenue (7d/30d), Orders fulfilled, Products listed, Low stock alerts
- Revenue Chart (mock data initially)
- Inventory Health Chart (mock data initially)
- Order Management Section (real data): Pending orders list
- Product Management Quick Actions
- Action Items: Review low stock, Approve orders, Launch promotion

---

### Phase 4: Admin Dashboard Implementation

#### 4.1 Admin Dashboard Data Service
**File**: `src/application/dashboard/admin/getAdminDashboardData.ts`

**Real Queries (Summary Cards):**
```typescript
// 1. Total platform revenue (all time)
SELECT SUM(total_amount) FROM orders WHERE status = 'completed'

// 2. Active stores (verified count)
SELECT COUNT(*) FROM stores WHERE verification_status = 'verified'

// 3. Pending store approvals (count)
SELECT COUNT(*) FROM stores WHERE verification_status = 'pending'

// 4. Active users (buyers + sellers)
SELECT COUNT(*) FROM users WHERE role IN ('buyer', 'seller')

// 5. Pending store approvals (list)
SELECT * FROM stores 
WHERE verification_status = 'pending' 
ORDER BY created_at ASC
LIMIT 10
```

**Mock Data (Charts):**
- Platform revenue trends (use existing mock data)
- User growth metrics (use existing mock data)
- Store distribution (use existing mock data)

#### 4.2 Admin Dashboard Component
**File**: `src/components/dashboard/admin/AdminDashboard.tsx`

**Features:**
- Summary Cards (real data): Platform revenue, Active stores, Pending approvals, Active users
- Store Approvals Section (real data): List of pending stores with approve/reject actions
- Platform Metrics Chart (mock data initially)
- User Management Quick View (real data): Recent users, role distribution
- Action Items: Approve stores (high priority), Review flagged content, Reconcile payouts

#### 4.3 Store Approvals Component
**File**: `src/components/dashboard/admin/AdminStoreApprovals.tsx`

**Features:**
- List pending stores with details
- View store verification documents
- Approve/Reject actions with confirmation
- Bulk actions for multiple stores

---

### Phase 5: Data Service Layer & Caching

#### 5.1 Caching Strategy (< 2s load time)
**File**: `src/application/dashboard/{role}/get{Role}DashboardData.ts`

```typescript
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function getBuyerDashboardData(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      // Real queries here
      // Return dashboard data
    },
    [`buyer-dashboard-${userId}`],
    {
      revalidate: 60, // 60 seconds for buyer
      tags: [`dashboard-buyer-${userId}`]
    }
  )();
}

export async function getSellerDashboardData(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      // Real queries here
    },
    [`seller-dashboard-${userId}`],
    {
      revalidate: 60, // 60 seconds for seller
      tags: [`dashboard-seller-${userId}`]
    }
  )();
}

export async function getAdminDashboardData() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      // Real queries here
    },
    ['admin-dashboard'],
    {
      revalidate: 300, // 5 minutes for admin
      tags: ['dashboard-admin']
    }
  )();
}
```

#### 5.2 Data Transformation
- Convert raw SQL results to dashboard-compatible formats
- Format currency and percentages
- Handle date grouping for charts (when migrating from mock to real)

#### 5.3 Error Handling
- Handle missing data gracefully
- Show empty states when no data available
- Log errors server-side, show user-friendly messages client-side

---

### Phase 6: Testing Strategy

#### 6.1 Unit Tests
**Files:**
- `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`
- `src/__tests__/application/dashboard/seller/getSellerDashboardData.test.ts`
- `src/__tests__/application/dashboard/admin/getAdminDashboardData.test.ts`

**Test Cases:**
- Test data transformation functions
- Test summary card calculations
- Test caching behavior
- Test error handling

#### 6.2 Component Tests
**Files:**
- `src/components/dashboard/__tests__/buyer/BuyerDashboard.test.tsx`
- `src/components/dashboard/__tests__/seller/SellerDashboard.test.tsx`
- `src/components/dashboard/__tests__/admin/AdminDashboard.test.tsx`

**Test Cases:**
- Test buyer dashboard renders correctly
- Test seller dashboard renders correctly
- Test admin dashboard renders correctly
- Test empty states
- Test loading states

#### 6.3 E2E Tests
**File**: `e2e/dashboard.spec.ts`

**Test Scenarios:**
```typescript
describe('Dashboard E2E', () => {
  test('Buyer dashboard displays correctly', async () => {
    // Login as buyer
    // Navigate to dashboard
    // Verify buyer-specific content
    // Verify summary cards show real data
    // Verify load time < 2s
  });

  test('Seller dashboard displays correctly', async () => {
    // Login as seller
    // Navigate to dashboard
    // Verify seller-specific content
    // Verify summary cards show real data
  });

  test('Admin dashboard displays correctly', async () => {
    // Login as admin
    // Navigate to dashboard
    // Verify admin-specific content
    // Verify store approvals section
  });
});
```

---

### Phase 7: Buyer Additional Features (Future Phase)

**Note**: These features require new database tables and will be implemented after core dashboard is complete.

#### 7.1 Social Features
**Database Schema:**
```sql
-- User follows table
CREATE TABLE user_follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE user_wishlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7.2 Price Tracking
**Database Schema:**
```sql
CREATE TABLE product_price_history (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  price DECIMAL(10, 2),
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

#### 7.3 Comparison Tools
- Client-side component for side-by-side product comparison
- No additional database tables needed

#### 7.4 Loyalty Points System
**Database Schema:**
```sql
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  points INTEGER NOT NULL,
  source VARCHAR(50),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Phase 8: Documentation

#### 8.1 Code Documentation
- JSDoc comments for all data service functions
- Component prop documentation
- Database query documentation

#### 8.2 Translation Keys
Add dashboard translations to `messages/{locale}.json`:
```json
{
  "dashboard": {
    "buyer": { ... },
    "seller": { ... },
    "admin": { ... },
    "shared": {
      "title": "Welcome back, {name}",
      "summary": { ... },
      "charts": { ... }
    }
  }
}
```

#### 8.3 Architecture Documentation
- Dashboard routing architecture diagram
- Data flow diagrams
- Caching strategy documentation

---

## Implementation Checklist

### Phase 1: Architecture Setup
- [ ] Refactor `dashboard/page.tsx` to render role-specific components
- [ ] Create `BuyerDashboard.tsx` component
- [ ] Create `SellerDashboard.tsx` component
- [ ] Create `AdminDashboard.tsx` component
- [ ] Update component structure

### Phase 2: Buyer Dashboard
- [ ] Create `getBuyerDashboardData.ts` with real queries
- [ ] Implement summary cards with real data
- [ ] Create `BuyerOrderHistory.tsx` component
- [ ] Add buyer translation keys
- [ ] Write buyer dashboard tests

### Phase 3: Seller Dashboard
- [ ] Create `getSellerDashboardData.ts` with real queries
- [ ] Implement summary cards with real data
- [ ] Create `SellerOrderList.tsx` component
- [ ] Create `SellerLowStockAlerts.tsx` component
- [ ] Add seller translation keys
- [ ] Write seller dashboard tests

### Phase 4: Admin Dashboard
- [ ] Create `getAdminDashboardData.ts` with real queries
- [ ] Implement summary cards with real data
- [ ] Create `AdminStoreApprovals.tsx` component
- [ ] Create `AdminUserManagement.tsx` component
- [ ] Add admin translation keys
- [ ] Write admin dashboard tests

### Phase 5: Caching & Performance
- [ ] Implement Next.js caching for all data services
- [ ] Verify load time < 2 seconds
- [ ] Add performance monitoring
- [ ] Optimize database queries

### Phase 6: Testing
- [ ] Write unit tests for data services
- [ ] Write component tests for dashboards
- [ ] Write E2E tests for dashboard flows
- [ ] Test performance (< 2s load time)

### Phase 7: Buyer Additional Features (Future)
- [ ] Design database schema for social features
- [ ] Design database schema for price tracking
- [ ] Design database schema for loyalty points
- [ ] Implement social features
- [ ] Implement price tracking
- [ ] Implement comparison tools
- [ ] Implement loyalty points system

### Phase 8: Documentation
- [ ] Add JSDoc comments
- [ ] Add translation keys
- [ ] Create architecture diagrams
- [ ] Update README with dashboard features

---

## Next Steps

1. ✅ **Planning complete** - All clarifications received
2. ✅ **Architecture decided** - Hybrid approach
3. ✅ **Data strategy defined** - Incremental real data
4. ✅ **Performance targets set** - < 2s load time
5. 🚀 **Ready for implementation** - Begin Phase 1

---

## Notes

- Dashboard currently uses mock data - will migrate to real queries incrementally
- Role detection already implemented in dashboard page
- Database schema supports all required queries
- RLS policies already configured
- i18n infrastructure exists - need to add dashboard translations
- Follow Clean Architecture principles
- Maintain TypeScript strict mode compliance
- Ensure RLS policies allow proper data access per role
