# Feature: Implement Seller and Buyer Dashboards

## Problem Statement

Currently, the dashboard at `/dashboard` uses a single shared view for all user roles (buyer, seller, admin) with conditional rendering based on a `showInventory` flag. All dashboard data is mocked (`src/data/dashboardData.ts`), which means users don't see their actual purchase history, sales metrics, or real-time data.

**Current Limitations:**
- All dashboard data is mocked, showing the same fake data for all users
- Buyers and sellers see similar views with only minor differences
- No real database queries for orders, revenue, or inventory metrics
- No role-specific sections (e.g., buyers can't see their order history, sellers can't see their sales)
- Poor user experience - users can't track their actual activity or performance

## User Value

### For Buyers:
- **See their real purchase history** - View actual orders with status, dates, and amounts
- **Track spending** - See lifetime total spent and spending trends over time
- **Monitor order status** - Check pending, processing, and completed orders
- **Personalized insights** - Get recommendations based on their actual purchase history

**Example**: A buyer logs in and immediately sees "You've placed 5 orders totaling $450" with a list of their recent orders, instead of seeing generic mock data.

### For Sellers:
- **View actual sales metrics** - See real revenue (7-day and 30-day totals) from their stores
- **Monitor inventory** - Get alerts for low stock items based on actual product counts
- **Track orders** - See pending orders that need fulfillment from their stores
- **Manage products** - Quick access to product listings with real counts

**Example**: A seller logs in and sees "Revenue: $1,250 (7 days)" with their actual sales, a list of 3 pending orders to fulfill, and 5 products running low on stock.

### Performance Benefits:
- Dashboard loads in < 2 seconds with server-side caching
- Real-time data updates every 60 seconds for buyers/sellers
- Better user experience with actual, actionable information

## Technical Approach

### Architecture: Hybrid Approach
- Keep single route `/dashboard` with role-based component rendering
- Extract role-specific sections to separate components:
  - `BuyerDashboard.tsx` - Buyer-specific sections
  - `SellerDashboard.tsx` - Seller-specific sections
  - Shared layout (Navbar, Footer, container) maintained

### Data Integration: Incremental Real Data
- **Phase 1**: Real database queries for summary cards (orders, revenue, inventory)
- **Phase 2**: Charts use mock data initially (migrate to real data later)
- Incremental approach allows faster development and easier testing

### Performance Optimization:
- Server-side caching with Next.js `unstable_cache` (60s buyer/seller)
- Parallel data fetching where possible
- Minimal initial data load (summary cards only)

## Implementation Plan

### Phase 1: Architecture Setup
- [ ] Refactor `src/app/[locale]/dashboard/page.tsx` to render role-specific components
- [ ] Create `src/components/dashboard/buyer/BuyerDashboard.tsx`
- [ ] Create `src/components/dashboard/seller/SellerDashboard.tsx`

### Phase 2: Buyer Dashboard
- [ ] Create `src/application/dashboard/buyer/getBuyerDashboardData.ts` with real queries
- [ ] Implement summary cards with real data:
  - Total orders count
  - Total spent (lifetime, completed orders)
  - Recent order date
  - Pending orders count
- [ ] Create `BuyerOrderHistory.tsx` component with real order data
- [ ] Add i18n translation keys for buyer dashboard

### Phase 3: Seller Dashboard
- [ ] Create `src/application/dashboard/seller/getSellerDashboardData.ts` with real queries
- [ ] Implement summary cards with real data:
  - Total revenue (7 days, 30 days) from seller's stores
  - Orders fulfilled count
  - Products listed count
  - Low stock alerts count
- [ ] Create `SellerOrderList.tsx` component with pending orders
- [ ] Create `SellerLowStockAlerts.tsx` component
- [ ] Add i18n translation keys for seller dashboard

### Phase 4: Caching & Performance
- [ ] Implement Next.js caching for all data services
- [ ] Verify load time < 2 seconds
- [ ] Add error handling and empty states

### Phase 5: Testing
- [ ] Write unit tests for data services (`getBuyerDashboardData.test.ts`, `getSellerDashboardData.test.ts`)
- [ ] Write component tests for dashboards
- [ ] Write E2E tests for dashboard flows (`e2e/dashboard.spec.ts`)

## Definition of Done

- [ ] **Implementation complete** with edge cases handled:
  - Buyer dashboard shows real order data from database
  - Seller dashboard shows real revenue and inventory from database
  - Role-based component rendering works correctly
  - Empty states displayed when no data available
  - Error handling for database failures

- [ ] **Unit tests added** (>80% coverage):
  - Data service functions tested with mocked Supabase client
  - Summary card calculations verified
  - Caching behavior validated
  - Error handling scenarios covered

- [ ] **Integration tests** for main flows:
  - Test dashboard data fetching with mocked database
  - Test role detection and component rendering
  - Test permission boundaries

- [ ] **E2E tests** written:
  - Buyer login → dashboard → view orders flow
  - Seller login → dashboard → view sales flow
  - Verify load time < 2 seconds in E2E tests
  - Test empty states and error scenarios

- [ ] **Documentation updated**:
  - JSDoc comments for all data service functions
  - Component prop documentation
  - Translation keys added to `messages/en.json`, `messages/es.json`, `messages/ar.json`

- [ ] **Code review approved**:
  - Follows Clean Architecture principles
  - TypeScript strict mode compliance
  - RLS policies verified for data access

- [ ] **CI/CD passes**:
  - All tests passing
  - No linting errors
  - TypeScript compilation successful

- [ ] **Manual testing complete** (see checklist below)

## Manual Testing Checklist

### Basic Flow Testing

#### Buyer Dashboard:
1. **Login as buyer user**
   - Navigate to `/dashboard`
   - Verify buyer-specific dashboard renders
   - Verify welcome message shows buyer name

2. **Summary Cards (Real Data)**
   - Verify "Orders placed" shows actual count from database
   - Verify "Total spent" shows sum of completed orders
   - Verify "Recent order" shows most recent order date
   - Verify "Pending orders" shows count of pending/processing orders

3. **Order History Section**
   - Verify list of recent orders displays
   - Verify each order shows: status, date, total amount
   - Verify orders are sorted by most recent first
   - Verify "View all orders" link works (if implemented)

4. **Performance**
   - Verify dashboard loads in < 2 seconds
   - Verify data is cached (refresh shows same data for 60s)
   - Verify no console errors

#### Seller Dashboard:
1. **Login as seller user**
   - Navigate to `/dashboard`
   - Verify seller-specific dashboard renders
   - Verify welcome message shows seller name

2. **Summary Cards (Real Data)**
   - Verify "Revenue (7 days)" shows actual revenue from seller's stores
   - Verify "Orders fulfilled" shows count of completed orders
   - Verify "Products listed" shows actual product count
   - Verify "Low stock alerts" shows count of products with stock < 10

3. **Order Management Section**
   - Verify pending orders list displays
   - Verify orders show product details and buyer information
   - Verify order status is visible
   - Verify "View all orders" link works (if implemented)

4. **Low Stock Alerts**
   - Verify low stock products are listed
   - Verify stock counts are accurate
   - Verify alerts are sorted by urgency (lowest stock first)

5. **Performance**
   - Verify dashboard loads in < 2 seconds
   - Verify data is cached (refresh shows same data for 60s)
   - Verify no console errors

### Edge Case Testing

1. **No Data Scenarios**
   - Test buyer with no orders → verify empty state message
   - Test seller with no products → verify empty state message
   - Test seller with no orders → verify empty orders section

2. **Role Switching**
   - Test user with role change → verify correct dashboard renders
   - Test fallback to default role (buyer) if role not found

3. **Database Errors**
   - Simulate database connection failure → verify error message displayed
   - Simulate RLS policy blocking → verify appropriate error handling

4. **Caching Behavior**
   - Verify data refreshes after cache expiry (60s)
   - Verify manual refresh clears cache (if implemented)

### Error Handling Testing

1. **Network Errors**
   - Disconnect network → verify error message
   - Reconnect → verify data loads correctly

2. **Authentication Errors**
   - Expired session → verify redirect to login
   - Invalid token → verify redirect to login

3. **Missing Data**
   - Missing user profile → verify default role assignment
   - Missing store data → verify seller dashboard handles gracefully

### Integration Testing

1. **With Existing Features**
   - Test dashboard with active cart → verify cart indicator works
   - Test dashboard with unread notifications → verify notifications display
   - Test dashboard after placing order → verify order appears immediately (after cache refresh)

2. **i18n Integration**
   - Test buyer dashboard in English → verify all labels translate
   - Test seller dashboard in Spanish → verify all labels translate
   - Test dashboard in Arabic → verify RTL layout works

3. **Responsive Design**
   - Test buyer dashboard on mobile → verify responsive layout
   - Test seller dashboard on tablet → verify cards stack correctly
   - Test dashboard on desktop → verify optimal layout

## Database Queries Required

### Buyer Dashboard Queries:
```sql
-- Total orders count
SELECT COUNT(*) FROM orders WHERE buyer_id = :userId

-- Total spent (completed orders)
SELECT SUM(total_amount) FROM orders 
WHERE buyer_id = :userId AND status = 'completed'

-- Recent order date
SELECT MAX(created_at) FROM orders WHERE buyer_id = :userId

-- Pending orders count
SELECT COUNT(*) FROM orders 
WHERE buyer_id = :userId AND status IN ('pending', 'processing')

-- Recent orders list
SELECT * FROM orders 
WHERE buyer_id = :userId 
ORDER BY created_at DESC 
LIMIT 10
```

### Seller Dashboard Queries:
```sql
-- Get seller's stores
SELECT id FROM stores WHERE owner_id = :userId

-- Total revenue (7 days)
SELECT SUM(oi.price * oi.quantity) 
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN stores s ON p.store_id = s.id
WHERE s.owner_id = :userId
AND oi.created_at >= NOW() - INTERVAL '7 days'

-- Orders fulfilled count
SELECT COUNT(DISTINCT o.id)
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN stores s ON p.store_id = s.id
WHERE s.owner_id = :userId AND o.status = 'completed'

-- Products listed count
SELECT COUNT(*) FROM products 
WHERE store_id IN (SELECT id FROM stores WHERE owner_id = :userId)

-- Low stock alerts
SELECT * FROM products 
WHERE store_id IN (SELECT id FROM stores WHERE owner_id = :userId)
AND stock < 10
ORDER BY stock ASC
```

## Related Files

- `src/app/[locale]/dashboard/page.tsx` - Dashboard page (to be refactored)
- `src/application/dashboard/getDashboardData.ts` - Current data service (to be refactored)
- `src/components/dashboard/SummaryCards.tsx` - Summary cards component (existing)
- `src/data/dashboardData.ts` - Mock data (will keep for charts initially)
- `src/infrastructure/database/migrations/002_complete_schema.sql` - Database schema (already exists)

## Notes

- Charts will use mock data initially (Phase 2 will migrate to real data)
- Admin dashboard implementation is out of scope for this issue (separate issue)
- Buyer additional features (social, price tracking, loyalty) are out of scope (future issue)
- RLS policies are already configured and should allow proper data access

