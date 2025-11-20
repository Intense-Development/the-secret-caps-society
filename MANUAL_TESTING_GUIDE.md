# Manual Testing Guide - Seller Dashboard

## Prerequisites

### 1. Database Setup
- [ ] Apply migration: `src/infrastructure/database/migrations/003_seller_dashboard.sql` in Supabase
- [ ] Verify tables exist: `shipments`, `store_team_members`
- [ ] Verify `products` table has `archived` column
- [ ] Verify RLS policies are active

### 2. Test Accounts
Create test accounts in Supabase:
- **Seller Account**: Email: `seller@test.com`, Password: `test123`, Role: `seller`
- **Buyer Account**: Email: `buyer@test.com`, Password: `test123`, Role: `buyer`

### 3. Test Data Setup
- [ ] Create at least one store for the seller account
- [ ] Create 5-10 test products for the store
- [ ] Create 3-5 test orders (some with seller's products)
- [ ] Create 1-2 test shipments (if migration applied)

### 4. Development Environment
- [ ] Start dev server: `npm run dev`
- [ ] Ensure Supabase connection is configured
- [ ] Have browser dev tools open (F12)

---

## Testing Checklist

### 🔐 Authentication & Access

#### Test 1: Seller Login
1. Navigate to `/en/login`
2. Enter seller credentials
3. Click "Log In"
4. **Expected**: Redirect to `/dashboard/seller`
5. **Verify**: Seller dashboard loads with sidebar and header

#### Test 2: Unauthorized Access
1. Try accessing `/dashboard/seller` without logging in
2. **Expected**: Redirect to login page
3. **Verify**: Redirect includes `redirectTo` parameter

#### Test 3: Non-Seller Access
1. Login as buyer account
2. Try accessing `/dashboard/seller`
3. **Expected**: Redirect to buyer dashboard or show error
4. **Verify**: Seller dashboard not accessible

---

### 📊 Main Dashboard

#### Test 4: Dashboard Overview
1. Login as seller
2. Navigate to `/dashboard/seller`
3. **Verify**:
   - [ ] Summary cards display (Revenue, Orders, Products, Low Stock)
   - [ ] Cards show actual numbers (not zeros if data exists)
   - [ ] Low stock alerts section visible
   - [ ] Pending orders list visible
   - [ ] Charts render (revenue trend, category distribution)

#### Test 5: Summary Cards
1. Check each summary card:
   - **Revenue Card**: Shows 7-day revenue, growth percentage
   - **Orders Card**: Shows total orders fulfilled
   - **Products Card**: Shows total products listed
   - **Low Stock Card**: Shows count of low stock items
2. **Verify**: Numbers are accurate and formatted correctly

#### Test 6: Low Stock Alerts
1. Create a product with stock < 10
2. Refresh dashboard
3. **Verify**:
   - [ ] Product appears in low stock alerts
   - [ ] Stock count is correct
   - [ ] Clicking product navigates to products page

#### Test 7: Pending Orders
1. Create an order with status "pending"
2. Refresh dashboard
3. **Verify**:
   - [ ] Order appears in pending orders list
   - [ ] Order details are correct
   - [ ] Clicking order shows order details

#### Test 8: Real-Time Updates
1. Open dashboard in one browser tab
2. In another tab/browser, create a new order
3. **Verify**: Dashboard updates automatically (within 2-3 seconds)
4. **Verify**: Connection indicator shows "Connected"

---

### 🏪 Store Management

#### Test 9: Store Selector
1. If seller has multiple stores:
   - [ ] Store selector appears in header
   - [ ] Can switch between stores
   - [ ] Selected store persists (refresh page)
   - [ ] Data updates when store changes
2. If seller has one store:
   - [ ] Store selector may not appear (or shows single store)

#### Test 10: Store Selection Persistence
1. Select a store
2. Navigate to different pages
3. Refresh browser
4. **Verify**: Selected store remains the same

#### Test 11: No Stores Scenario
1. Login as seller with no stores
2. Navigate to dashboard
3. **Verify**: Shows helpful message about creating a store
4. **Verify**: Links to store creation if available

---

### 📦 Products Management

#### Test 12: Products List
1. Navigate to `/dashboard/seller/products`
2. **Verify**:
   - [ ] Products table displays
   - [ ] Product name, price, stock, category shown
   - [ ] Products sorted by creation date (newest first)
   - [ ] Images display correctly (if provided)

#### Test 13: Create Product
1. Click "Add Product" button
2. Fill in form:
   - Name: "Test Product"
   - Price: 29.99
   - Stock: 10
   - Category: "Snapbacks"
   - Description: "A test product"
   - Image URL: (optional)
3. Click "Create Product"
4. **Verify**:
   - [ ] Success message appears
   - [ ] Product appears in list
   - [ ] Form closes
   - [ ] Product data is correct

#### Test 14: Edit Product
1. Click "Edit" on a product
2. Modify name and price
3. Click "Update Product"
4. **Verify**:
   - [ ] Success message appears
   - [ ] Product updates in list
   - [ ] Changes persist after refresh

#### Test 15: Delete Product
1. Click "Delete" on a product
2. Confirm deletion in dialog
3. **Verify**:
   - [ ] Success message appears
   - [ ] Product removed from list
   - [ ] Product deleted from database (or archived if migration applied)

#### Test 16: Search Products
1. Enter search query in search box
2. **Verify**:
   - [ ] Results filter in real-time
   - [ ] Search is case-insensitive
   - [ ] Searches name, description, category
   - [ ] Clear search shows all products

#### Test 17: Filter by Category
1. Select category from dropdown
2. **Verify**:
   - [ ] Only products in that category show
   - [ ] "All categories" shows all products
   - [ ] Filter persists when navigating

#### Test 18: Product Highlighting (from Search)
1. Use global search to find a product
2. Click on product result
3. **Verify**:
   - [ ] Navigates to products page
   - [ ] Product is highlighted (yellow background)
   - [ ] Page scrolls to product
   - [ ] Highlight fades after 3 seconds

---

### 🛒 Orders Management

#### Test 19: Orders List
1. Navigate to `/dashboard/seller/orders`
2. **Verify**:
   - [ ] Orders table displays
   - [ ] Order ID, customer, status, total shown
   - [ ] Partial orders indicated (if applicable)
   - [ ] Orders sorted by date (newest first)

#### Test 20: Filter Orders by Status
1. Select status from dropdown (e.g., "Completed")
2. **Verify**:
   - [ ] Only orders with that status show
   - [ ] "All statuses" shows all orders
   - [ ] Filter works correctly

#### Test 21: View Order Details (Dialog)
1. Click "View" on an order
2. **Verify**:
   - [ ] Dialog opens
   - [ ] Customer information displayed
   - [ ] Order items listed
   - [ ] Total amounts correct
   - [ ] Partial order note shown (if applicable)
   - [ ] Can close dialog

#### Test 22: View Order Details (Page)
1. Navigate to `/dashboard/seller/orders/[order-id]`
2. **Verify**:
   - [ ] Full page order details
   - [ ] All information displayed
   - [ ] "Back to Orders" button works
   - [ ] URL is correct

#### Test 23: Partial Orders
1. Create an order with products from multiple sellers
2. View order in seller dashboard
3. **Verify**:
   - [ ] Shows "Partial Order" indicator
   - [ ] Only seller's products listed
   - [ ] Shows seller's portion vs total order amount
   - [ ] Note explains partial order

#### Test 24: Search Orders
1. Enter search query (order ID, customer name, email)
2. **Verify**:
   - [ ] Results filter correctly
   - [ ] Search works across multiple fields
   - [ ] Clear search shows all orders

---

### 💰 Revenue Analytics

#### Test 25: Revenue Overview
1. Navigate to `/dashboard/seller/revenue`
2. **Verify**:
   - [ ] Overview cards display
   - [ ] Total Revenue shown
   - [ ] Average Order Value calculated
   - [ ] Total Orders count
   - [ ] Growth percentage displayed

#### Test 26: Revenue Period Selection
1. Select different periods (7d, 30d, 90d, 1y)
2. **Verify**:
   - [ ] Data updates for each period
   - [ ] Charts update
   - [ ] Overview cards recalculate
   - [ ] Loading state shows during fetch

#### Test 27: Revenue Trend Chart
1. Check revenue trend chart
2. **Verify**:
   - [ ] Chart renders correctly
   - [ ] Data points accurate
   - [ ] Tooltips show on hover
   - [ ] Time period matches selection

#### Test 28: Category Distribution
1. Check category distribution chart
2. **Verify**:
   - [ ] Pie/bar chart displays
   - [ ] Categories shown correctly
   - [ ] Percentages accurate
   - [ ] Colors distinct

#### Test 29: Top Products
1. Check top products list
2. **Verify**:
   - [ ] Products listed by revenue
   - [ ] Revenue amounts shown
   - [ ] Sorted highest to lowest
   - [ ] Limited to top 5-10

#### Test 30: CSV Export
1. Click "Export CSV" button
2. **Verify**:
   - [ ] CSV file downloads
   - [ ] File contains revenue data
   - [ ] Data is formatted correctly
   - [ ] Includes selected period data

---

### 📦 Shipping Management

#### Test 31: Shipments List
1. Navigate to `/dashboard/seller/shipping`
2. **Verify**:
   - [ ] Shipments table displays
   - [ ] Tracking number, carrier, status shown
   - [ ] Estimated delivery dates shown
   - [ ] Status badges colored correctly

#### Test 32: Create Shipment
1. Click "Create Shipment"
2. Fill in form:
   - Order ID: Select from dropdown
   - Tracking Number: "TRACK123456"
   - Carrier: "UPS"
   - Status: "Shipped"
   - Estimated Delivery: Future date
3. Click "Create Shipment"
4. **Verify**:
   - [ ] Success message appears
   - [ ] Shipment appears in list
   - [ ] Form closes
   - [ ] Data is correct

#### Test 33: Update Shipment Status
1. Click "Edit" on a shipment
2. Change status to "In Transit"
3. Click "Update Shipment"
4. **Verify**:
   - [ ] Status updates
   - [ ] Timestamps update correctly
   - [ ] Changes persist

#### Test 34: View Shipment Details
1. Click "View Details" on a shipment
2. **Verify**:
   - [ ] Dialog opens with full details
   - [ ] Order information shown
   - [ ] Tracking information displayed
   - [ ] Timeline shows status history

#### Test 35: Filter Shipments by Status
1. Select status from dropdown
2. **Verify**:
   - [ ] Only shipments with that status show
   - [ ] Filter works correctly

---

### 👥 Team Management

#### Test 36: Team List
1. Navigate to `/dashboard/seller/team`
2. **Verify**:
   - [ ] Team members table displays
   - [ ] Name, email, role shown
   - [ ] Owner role indicated
   - [ ] Pending invitations shown (if applicable)

#### Test 37: Invite Team Member
1. Click "Invite Member"
2. Fill in form:
   - Email: "teammate@example.com"
   - Role: "Manager"
3. Click "Send Invitation"
4. **Verify**:
   - [ ] Success message appears
   - [ ] Member appears in list (with pending status)
   - [ ] Form closes
   - [ ] Email sent (if email service configured)

#### Test 38: Update Team Member Role
1. Click "Edit" on a team member (not owner)
2. Change role to "Staff"
3. Click "Update Role"
4. **Verify**:
   - [ ] Success message appears
   - [ ] Role updates in list
   - [ ] Changes persist

#### Test 39: Remove Team Member
1. Click "Remove" on a team member (not owner)
2. Confirm removal
3. **Verify**:
   - [ ] Success message appears
   - [ ] Member removed from list
   - [ ] Cannot remove owner

#### Test 40: Owner Protection
1. Try to edit owner's role
2. Try to remove owner
3. **Verify**:
   - [ ] Error message shown
   - [ ] Owner cannot be modified
   - [ ] Owner cannot be removed

---

### ⚙️ Settings

#### Test 41: Store Settings
1. Navigate to `/dashboard/seller/settings`
2. Go to "Store Settings" tab
3. **Verify**:
   - [ ] Store information form displays
   - [ ] All fields populated with current data
   - [ ] Verification status shown

#### Test 42: Update Store Name
1. Change store name
2. Click "Update Store Settings"
3. **Verify**:
   - [ ] Success message appears
   - [ ] Store name updates
   - [ ] Changes persist after refresh
   - [ ] Header shows updated name

#### Test 43: Update Store Address
1. Update address fields
2. Save changes
3. **Verify**:
   - [ ] All address fields save correctly
   - [ ] Validation works (required fields)
   - [ ] Changes persist

#### Test 44: Account Settings
1. Go to "Account Settings" tab
2. **Verify**:
   - [ ] Account information displays
   - [ ] Email is read-only
   - [ ] Role is displayed
   - [ ] Name can be updated

#### Test 45: Update Account Name
1. Change account name
2. Click "Update Account Settings"
3. **Verify**:
   - [ ] Success message appears
   - [ ] Name updates
   - [ ] Header shows updated name

---

### 🔍 Global Search

#### Test 46: Search Products
1. Type product name in global search
2. **Verify**:
   - [ ] Results appear in popover
   - [ ] Product icon shown
   - [ ] Product name and description shown
   - [ ] Results update as you type (debounced)

#### Test 47: Search Orders
1. Type order ID in global search
2. **Verify**:
   - [ ] Order results appear
   - [ ] Order icon shown
   - [ ] Order ID and customer shown
   - [ ] Can click to navigate

#### Test 48: Search Customers
1. Type customer name/email in global search
2. **Verify**:
   - [ ] Customer results appear
   - [ ] Customer icon shown
   - [ ] Name and email shown
   - [ ] Can navigate to orders filtered by customer

#### Test 49: Search Navigation
1. Perform search
2. Click on a result
3. **Verify**:
   - [ ] Navigates to correct page
   - [ ] Search popover closes
   - [ ] URL updates correctly
   - [ ] Product highlighting works (if product)

#### Test 50: Empty Search Results
1. Search for non-existent item
2. **Verify**:
   - [ ] "No results found" message shown
   - [ ] Helpful message displayed
   - [ ] Search popover still open

---

### 🔄 Real-Time Updates

#### Test 51: Product Updates
1. Open products page in one tab
2. In another tab, update a product's stock
3. **Verify**: Products page updates automatically (may need refresh)

#### Test 52: Order Updates
1. Open orders page in one tab
2. In another tab, create a new order
3. **Verify**: Orders page updates automatically

#### Test 53: Connection Indicator
1. Check header for connection indicator
2. **Verify**:
   - [ ] Shows "Connected" when online
   - [ ] Updates when connection lost
   - [ ] Reconnects automatically

---

### 📱 Responsive Design

#### Test 54: Mobile View
1. Resize browser to mobile size (375px width)
2. **Verify**:
   - [ ] Sidebar collapses or becomes drawer
   - [ ] Tables are scrollable
   - [ ] Forms are usable
   - [ ] Buttons are accessible
   - [ ] Text is readable

#### Test 55: Tablet View
1. Resize browser to tablet size (768px width)
2. **Verify**:
   - [ ] Layout adapts correctly
   - [ ] Sidebar behavior appropriate
   - [ ] Tables display well
   - [ ] Forms are usable

#### Test 56: Desktop View
1. Use full desktop width (1920px+)
2. **Verify**:
   - [ ] Full sidebar visible
   - [ ] Tables show all columns
   - [ ] Optimal use of space
   - [ ] No horizontal scrolling

---

### 🚨 Error Handling

#### Test 57: Network Error
1. Disconnect internet
2. Try to create a product
3. **Verify**:
   - [ ] Error message displayed
   - [ ] User-friendly message
   - [ ] No crash or blank screen

#### Test 58: Invalid Form Data
1. Try to create product with invalid data:
   - Negative price
   - Empty name
   - Invalid URL
2. **Verify**:
   - [ ] Validation errors shown
   - [ ] Form doesn't submit
   - [ ] Error messages helpful

#### Test 59: Unauthorized Actions
1. Try to access another seller's store data
2. **Verify**:
   - [ ] Access denied error
   - [ ] Appropriate error message
   - [ ] No data leakage

---

### 🌐 Internationalization

#### Test 60: Language Switching
1. Switch language (if language switcher available)
2. Navigate through dashboard
3. **Verify**:
   - [ ] All text translated
   - [ ] Numbers formatted correctly
   - [ ] Dates formatted correctly
   - [ ] RTL support (if Arabic)

---

## Quick Test Scenarios

### Scenario 1: Complete Product Lifecycle
1. Create a product
2. View it in products list
3. Edit the product
4. Create an order with that product
5. View order in orders list
6. Create shipment for order
7. View revenue with that product

### Scenario 2: Multi-Store Seller
1. Create second store
2. Switch between stores
3. Verify data is store-specific
4. Create products in each store
5. Verify products don't mix between stores

### Scenario 3: Team Collaboration
1. Invite team member
2. Verify invitation appears
3. Update team member role
4. Remove team member
5. Verify owner cannot be removed

---

## Common Issues & Troubleshooting

### Issue: "Store not found or access denied"
**Cause**: Store ownership verification failed
**Solution**: 
- Verify user is store owner in database
- Check RLS policies are correct
- Verify store ID is correct

### Issue: Real-time updates not working
**Cause**: Supabase Realtime not enabled
**Solution**:
- Check Supabase dashboard
- Verify Realtime is enabled for tables
- Check connection indicator

### Issue: Products not archiving
**Cause**: Migration not applied
**Solution**: Apply `003_seller_dashboard.sql` migration

### Issue: Search not working
**Cause**: Store ID not set
**Solution**: Select store in header dropdown

### Issue: Charts not rendering
**Cause**: No data or chart library issue
**Solution**:
- Verify data exists
- Check browser console for errors
- Verify Recharts is installed

---

## Test Data Setup Script

To quickly set up test data, you can run this SQL in Supabase:

```sql
-- Create test seller user (if not exists)
INSERT INTO users (id, name, email, role)
VALUES ('test-seller-id', 'Test Seller', 'seller@test.com', 'seller')
ON CONFLICT (email) DO NOTHING;

-- Create test store
INSERT INTO stores (id, owner_id, name, description, address, city, state, zip, verification_status)
VALUES ('test-store-id', 'test-seller-id', 'Test Store', 'A test store', '123 Test St', 'Test City', 'TS', '12345', 'verified')
ON CONFLICT (id) DO NOTHING;

-- Create test products
INSERT INTO products (id, store_id, name, price, stock, category, description)
VALUES 
  ('product-1', 'test-store-id', 'Test Product 1', 29.99, 10, 'Snapbacks', 'Test product 1'),
  ('product-2', 'test-store-id', 'Test Product 2', 39.99, 5, 'Fitted', 'Test product 2')
ON CONFLICT (id) DO NOTHING;
```

---

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ All features working as expected
- ✅ Responsive design working
- ✅ Real-time updates functioning
- ✅ Error handling appropriate
- ✅ Performance acceptable (< 2s page load)

---

**Happy Testing! 🚀**

