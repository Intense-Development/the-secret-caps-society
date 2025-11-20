# [Feature] Seller Dashboard with Full Navigation and Management Tools

## Problem Statement

Currently, seller users have a limited dashboard experience compared to admin users. The seller dashboard is a simple card-based view without:
- Dedicated navigation sidebar (unlike admin dashboard)
- Separate routes for different management sections
- Comprehensive product management (CRUD operations)
- Order management interface
- Revenue analytics and reporting
- Shipping tracking and management
- Team/user management capabilities
- Store switching for sellers with multiple stores

**Current Limitations:**
- Sellers can only view a basic dashboard at `/dashboard` with summary cards
- No way to manage products, orders, or view detailed analytics
- No navigation structure - sellers must rely on the main site navigation
- Missing critical business management features that sellers need to operate effectively
- No support for sellers with multiple stores

## User Value

This feature will provide sellers with a comprehensive, professional dashboard experience that enables them to:

1. **Manage Products Efficiently**
   - View all products in a searchable, filterable table
   - Create, edit, and archive products (soft delete)
   - Track inventory levels and low stock alerts
   - Example: A seller can quickly find a product, update its price, and archive discontinued items without losing order history

2. **Track and Fulfill Orders**
   - See all orders containing their products
   - View order details including customer information
   - Update order status (pending → processing → completed)
   - Filter orders by status, date range
   - Example: A seller receives a new order notification, clicks to view details, and updates status to "processing" when they start packing

3. **Monitor Business Performance**
   - View revenue trends over time (daily, weekly, monthly)
   - See revenue breakdown by product category
   - Track top-selling products
   - Export revenue reports (CSV/PDF)
   - Example: A seller can see their revenue increased 25% this month and identify which product categories drove the growth

4. **Manage Shipping**
   - Create shipments for orders
   - Add tracking numbers and carrier information
   - Track shipment status (pending → shipped → in transit → delivered)
   - View delivery timelines
   - Example: A seller creates a shipment, adds USPS tracking number, and customers can track their package

5. **Build and Manage Teams**
   - Invite team members to help manage the store
   - Assign roles (owner, manager, staff)
   - Manage permissions
   - Example: A seller invites their employee to help manage products and orders, giving them appropriate access levels

6. **Switch Between Multiple Stores**
   - Sellers with multiple stores can switch between them
   - All data is filtered by the selected store
   - Example: A seller owns both "CapCity Store" and "East Coast Caps" and can switch between them to manage each separately

7. **Real-time Updates**
   - Dashboard updates automatically when new orders arrive
   - Low stock alerts appear immediately
   - No need to refresh the page
   - Example: A seller sees a new order notification appear automatically without refreshing

8. **Global Search**
   - Search across products, orders, and customers
   - Quick access to any information
   - Example: A seller types "NYC" and finds all orders shipped to New York City

## Definition of Done

- [ ] **Implementation Complete**
  - [ ] Core layout with sidebar navigation (`SellerSidebar`, `SellerHeader`, `SellerDashboardLayout`)
  - [ ] Store switching functionality for multiple stores
  - [ ] Main dashboard page with metrics, charts, and real-time updates
  - [ ] Products management page (list, create, edit, archive)
  - [ ] Orders management page (list, view details, update status)
  - [ ] Revenue analytics page with charts and export
  - [ ] Shipping management page (create shipments, track status)
  - [ ] Team management page (invite, manage roles)
  - [ ] Settings page (store and account settings)
  - [ ] Global search functionality
  - [ ] Export functionality (CSV/PDF) for revenue, orders, products
  - [ ] All edge cases handled (multiple stores, partial orders, archived products, etc.)

- [ ] **Database Migrations**
  - [ ] Add `archived` boolean field to products table
  - [ ] Create `shipments` table with proper indexes and RLS policies
  - [ ] Create `store_team_members` table with proper indexes and RLS policies
  - [ ] All migrations tested and reversible

- [ ] **Unit Tests** (>80% coverage)
  - [ ] Component tests for all new components
  - [ ] Service layer tests for data fetching functions
  - [ ] API route tests
  - [ ] Hook tests (useSellerRealtime, etc.)
  - [ ] Utility function tests

- [ ] **Integration Tests**
  - [ ] Dashboard navigation flow
  - [ ] Product CRUD operations
  - [ ] Order status updates
  - [ ] Revenue calculations (100% seller orders only)
  - [ ] Store switching functionality
  - [ ] Team invitation flow
  - [ ] Shipping creation and tracking

- [ ] **E2E Tests** (Playwright)
  - [ ] Complete seller workflow: login → dashboard → manage products → view orders
  - [ ] Store switching between multiple stores
  - [ ] Product archiving workflow
  - [ ] Order fulfillment workflow
  - [ ] Team invitation and management
  - [ ] Shipping creation and tracking
  - [ ] Export functionality

- [ ] **Documentation Updated**
  - [ ] README updated with seller dashboard features
  - [ ] API documentation for new endpoints
  - [ ] Component documentation (JSDoc comments)
  - [ ] Database schema documentation

- [ ] **Code Review Approved**
  - [ ] All PR comments addressed
  - [ ] Code follows project conventions
  - [ ] No security vulnerabilities
  - [ ] Performance optimizations reviewed

- [ ] **CI/CD Passes**
  - [ ] All tests pass
  - [ ] Build succeeds
  - [ ] Linting passes
  - [ ] Type checking passes

- [ ] **Manual Testing Complete**
  - [ ] All manual testing checklist items verified
  - [ ] Cross-browser testing (Chrome, Firefox, Safari)
  - [ ] Responsive design verified (mobile, tablet, desktop)
  - [ ] Accessibility verified (keyboard navigation, screen readers)

## Manual Testing Checklist

### Basic Flow

1. **Seller Login and Dashboard Access**
   - [ ] Login as seller user
   - [ ] Verify redirect to `/dashboard/seller`
   - [ ] Verify sidebar navigation is visible
   - [ ] Verify header with search, notifications, profile dropdown
   - [ ] Verify dashboard shows summary cards (Revenue, Orders, Products, Low Stock)
   - [ ] Verify charts render correctly (Revenue Trend, Order Status, Category Distribution)

2. **Store Switching** (if seller has multiple stores)
   - [ ] Verify store selector appears in header
   - [ ] Click store selector and verify all stores are listed
   - [ ] Switch to different store
   - [ ] Verify all data updates to show selected store's data
   - [ ] Verify URL updates with store parameter
   - [ ] Refresh page and verify selected store persists

3. **Products Management**
   - [ ] Navigate to Products page (`/dashboard/seller/products`)
   - [ ] Verify products table displays with pagination
   - [ ] Search for a product by name
   - [ ] Filter products by category
   - [ ] Click "Create Product" button
   - [ ] Fill product form (name, description, price, stock, category, image)
   - [ ] Submit and verify product appears in list
   - [ ] Click "Edit" on a product
   - [ ] Update product details and save
   - [ ] Click "Archive" on a product
   - [ ] Verify product is hidden from active list
   - [ ] Verify archived products can be unarchived

4. **Orders Management**
   - [ ] Navigate to Orders page (`/dashboard/seller/orders`)
   - [ ] Verify orders table displays
   - [ ] Filter orders by status (pending, processing, completed)
   - [ ] Filter orders by date range
   - [ ] Click on an order to view details
   - [ ] Verify order shows only seller's products (if mixed order)
   - [ ] Update order status from "pending" to "processing"
   - [ ] Verify status update is reflected in list
   - [ ] Verify order total shows only seller's portion for mixed orders

5. **Revenue Analytics**
   - [ ] Navigate to Revenue page (`/dashboard/seller/revenue`)
   - [ ] Verify revenue overview cards display
   - [ ] Change time period (7d, 30d, 90d, 1y)
   - [ ] Verify revenue chart updates
   - [ ] Verify revenue breakdown by category displays
   - [ ] Verify top selling products list displays
   - [ ] Click "Export CSV" button
   - [ ] Verify CSV file downloads with correct data
   - [ ] Click "Export PDF" button
   - [ ] Verify PDF generates correctly

6. **Shipping Management**
   - [ ] Navigate to Shipping page (`/dashboard/seller/shipping`)
   - [ ] Verify shipments list displays
   - [ ] Click "Create Shipment" for an order
   - [ ] Fill shipment form (tracking number, carrier)
   - [ ] Submit and verify shipment appears in list
   - [ ] Update shipment status to "shipped"
   - [ ] Verify tracking status indicator updates
   - [ ] Filter shipments by status

7. **Team Management**
   - [ ] Navigate to Team page (`/dashboard/seller/team`)
   - [ ] Verify team members list displays (if any)
   - [ ] Click "Invite Member"
   - [ ] Fill invitation form (email, role, permissions)
   - [ ] Submit and verify invitation is sent
   - [ ] Verify team member appears in list
   - [ ] Edit team member role
   - [ ] Remove team member
   - [ ] Verify team page is hidden if seller has no team

8. **Settings**
   - [ ] Navigate to Settings page (`/dashboard/seller/settings`)
   - [ ] Verify store settings form displays
   - [ ] Update store information
   - [ ] Verify account settings section
   - [ ] Update profile information
   - [ ] Verify notification preferences section

9. **Global Search**
   - [ ] Click search bar in header
   - [ ] Type product name and verify results appear
   - [ ] Type order number and verify results appear
   - [ ] Type customer name and verify results appear
   - [ ] Click on search result and verify navigation works

10. **Real-time Updates**
    - [ ] Open dashboard in two browser windows
    - [ ] Create a new order in one window (as buyer)
    - [ ] Verify order appears automatically in seller dashboard
    - [ ] Update product stock in one window
    - [ ] Verify low stock alert updates in other window

### Edge Case Testing

1. **Multiple Stores**
   - [ ] Seller with 3 stores can switch between all
   - [ ] Data filters correctly for each store
   - [ ] Revenue calculations are per-store
   - [ ] Products list shows only selected store's products

2. **Mixed Orders** (order contains products from multiple sellers)
   - [ ] Create order with products from 2 different sellers
   - [ ] Verify each seller sees only their portion
   - [ ] Verify order total for seller shows only their items
   - [ ] Verify revenue calculation excludes mixed orders (only 100% seller orders count)

3. **Product Archiving**
   - [ ] Archive product that has active orders
   - [ ] Verify product is hidden from active list
   - [ ] Verify archived product still appears in order history
   - [ ] Unarchive product and verify it appears in active list

4. **Large Datasets**
   - [ ] Test with 1000+ products (verify pagination works)
   - [ ] Test with 10,000+ orders (verify pagination and performance)
   - [ ] Verify lazy loading works for charts
   - [ ] Verify skeleton states appear during loading

5. **Empty States**
   - [ ] Seller with no products sees empty state message
   - [ ] Seller with no orders sees empty state message
   - [ ] Seller with no team sees team section hidden or empty state

### Error Handling

1. **Network Errors**
   - [ ] Disconnect internet and verify error message appears
   - [ ] Verify retry functionality works
   - [ ] Verify user-friendly error messages

2. **Permission Errors**
   - [ ] Try to access another seller's data (should be blocked)
   - [ ] Verify RLS policies prevent unauthorized access
   - [ ] Verify appropriate error messages

3. **Validation Errors**
   - [ ] Submit product form with invalid data
   - [ ] Verify validation errors display
   - [ ] Verify form doesn't submit with errors

4. **API Errors**
   - [ ] Simulate 500 error from API
   - [ ] Verify error handling and user notification
   - [ ] Verify application doesn't crash

### Integration

1. **With Existing Features**
   - [ ] Seller dashboard works with existing authentication
   - [ ] Seller dashboard respects existing RLS policies
   - [ ] Seller dashboard integrates with existing order system
   - [ ] Seller dashboard works with existing product system

2. **With Admin Dashboard**
   - [ ] Admin can still see all seller data
   - [ ] Admin dashboard unaffected by seller dashboard changes
   - [ ] Both dashboards can be used simultaneously

3. **With Buyer Flow**
   - [ ] Buyer can purchase products from seller
   - [ ] Order appears in seller dashboard
   - [ ] Seller can fulfill order
   - [ ] Buyer receives updates

4. **Internationalization**
   - [ ] Verify all text is translatable
   - [ ] Test with different locales (en, es, ar)
   - [ ] Verify translations are correct

## Technical Notes

- Full implementation plan available in `.cursor/sessions/context_session_seller_dashboard.md`
- Recharts 2.12.7 already installed - reuse existing chart components
- Follow Admin Dashboard patterns for consistency
- Database migrations required for `archived` field, `shipments`, and `store_team_members` tables
- Real-time updates using Supabase subscriptions (similar to `useAdminRealtime`)

