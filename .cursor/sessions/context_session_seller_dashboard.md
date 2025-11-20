# Seller Dashboard Implementation Plan

## Feature Request
Implement Dashboard for a Seller user like Admin with different menus (products, team - users, sales, revenue, shipping, orders, etc...)

## Session Status
- [x] Explore
- [x] Team Selection
- [x] Plan
- [x] Advice
- [x] Update
- [x] Clarification
- [ ] Iterate

## Exploration Summary

### Current State Analysis

#### Admin Dashboard Structure
- **Layout**: Uses `AdminDashboardLayout` with `SidebarProvider`, `AdminSidebar`, and `AdminHeader`
- **Routes**: 
  - `/dashboard` (main dashboard)
  - `/dashboard/admin/stores`
  - `/dashboard/admin/products`
  - `/dashboard/admin/orders`
  - `/dashboard/admin/users`
  - `/dashboard/admin/analytics`
  - `/dashboard/admin/payments`
  - `/dashboard/admin/settings`
- **Components**: 
  - `AdminSidebar.tsx` - Navigation menu with icons
  - `AdminHeader.tsx` - Header with search, notifications, profile
  - `AdminDashboardLayout.tsx` - Wrapper component
  - `AdminDashboard.tsx` - Main dashboard page
  - `AdminDashboardClient.tsx` - Client component for realtime updates
- **Data Layer**: `getAdminDashboardData.ts` in `src/application/dashboard/admin/`
- **API Routes**: `/api/admin/*` for admin operations

#### Seller Dashboard Current State
- **Layout**: Simple view without sidebar, uses standard Navbar + Footer
- **Component**: `SellerDashboard.tsx` - Shows summary cards, low stock alerts, pending orders
- **Data Layer**: `getSellerDashboardData.ts` in `src/application/dashboard/seller/`
- **Routes**: Only `/dashboard` (role-based rendering)
- **No dedicated seller routes or sidebar navigation**

#### Database Schema
- **Users**: id, name, email, role (buyer, seller, admin)
- **Stores**: id, owner_id, name, description, verification_status, etc.
- **Products**: id, store_id, name, price, stock, category, etc.
- **Orders**: id, buyer_id, total_amount, status (pending, processing, completed, cancelled, refunded)
- **Order Items**: id, order_id, product_id, quantity, price
- **Payments**: id, order_id, payment_method, status, amount
- **Missing**: Team/Users management table, Shipping/Tracking table

#### Authentication & Authorization
- Role-based: `buyer`, `seller`, `admin`
- RLS policies in place for data access
- Seller can only access their own store data

### Key Findings
1. Admin dashboard has full navigation structure with sidebar
2. Seller dashboard is currently a simple card-based view
3. No seller-specific routes exist (only role-based rendering on `/dashboard`)
4. Database lacks tables for team management and shipping
5. Application layer exists for seller data but limited functionality
6. No API routes for seller operations yet

## Team Selection

### Subagents to Consult (for Advice Phase)
1. **Frontend Developer** - Component structure, UI/UX patterns, routing
2. **TypeScript Test Explorer** - Testing strategy for new components
3. **UI/UX Analyzer** - Design consistency with Admin dashboard
4. **QA Criteria Validator** - Acceptance criteria and test cases

## Plan

### Overview
Create a comprehensive Seller Dashboard with sidebar navigation similar to Admin Dashboard, including dedicated routes for products, orders, revenue, shipping, team management, and sales analytics.

### Architecture Decisions

1. **Layout Structure**: Mirror Admin dashboard pattern with `SellerDashboardLayout`, `SellerSidebar`, and `SellerHeader`
2. **Routing**: Create `/dashboard/seller/*` routes (similar to `/dashboard/admin/*`)
3. **Data Scoping**: All seller data filtered by `store_id` where seller is owner
4. **Database Extensions**: May need new tables for team management and shipping tracking
5. **Component Reusability**: Reuse existing UI components (cards, tables, charts) where possible

### Implementation Phases

#### Phase 1: Core Layout & Navigation
**Goal**: Create seller dashboard layout structure with sidebar navigation

**Components to Create:**
1. `src/components/dashboard/seller/SellerSidebar.tsx`
   - Menu items: Dashboard, Products, Orders, Revenue, Shipping, Team, Settings
   - Icons from lucide-react (Package, ShoppingBag, DollarSign, Truck, Users, Settings)
   - Active route highlighting
   - Translation support (`seller.sidebar.*`)

2. `src/components/dashboard/seller/SellerHeader.tsx`
   - Search functionality (seller-specific: products, orders)
   - Notifications
   - Profile dropdown
   - Logout functionality

3. `src/components/dashboard/seller/SellerDashboardLayout.tsx`
   - Wrapper using `SidebarProvider`
   - Combines `SellerSidebar` and `SellerHeader`
   - Main content area

**Routes to Create:**
- `src/app/[locale]/dashboard/seller/page.tsx` - Main dashboard
- `src/app/[locale]/dashboard/seller/products/page.tsx` - Products management
- `src/app/[locale]/dashboard/seller/orders/page.tsx` - Orders management
- `src/app/[locale]/dashboard/seller/revenue/page.tsx` - Revenue analytics
- `src/app/[locale]/dashboard/seller/shipping/page.tsx` - Shipping management
- `src/app/[locale]/dashboard/seller/team/page.tsx` - Team/Users management
- `src/app/[locale]/dashboard/seller/settings/page.tsx` - Settings

**Modifications:**
- Update `src/app/[locale]/dashboard/page.tsx` to redirect sellers to `/dashboard/seller`
- Add seller translations to `messages/en.json`, `messages/es.json`, `messages/ar.json`

#### Phase 2: Main Dashboard Page
**Goal**: Enhanced seller dashboard with comprehensive metrics

**Components:**
1. `src/components/dashboard/seller/SellerDashboard.tsx` (Server Component)
   - Fetches data using `getSellerDashboardData`
   - Renders `SellerDashboardClient`

2. `src/components/dashboard/seller/SellerDashboardClient.tsx` (Client Component)
   - Realtime updates using custom hook
   - Summary cards (Revenue, Orders, Products, Low Stock)
   - Charts (Revenue trend, Order status, Product categories)
   - Recent orders list
   - Low stock alerts

**Data Layer:**
- Extend `src/application/dashboard/seller/getSellerDashboardData.ts`
  - Add revenue trends (daily/weekly/monthly)
  - Add order status distribution
  - Add product category distribution
  - Add recent activity feed

#### Phase 3: Products Management
**Goal**: Full CRUD for seller products

**Components:**
1. `src/components/dashboard/seller/products/ProductsList.tsx`
   - Table with pagination, search, filters
   - Columns: Name, Category, Price, Stock, Status, Actions

2. `src/components/dashboard/seller/products/ProductForm.tsx`
   - Create/Edit product form
   - Image upload
   - Stock management

3. `src/components/dashboard/seller/products/ProductFilters.tsx`
   - Filter by category, stock status, price range

**Data Layer:**
- `src/application/products/seller/getSellerProducts.ts`
- `src/application/products/seller/createProduct.ts`
- `src/application/products/seller/updateProduct.ts`
- `src/application/products/seller/deleteProduct.ts`

**API Routes:**
- `src/app/api/seller/products/route.ts` (GET, POST)
- `src/app/api/seller/products/[id]/route.ts` (GET, PUT, DELETE)

#### Phase 4: Orders Management
**Goal**: View and manage seller orders

**Components:**
1. `src/components/dashboard/seller/orders/OrdersList.tsx`
   - Table with order details
   - Filter by status, date range
   - Order status update actions

2. `src/components/dashboard/seller/orders/OrderDetail.tsx`
   - Order details view
   - Order items list
   - Customer information
   - Status update workflow

**Data Layer:**
- `src/application/orders/seller/getSellerOrders.ts`
- `src/application/orders/seller/updateOrderStatus.ts`
- `src/application/orders/seller/getOrderDetails.ts`

**API Routes:**
- `src/app/api/seller/orders/route.ts` (GET)
- `src/app/api/seller/orders/[id]/route.ts` (GET, PATCH)

**Database Considerations:**
- Orders need to be filtered by products belonging to seller's stores
- Join: orders -> order_items -> products -> stores (where owner_id = seller_id)

#### Phase 5: Revenue Analytics
**Goal**: Comprehensive revenue reporting and analytics

**Components:**
1. `src/components/dashboard/seller/revenue/RevenueOverview.tsx`
   - Summary cards (Total Revenue, Average Order Value, Growth %)
   - Time period selector (7d, 30d, 90d, 1y)

2. `src/components/dashboard/seller/revenue/RevenueChart.tsx`
   - Line/Bar chart showing revenue over time
   - Compare periods

3. `src/components/dashboard/seller/revenue/RevenueBreakdown.tsx`
   - Revenue by product category
   - Top selling products
   - Revenue by store (if multiple stores)

**Data Layer:**
- `src/application/revenue/seller/getSellerRevenue.ts`
- `src/application/revenue/seller/getRevenueTrend.ts`
- `src/application/revenue/seller/getRevenueByCategory.ts`
- `src/application/revenue/seller/getTopProducts.ts`

**API Routes:**
- `src/app/api/seller/revenue/route.ts` (GET with query params for period)

#### Phase 6: Shipping Management
**Goal**: Track and manage order shipments

**Database Schema Addition:**
```sql
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number VARCHAR(255),
  carrier VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'shipped', 'in_transit', 'delivered', 'failed')),
  shipped_at TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
```

**Components:**
1. `src/components/dashboard/seller/shipping/ShipmentsList.tsx`
   - List of shipments with tracking info
   - Filter by status, date

2. `src/components/dashboard/seller/shipping/ShipmentForm.tsx`
   - Create shipment (link to order)
   - Add tracking number, carrier
   - Update shipment status

3. `src/components/dashboard/seller/shipping/TrackingStatus.tsx`
   - Visual tracking status indicator
   - Timeline view

**Data Layer:**
- `src/application/shipping/seller/getSellerShipments.ts`
- `src/application/shipping/seller/createShipment.ts`
- `src/application/shipping/seller/updateShipment.ts`

**API Routes:**
- `src/app/api/seller/shipping/route.ts` (GET, POST)
- `src/app/api/seller/shipping/[id]/route.ts` (GET, PATCH)

**RLS Policies:**
- Sellers can only access shipments for orders containing their products

#### Phase 7: Team Management
**Goal**: Manage team members/users for seller stores

**Database Schema Addition:**
```sql
CREATE TABLE IF NOT EXISTS store_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' 
    CHECK (role IN ('owner', 'manager', 'staff')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_store_team_store ON store_team_members(store_id);
CREATE INDEX IF NOT EXISTS idx_store_team_user ON store_team_members(user_id);
```

**Components:**
1. `src/components/dashboard/seller/team/TeamList.tsx`
   - List of team members
   - Role badges
   - Actions (edit, remove)

2. `src/components/dashboard/seller/team/InviteMember.tsx`
   - Invite form (email, role, permissions)
   - Send invitation

3. `src/components/dashboard/seller/team/TeamMemberForm.tsx`
   - Edit team member role/permissions

**Data Layer:**
- `src/application/team/seller/getStoreTeam.ts`
- `src/application/team/seller/inviteTeamMember.ts`
- `src/application/team/seller/updateTeamMember.ts`
- `src/application/team/seller/removeTeamMember.ts`

**API Routes:**
- `src/app/api/seller/team/route.ts` (GET, POST)
- `src/app/api/seller/team/[id]/route.ts` (GET, PATCH, DELETE)
- `src/app/api/seller/team/invite/route.ts` (POST)

**RLS Policies:**
- Store owners can manage team members
- Team members can read their own assignments

#### Phase 8: Settings
**Goal**: Seller account and store settings

**Components:**
1. `src/components/dashboard/seller/settings/StoreSettings.tsx`
   - Store information form
   - Business details
   - Verification status display

2. `src/components/dashboard/seller/settings/AccountSettings.tsx`
   - Profile information
   - Password change
   - Email preferences

3. `src/components/dashboard/seller/settings/NotificationSettings.tsx`
   - Notification preferences
   - Email alerts configuration

**Data Layer:**
- `src/application/settings/seller/getSellerSettings.ts`
- `src/application/settings/seller/updateStoreSettings.ts`
- `src/application/settings/seller/updateAccountSettings.ts`

**API Routes:**
- `src/app/api/seller/settings/route.ts` (GET, PATCH)

### Testing Strategy

**Unit Tests:**
- Component tests for all new components
- Service layer tests for data fetching
- API route tests

**Integration Tests:**
- Dashboard navigation flow
- CRUD operations for products, orders
- Revenue calculations

**E2E Tests:**
- Complete seller workflow (login → dashboard → manage products → view orders)
- Team invitation flow
- Shipping creation and tracking

### Internationalization

**Translation Keys to Add:**
```json
{
  "seller": {
    "sidebar": {
      "dashboard": "Dashboard",
      "products": "Products",
      "orders": "Orders",
      "revenue": "Revenue",
      "shipping": "Shipping",
      "team": "Team",
      "settings": "Settings"
    },
    "header": {
      "search": "Search...",
      "notifications": "Notifications",
      "profile": "Profile",
      "logout": "Log Out"
    },
    "dashboard": { ... },
    "products": { ... },
    "orders": { ... },
    "revenue": { ... },
    "shipping": { ... },
    "team": { ... },
    "settings": { ... }
  }
}
```

### Security Considerations

1. **RLS Policies**: Ensure all seller queries filter by `store_id` and `owner_id`
2. **API Authorization**: Verify seller owns the store before allowing operations
3. **Data Isolation**: Sellers can only see their own data
4. **Team Permissions**: Validate team member permissions before allowing actions

### Performance Considerations

1. **Data Fetching**: Use parallel queries where possible
2. **Pagination**: Implement pagination for large lists (products, orders)
3. **Caching**: Consider React Query caching for frequently accessed data
4. **Database Indexes**: Ensure proper indexes on foreign keys and filter columns

## Questions for Clarification

Please provide answers to the following questions to refine the implementation plan:

### A) User Scenarios

**Q1: Multiple Stores per Seller**
- A) Sellers can only have ONE store (current implementation)
- B) Sellers can have MULTIPLE stores (need to support store switching)
- C) Sellers can have multiple stores but only one is "active" at a time

**Q2: Team Management Scope**
- A) Team members can only be invited (no self-registration)
- B) Team members can be invited OR existing users can be added
- C) Team management is optional (some sellers work solo)

**Q3: Shipping Integration**
- A) Manual tracking entry only (seller enters tracking numbers)
- B) Integration with shipping carriers (USPS, FedEx, UPS APIs)
- C) Hybrid approach (manual entry + optional API integration)

### B) Edge Cases

**Q4: Order Management - Multiple Sellers**
- A) If an order contains products from multiple sellers, each seller sees only their portion
- B) Orders are split into separate orders per seller at checkout
- C) Orders show all items but sellers can only update status for their products

**Q5: Revenue Calculation**
- A) Revenue includes all order items from seller's products (even if order contains other sellers' products)
- B) Revenue is calculated only for orders that are 100% seller's products
- C) Revenue shows both: total from all items + breakdown by order type

**Q6: Product Deletion with Active Orders**
- A) Products can be deleted even if they have active orders (soft delete)
- B) Products cannot be deleted if they have orders (hard constraint)
- C) Products are archived (hidden) instead of deleted

### C) Integration Requirements

**Q7: Real-time Updates**
- A) Full real-time updates for all seller dashboard sections (like admin)
- B) Real-time updates only for critical sections (orders, low stock)
- C) Polling-based updates (no real-time subscriptions)

**Q8: Search Functionality**
- A) Global search across all seller data (products, orders, customers)
- B) Section-specific search (search within current page only)
- C) No search functionality initially

**Q9: Export/Reporting**
- A) Export functionality for revenue, orders, products (CSV/PDF)
- B) View-only reports (no export)
- C) Export available only for revenue and orders

### D) Performance Needs

**Q10: Data Volume Expectations**
- A) Small scale: < 100 products, < 1000 orders per seller
- B) Medium scale: < 1000 products, < 10,000 orders per seller
- C) Large scale: Unlimited (need pagination, lazy loading, etc.)

**Q11: Dashboard Loading**
- A) All dashboard data loads immediately (current approach)
- B) Progressive loading (summary cards first, then charts)
- C) Lazy loading with skeleton states

### E) Dependencies

**Q12: Chart Library**
- A) Use existing chart library (if any) from admin dashboard
- B) Use Recharts (already in project or need to add)
- C) Use Chart.js or other library

**Q13: Table Component**
- A) Use existing table component from shadcn/ui
- B) Build custom table component
- C) Use third-party table library (TanStack Table)

**Q14: Form Validation**
- A) Use existing Zod schemas and validation patterns
- B) Create new validation schemas for seller-specific forms
- C) Mix of both (reuse where possible, create new where needed)

---

## Clarification Answers

### A) User Scenarios

**Q1: Multiple Stores per Seller**
- **Answer: B** - Sellers can have MULTIPLE stores (need to support store switching)
- **Impact**: Need store selector/switcher in header, filter all data by selected store, support multiple stores in queries

**Q2: Team Management Scope**
- **Answer: A** - Team members can only be invited (no self-registration) AND Team management is optional (some sellers work solo)
- **Impact**: Invitation-only system, optional feature (can be hidden if seller has no team)

**Q3: Shipping Integration**
- **Answer: C** - Hybrid approach (manual entry + optional API integration)
- **Impact**: Support manual tracking entry, prepare for future API integration, flexible carrier selection

### B) Edge Cases

**Q4: Order Management - Multiple Sellers**
- **Answer: A** - If an order contains products from multiple sellers, each seller sees only their portion
- **Impact**: Filter order_items by seller's products, show partial orders, calculate order totals only for seller's items

**Q5: Revenue Calculation**
- **Answer: B** - Revenue is calculated only for orders that are 100% seller's products
- **Impact**: Filter orders where ALL items belong to seller, exclude mixed orders from revenue calculations

**Q6: Product Deletion with Active Orders**
- **Answer: C** - Products are archived (hidden) instead of deleted
- **Impact**: Add `archived` or `is_active` field to products, soft delete pattern, maintain referential integrity

### C) Integration Requirements

**Q7: Real-time Updates**
- **Answer: A** - Full real-time updates for all seller dashboard sections (like admin)
- **Impact**: Create `useSellerRealtime` hook similar to `useAdminRealtime`, subscribe to stores, products, orders, shipments

**Q8: Search Functionality**
- **Answer: A** - Global search across all seller data (products, orders, customers)
- **Impact**: Create `SellerSearch` component, search API endpoint, search across multiple tables with relevance ranking

**Q9: Export/Reporting**
- **Answer: A** - Export functionality for revenue, orders, products (CSV/PDF)
- **Impact**: Add export buttons, generate CSV/PDF files, handle large data exports with pagination

### D) Performance Needs

**Q10: Data Volume Expectations**
- **Answer: C** - Large scale: Unlimited (need pagination, lazy loading, etc.)
- **Impact**: Implement pagination for all lists, lazy loading for charts, virtual scrolling for large tables, optimize queries

**Q11: Dashboard Loading**
- **Answer: C** - Lazy loading with skeleton states
- **Impact**: Create skeleton components, progressive data loading, show loading states for each section

### E) Dependencies

**Q12: Chart Library**
- **Answer: B** - Use Recharts (already in project or need to add)
- **Impact**: Install Recharts if not present, create chart components using Recharts, ensure consistency with admin charts

**Q13: Table Component**
- **Answer: A** - Use existing table component from shadcn/ui
- **Impact**: Use shadcn/ui Table component, add pagination, sorting, filtering features

**Q14: Form Validation**
- **Answer: A** - Use existing Zod schemas and validation patterns
- **Impact**: Reuse existing validation schemas, extend where needed, maintain consistency

---

## Plan Refinements Based on Answers

### Additional Requirements

1. **Store Switching**: Add store selector dropdown in `SellerHeader`, persist selected store in state/URL, filter all queries by selected store
2. **Product Archiving**: Add `archived` boolean field to products table, implement archive/unarchive functionality
3. **Revenue Filtering**: Only count orders where ALL items belong to seller (no mixed orders)
4. **Real-time Hook**: Create `useSellerRealtime` hook for all dashboard sections
5. **Global Search**: Implement cross-table search with relevance ranking
6. **Export Functionality**: CSV/PDF export for revenue, orders, products
7. **Pagination**: All list views need pagination (products, orders, shipments, team)
8. **Skeleton States**: Loading skeletons for all dashboard sections
9. **Recharts Integration**: ✅ Recharts 2.12.7 already installed - reuse existing chart components from admin dashboard
10. **Large Scale Optimization**: Virtual scrolling, lazy loading, query optimization

## Advice from Codebase Analysis

### Recharts Status
- ✅ **Recharts is already installed** (version 2.12.7 in package.json)
- ✅ **Existing chart components** in `src/components/dashboard/admin/`:
  - `RevenueTrendChart.tsx` - AreaChart for revenue trends
  - `CategoryDistributionChart.tsx` - PieChart for category distribution
  - `OrderStatusChart.tsx` - BarChart for order status
- ✅ **Reusable chart patterns** in `src/components/dashboard/Charts.tsx`
- **Action**: Reuse existing chart components and patterns for seller dashboard

### Component Patterns
- ✅ **Admin dashboard structure** provides excellent template:
  - `AdminSidebar.tsx` - Sidebar navigation pattern
  - `AdminHeader.tsx` - Header with search pattern
  - `AdminDashboardLayout.tsx` - Layout wrapper pattern
- **Action**: Mirror these patterns for seller dashboard

### Database Considerations
- ⚠️ **Product archiving**: Need to add `archived` boolean field to products table
- ⚠️ **New tables needed**: `shipments` and `store_team_members`
- ⚠️ **Revenue calculation**: Complex query to filter orders where ALL items belong to seller
- **Action**: Create migration for new fields and tables

### Real-time Updates
- ✅ **Existing pattern**: `useAdminRealtime` hook in `src/hooks/useAdminRealtime.ts`
- **Action**: Create `useSellerRealtime` hook following same pattern

### Table Components
- ✅ **shadcn/ui Table**: Already available in project
- **Action**: Use existing table component with pagination, sorting, filtering

### Form Validation
- ✅ **Zod schemas**: Already in use throughout project
- **Action**: Reuse existing validation patterns, extend where needed

## Final Implementation Notes

### Critical Path Items
1. **Store Switching**: Must be implemented first as it affects all other queries
2. **Product Archiving**: Database migration needed before product management
3. **Revenue Query**: Complex - needs careful testing for mixed orders
4. **Real-time Hook**: Critical for dashboard updates

### Recommended Implementation Order
1. Phase 1: Core Layout & Navigation (with store switching)
2. Database migrations (archived field, shipments, team_members)
3. Phase 2: Main Dashboard (with real-time updates)
4. Phase 3: Products (with archiving)
5. Phase 4: Orders (with partial order filtering)
6. Phase 5: Revenue (with 100% seller order filtering)
7. Phase 6: Shipping
8. Phase 7: Team
9. Phase 8: Settings

### Testing Priorities
1. Store switching functionality
2. Revenue calculation accuracy (100% seller orders only)
3. Partial order filtering (seller sees only their items)
4. Product archiving (soft delete)
5. Real-time updates across all sections
6. Pagination and performance with large datasets

