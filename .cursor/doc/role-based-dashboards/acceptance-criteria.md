# Acceptance Criteria: Role-Based Dashboards (Issue #11)

## Feature: Implement Seller and Buyer Dashboards

### User Story

**As a buyer**, I want to **see my actual purchase history and spending metrics on the dashboard** so that I can **track my orders, monitor spending, and get personalized insights based on my real purchase data**.

**As a seller**, I want to **view my actual sales metrics, inventory status, and pending orders on the dashboard** so that I can **manage my store effectively, track revenue, and respond to orders promptly**.

**As both buyer and seller**, I want the **dashboard to load quickly (< 2 seconds)** so that I can **access my information without waiting**.

---

## Acceptance Criteria

### AC1: Role-Based Dashboard Rendering

**Given** a user is authenticated and navigates to `/dashboard`  
**When** their role is "buyer"  
**Then** they should see the `BuyerDashboard` component  
**And** they should see buyer-specific summary cards:
- Orders placed (total count)
- Total spent (lifetime, completed orders only)
- Recent order date (most recent)
- Pending orders count (pending + processing status)

**Given** a user is authenticated and navigates to `/dashboard`  
**When** their role is "seller"  
**Then** they should see the `SellerDashboard` component  
**And** they should see seller-specific summary cards:
- Revenue (7 days) - total from seller's stores
- Orders fulfilled - count of completed orders
- Products listed - count of products in seller's stores
- Low stock alerts - count of products with stock < 10

**Given** a user is authenticated and navigates to `/dashboard`  
**When** their role cannot be determined (null/undefined)  
**Then** they should see the `BuyerDashboard` component (default fallback)

**Given** a user is not authenticated and navigates to `/dashboard`  
**When** the page loads  
**Then** they should be redirected to `/login?redirectTo=/dashboard`

---

### AC2: Buyer Dashboard Real Data

**Given** a buyer user views their dashboard  
**When** they have orders in the database  
**Then** the "Orders placed" card should show the actual count from database  
**And** the "Total spent" card should show the sum of completed orders' total_amount  
**And** the "Recent order" card should show the MAX(created_at) from their orders  
**And** the "Pending orders" card should show the count of orders with status 'pending' or 'processing'

**Given** a buyer user views their dashboard  
**When** they have no orders in the database  
**Then** all summary cards should show "0" or appropriate empty state  
**And** the "Total spent" card should show "$0.00"  
**And** the "Recent order" card should show "N/A" or similar  
**And** an empty state message should be displayed: "You haven't placed any orders yet"

**Given** a buyer user views their dashboard  
**When** the order history section loads  
**Then** it should display a list of their recent orders (up to 10)  
**And** each order should show: status, date (created_at), total amount  
**And** orders should be sorted by most recent first (ORDER BY created_at DESC)

**Example**: Buyer with 5 completed orders totaling $450 should see:
- Orders placed: "5"
- Total spent: "$450.00"
- Recent order: "Nov 5, 2025" (or formatted date)
- Pending orders: "0"

---

### AC3: Seller Dashboard Real Data

**Given** a seller user views their dashboard  
**When** they have stores and products  
**Then** the "Revenue (7 days)" card should show the actual revenue from order_items in the last 7 days  
**And** revenue should be calculated as SUM(oi.price * oi.quantity) from order_items JOIN products JOIN stores WHERE store.owner_id = seller.user_id  
**And** the "Orders fulfilled" card should show the count of DISTINCT completed orders from their products  
**And** the "Products listed" card should show the count of products from their stores  
**And** the "Low stock alerts" card should show the count of products with stock < 10

**Given** a seller user views their dashboard  
**When** they have no stores  
**Then** all summary cards should show "0" or appropriate empty state  
**And** an empty state message should be displayed: "You haven't created any stores yet"

**Given** a seller user views their dashboard  
**When** the low stock alerts section loads  
**Then** it should display products with stock < 10  
**And** products should be sorted by stock ascending (lowest first)  
**And** each product should show: name, current stock, category

**Given** a seller user views their dashboard  
**When** the order management section loads  
**Then** it should display pending orders for their products  
**And** each order should show: order status, product details, buyer information, date

**Example**: Seller with $1,250 revenue in 7 days, 3 pending orders, 45 products, 5 low stock items should see:
- Revenue (7 days): "$1,250.00"
- Orders fulfilled: "12"
- Products listed: "45"
- Low stock alerts: "5"

---

### AC4: Performance Requirements

**Given** a user navigates to `/dashboard`  
**When** the page loads  
**Then** the dashboard should be fully rendered in < 2 seconds  
**And** summary cards should display real data from database  
**And** no console errors should be present

**Given** a user refreshes the dashboard  
**When** less than 60 seconds have passed since last load  
**Then** the data should be served from cache (no database query)  
**And** the page should load faster (< 1 second)

**Given** a user refreshes the dashboard  
**When** more than 60 seconds have passed since last load  
**Then** fresh data should be fetched from database  
**And** cache should be updated with new data

**Given** multiple users access their dashboards simultaneously  
**When** they each have different userIds  
**Then** each user should see their own cached data  
**And** cache keys should include userId for proper isolation

---

### AC5: Data Service Caching

**Given** `getBuyerDashboardData` is called  
**When** it fetches data from database  
**Then** it should use Next.js `unstable_cache` with:
- Cache key: `buyer-dashboard-${userId}`
- Revalidation time: 60 seconds
- Tags: `['dashboard-buyer-${userId}']`

**Given** `getSellerDashboardData` is called  
**When** it fetches data from database  
**Then** it should use Next.js `unstable_cache` with:
- Cache key: `seller-dashboard-${userId}`
- Revalidation time: 60 seconds
- Tags: `['dashboard-seller-${userId}']`

**Given** data is cached  
**When** a new order is placed or product is updated  
**Then** the cache should remain valid until expiry (no immediate invalidation required for MVP)

---

### AC6: Error Handling

**Given** a user views their dashboard  
**When** the database query fails (connection timeout, RLS violation, etc.)  
**Then** an error message should be displayed: "Unable to load dashboard data. Please try again."  
**And** the error should be logged server-side  
**And** the application should not crash

**Given** a user views their dashboard  
**When** the user profile is missing (exists in Auth but not in users table)  
**Then** the system should default to "buyer" role  
**And** the dashboard should render correctly

**Given** a seller user views their dashboard  
**When** they have stores but no products  
**Then** the "Products listed" card should show "0"  
**And** the "Low stock alerts" section should show empty state  
**And** no errors should occur

---

### AC7: Empty States

**Given** a buyer user views their dashboard  
**When** they have no orders  
**Then** the order history section should display: "You haven't placed any orders yet. Start shopping to see your order history here."  
**And** summary cards should show "0" values  
**And** the UI should remain functional and not show errors

**Given** a seller user views their dashboard  
**When** they have no stores  
**Then** an empty state should be displayed: "You haven't created any stores yet. Create your first store to start selling."  
**And** all summary cards should show "0" or "N/A"

**Given** a seller user views their dashboard  
**When** they have stores but no orders  
**Then** the order management section should show: "No pending orders. Your orders will appear here when customers purchase your products."

---

### AC8: Component Architecture

**Given** the dashboard page is implemented  
**When** a user accesses `/dashboard`  
**Then** the page should render role-specific components:
- `BuyerDashboard.tsx` for buyer role
- `SellerDashboard.tsx` for seller role
- Shared layout (Navbar, Footer) should be maintained

**Given** the dashboard components are created  
**When** they are imported and used  
**Then** they should be Server Components by default  
**And** only use `"use client"` when necessary (interactive elements)

**Given** dashboard data services are implemented  
**When** they are called  
**Then** they should be in `src/application/dashboard/{role}/get{Role}DashboardData.ts`  
**And** they should follow Clean Architecture principles

---

### AC9: Database Queries

**Given** `getBuyerDashboardData` is called  
**When** it queries the database  
**Then** it should use these queries:
- `SELECT COUNT(*) FROM orders WHERE buyer_id = :userId` (orders count)
- `SELECT SUM(total_amount) FROM orders WHERE buyer_id = :userId AND status = 'completed'` (total spent)
- `SELECT MAX(created_at) FROM orders WHERE buyer_id = :userId` (recent order)
- `SELECT COUNT(*) FROM orders WHERE buyer_id = :userId AND status IN ('pending', 'processing')` (pending count)
- `SELECT * FROM orders WHERE buyer_id = :userId ORDER BY created_at DESC LIMIT 10` (recent orders)

**Given** `getSellerDashboardData` is called  
**When** it queries the database  
**Then** it should use these queries:
- `SELECT id FROM stores WHERE owner_id = :userId` (get stores)
- `SELECT SUM(oi.price * oi.quantity) FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN stores s ON p.store_id = s.id WHERE s.owner_id = :userId AND oi.created_at >= NOW() - INTERVAL '7 days'` (revenue 7d)
- `SELECT COUNT(DISTINCT o.id) FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id JOIN stores s ON p.store_id = s.id WHERE s.owner_id = :userId AND o.status = 'completed'` (orders fulfilled)
- `SELECT COUNT(*) FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = :userId)` (products count)
- `SELECT * FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = :userId) AND stock < 10 ORDER BY stock ASC` (low stock)

**Given** queries are executed  
**When** they access database tables  
**Then** RLS policies should allow proper data access:
- Buyers can read their own orders
- Sellers can read their own stores and products
- Service role has full access for admin operations

---

### AC10: i18n Integration

**Given** a user views the dashboard  
**When** they have selected a locale (en, es, ar)  
**Then** all dashboard labels should be translated  
**And** summary card titles should use translation keys  
**And** empty state messages should use translation keys

**Given** translation keys are added  
**When** dashboard components render  
**Then** keys should follow pattern: `dashboard.{role}.{section}.{key}`  
**Example**: `dashboard.buyer.summary.ordersPlaced`, `dashboard.seller.summary.revenue7Days`

---

### AC11: Charts (Mock Data Initially)

**Given** a user views their dashboard  
**When** charts are displayed  
**Then** they should use mock data from `src/data/dashboardData.ts`  
**And** charts should render without errors  
**And** chart data will be migrated to real data in a future phase

**Note**: This is explicitly out of scope for Issue #11. Charts will continue using mock data.

---

## Edge Cases

### EC1: Missing User Profile
**Given** a user exists in Supabase Auth  
**When** their profile doesn't exist in `users` table  
**Then** the system should:
- Fall back to `user.user_metadata.role`
- Then fall back to `user.app_metadata.role`
- Finally default to "buyer" role
- Dashboard should render correctly

### EC2: Role Switching
**Given** a user's role changes in the database  
**When** they view the dashboard  
**Then** after cache expiry (60s), the correct dashboard should render  
**And** previous role's cached data should not be shown

### EC3: Concurrent Access
**Given** a user opens multiple dashboard tabs  
**When** they load simultaneously  
**Then** all tabs should share the same cache  
**And** database queries should not be duplicated

### EC4: Database Timeout
**Given** a database query takes longer than 30 seconds  
**When** it times out  
**Then** an error message should be shown  
**And** the page should remain functional

### EC5: RLS Policy Violation
**Given** RLS policies block a query  
**When** the query is executed  
**Then** an appropriate error should be logged  
**And** a user-friendly error message should be displayed

---

## Non-Functional Requirements

### NFR1: Performance
- Dashboard load time: < 2 seconds
- Cache hit load time: < 1 second
- Database query time: < 500ms per query
- Parallel query execution where possible

### NFR2: Accessibility
- All interactive elements keyboard navigable
- Proper ARIA labels on summary cards
- Loading states announced to screen readers
- Error messages accessible

### NFR3: Security
- RLS policies verified to allow proper data access
- User data isolation (buyers only see their orders, sellers only see their stores)
- No data leakage between users
- Cache keys include userId for isolation

### NFR4: Scalability
- Caching reduces database load
- Queries use database indexes
- Handles 100+ concurrent users
- Cache eviction works correctly

---

## Definition of Done

- [ ] Buyer dashboard displays real order data from database
- [ ] Seller dashboard displays real revenue and inventory from database
- [ ] Dashboard loads in < 2 seconds
- [ ] Caching works correctly (60s buyer/seller)
- [ ] Error handling and empty states implemented
- [ ] Unit tests >80% coverage
- [ ] Component tests pass
- [ ] E2E tests pass
- [ ] i18n translations added
- [ ] Code review approved
- [ ] CI/CD passes
- [ ] Manual testing complete

---

## Testing Validation

### Manual Testing Scenarios

1. **Buyer with Orders**:
   - Login as buyer → Navigate to dashboard → Verify summary cards show real data → Verify order history displays

2. **Buyer without Orders**:
   - Login as new buyer → Navigate to dashboard → Verify empty state → Verify all counts are 0

3. **Seller with Stores**:
   - Login as seller → Navigate to dashboard → Verify summary cards show real revenue/products → Verify low stock alerts

4. **Seller without Stores**:
   - Login as seller without stores → Navigate to dashboard → Verify empty state message

5. **Performance**:
   - Navigate to dashboard → Measure load time → Verify < 2s → Refresh → Verify cached load < 1s

6. **Error Handling**:
   - Simulate database error → Verify error message → Verify page doesn't crash

---

## Notes

- Admin dashboard is out of scope for this issue (separate issue)
- Charts will continue using mock data (migration to real data in future phase)
- Buyer additional features (social, price tracking, loyalty) are out of scope
- All database tables and RLS policies already exist

