# Admin Stores Dashboard - Session Context

## Feature Request
Show stores verified and to be verified in Dashboard for admin role

## Session Timeline
- Started: [Current Date]

## Exploration Phase

### Current State Analysis

#### Admin Dashboard Structure
- **Location**: `src/components/dashboard/admin/AdminDashboardClient.tsx`
- **Data Fetching**: `src/application/dashboard/admin/getAdminDashboardData.ts`
- **Current Components**:
  - `PendingStoresList` - Shows stores with `verification_status = 'pending'` (already exists)
  - `TopStoresList` - Shows top performing stores by revenue
  - `StoreLocationsMap` - Shows verified stores on a map
  - Other charts and summary cards

#### Store Verification Status
- **Database Field**: `verification_status` in `stores` table
- **Possible Values**: `'pending'`, `'verified'`, `'rejected'`
- **Schema**: Defined in `src/infrastructure/database/migrations/002_complete_schema.sql`

#### Current Data Flow
1. `getAdminDashboardData()` fetches:
   - Pending stores (for `PendingStoresList`) - limited to 10
   - Verified stores (for map locations only)
   - Top stores (by revenue, already verified)
   
2. `AdminDashboardClient` displays:
   - Summary cards showing counts of verified and pending stores
   - `PendingStoresList` in a card showing stores awaiting verification
   - No dedicated list of verified stores (only map visualization)

#### API Endpoints Available
- `GET /api/admin/stores/[id]` - Get individual store details
- `POST /api/admin/stores/[id]/approve` - Approve a store
- `POST /api/admin/stores/[id]/reject` - Reject a store

#### Components to Reference
- `PendingStoresList.tsx` - Good reference for table structure and actions
- `TopStoresList.tsx` - Good reference for verified stores display pattern
- `StoreApprovalPage.tsx` - Shows detailed store view

### Key Findings
1. ✅ Pending stores are already displayed in the dashboard
2. ❌ Verified stores are NOT shown in a list format (only on map)
3. ✅ Infrastructure exists: database fields, API endpoints, components structure
4. ✅ Real-time updates are handled via `useAdminRealtime` hook
5. ✅ Translation keys exist in `messages/en.json` for admin dashboard

## Team Selection

### Subagents for Advice Phase (if needed)
1. **UI/UX Advisor** - For dashboard layout optimization and component design patterns
2. **Database Expert** - For efficient querying patterns and data fetching optimization
3. **TypeScript Expert** - For type safety and interface design

Note: Based on current codebase patterns, we may not need subagents as the patterns are well-established.

## Implementation Plan

### Overview
Add a new `VerifiedStoresList` component to display verified stores alongside the existing `PendingStoresList` in the Admin Dashboard.

### Phase 1: Data Layer Updates

#### 1.1 Update `getAdminDashboardData` Function
- **File**: `src/application/dashboard/admin/getAdminDashboardData.ts`
- **Changes**:
  - Add `verifiedStores` field to `AdminDashboardData` type
  - Fetch verified stores list (similar to pending stores)
  - Include owner information for verified stores
  - Order by `verified_at` descending (most recently verified first)
  - Limit to 10-15 stores for dashboard display
  - Return alongside existing data

#### 1.2 Data Type Definitions
- **File**: `src/components/dashboard/admin/VerifiedStoresList.tsx` (new file)
- **Type**: `VerifiedStore` interface similar to `PendingStore`
  - `id: string`
  - `name: string`
  - `owner: string`
  - `verifiedAt: Date`
  - `productsCount?: number` (optional, if available)

### Phase 2: Component Development

#### 2.1 Create `VerifiedStoresList` Component
- **File**: `src/components/dashboard/admin/VerifiedStoresList.tsx` (new)
- **Features**:
  - Display verified stores in a table format (similar to `PendingStoresList`)
  - Show store name, owner, verification date, products count (if available)
  - Link to store detail page
  - Badge indicating "Verified" status
  - Empty state handling
  - Responsive design matching existing components

#### 2.2 Update `AdminDashboardClient` Component
- **File**: `src/components/dashboard/admin/AdminDashboardClient.tsx`
- **Changes**:
  - Import new `VerifiedStoresList` component
  - Add verified stores section in the dashboard layout
  - Place verified stores list in appropriate grid position
  - Maintain responsive grid layout (may need to adjust from 3 columns)

### Phase 3: UI/UX Enhancements

#### 3.1 Dashboard Layout Updates
- **File**: `src/components/dashboard/admin/AdminDashboardClient.tsx`
- **Layout Options**:
  - **Option A**: Add verified stores in a new row above or below pending stores
  - **Option B**: Use tabs to switch between "Pending" and "Verified"
  - **Option C**: Use a segmented control to filter stores by status
  - **Option D**: Keep both lists side by side (current 2-column layout)

#### 3.2 Visual Design
- Match existing component styling (Card, Table components)
- Use consistent badges for verification status
- Add icons for visual clarity (Check icon for verified)
- Ensure mobile responsiveness

### Phase 4: Translation & Internationalization

#### 4.1 Add Translation Keys
- **File**: `messages/en.json`
- **Keys to add**:
  ```json
  "verifiedStores": "Verified Stores",
  "verifiedStoresDesc": "Stores that have been verified",
  "noVerifiedStores": "No verified stores",
  "verifiedAt": "Verified",
  "viewDetails": "View Details"
  ```

### Phase 5: Real-time Updates

#### 5.1 Realtime Integration
- **File**: `src/components/dashboard/admin/AdminDashboardClient.tsx`
- **Current State**: `useAdminRealtime` already handles store updates
- **Action Required**: 
  - Verify that verified stores list updates when a store status changes
  - Test real-time updates when a pending store is approved

### Phase 6: Testing

#### 6.1 Component Tests
- **File**: `src/components/dashboard/admin/__tests__/VerifiedStoresList.test.tsx` (new)
- **Test Cases**:
  - Renders verified stores correctly
  - Shows empty state when no verified stores
  - Displays store information correctly
  - Links work correctly
  - Handles loading states

#### 6.2 Integration Tests
- Test data fetching in `getAdminDashboardData`
- Test dashboard rendering with verified stores
- Test real-time updates

#### 6.3 E2E Considerations
- Test admin can see verified stores
- Test verified stores update after approval
- Test responsive design

### Phase 7: Documentation

#### 7.1 Code Documentation
- Add JSDoc comments to new components
- Document component props and interfaces
- Document data flow

### Files to Create
1. `src/components/dashboard/admin/VerifiedStoresList.tsx`
2. `src/components/dashboard/admin/__tests__/VerifiedStoresList.test.tsx`

### Files to Modify
1. `src/application/dashboard/admin/getAdminDashboardData.ts`
2. `src/components/dashboard/admin/AdminDashboardClient.tsx`
3. `messages/en.json`

### Dependencies
- No new external dependencies required
- Uses existing UI components (Card, Table, Badge, Button)
- Uses existing icons from `lucide-react`

## Advice & Research

### Assessment
Based on the codebase exploration:
- ✅ Well-established patterns exist for similar components (`PendingStoresList`, `TopStoresList`)
- ✅ TypeScript types and interfaces are consistent
- ✅ Database queries follow established patterns
- ✅ UI components library is consistent (shadcn/ui)

### Decision
**No subagents needed** - The codebase has clear patterns and conventions that we can follow directly. The implementation will mirror existing components (`PendingStoresList`) with appropriate adaptations for verified stores.

### Research Notes
- The existing `PendingStoresList` component provides an excellent template
- The `getAdminDashboardData` function already queries verified stores for the map
- Real-time updates via `useAdminRealtime` are already in place
- Translation structure in `messages/en.json` is consistent

## Clarifications Needed

### Questions for User:

#### A) Layout Preference
**How should verified stores be displayed in the dashboard?**

- **Option A**: Separate card/list below or above pending stores (simple addition)
- **Option B**: Tabs to switch between "Pending" and "Verified" stores (better organization)
- **Option C**: Segmented control/filter to view all stores with status filtering (unified view)
- **Option D**: Keep existing 3-column grid, add verified stores as 4th column (more compact)

#### B) Store Information Display
**What information should be shown for verified stores?**

- **Option A**: Minimal info (Name, Owner, Verified Date, Link to details)
- **Option B**: Extended info (Name, Owner, Verified Date, Products Count, Revenue, Link)
- **Option C**: Match pending stores format exactly (Name, Owner, Category, Verified Date, Actions)

#### C) Actions Available
**What actions should admins be able to perform on verified stores from the dashboard?**

- **Option A**: View details only (read-only)
- **Option B**: View details + Revoke verification (ability to unverify)
- **Option C**: Full management (View, Revoke, Edit store details)

#### D) Pagination/Limits
**How many verified stores should be shown?**

- **Option A**: Show 10-15 most recently verified (matches pending stores pattern)
- **Option B**: Show all verified stores with pagination
- **Option C**: Show top 10 by revenue/performance (already have TopStoresList)

#### E) Sorting
**How should verified stores be sorted?**

- **Option A**: Most recently verified first (default)
- **Option B**: Alphabetical by store name
- **Option C**: By verification date descending
- **Option D**: By products count or revenue

## Clarifications Received

### User Decisions:
- **A) Layout**: D) Keep existing 3-column grid, add verified stores as 4th column (more compact)
- **B) Information Display**: A) Minimal info (Name, Owner, Verified Date, Link to details)
- **C) Actions**: C) Full management (View, Revoke, Edit store details)
- **D) Pagination**: B) Show all verified stores with pagination
- **E) Sorting**: C) By verification date descending

## Final Plan

### Overview
Add a new `VerifiedStoresList` component to display verified stores in a 4-column grid layout alongside existing dashboard components. The component will show minimal store information with full management capabilities (view, revoke, edit) and include pagination for all verified stores.

### Phase 1: Data Layer Updates

#### 1.1 Update `AdminDashboardData` Type
- **File**: `src/application/dashboard/admin/getAdminDashboardData.ts`
- **Changes**:
  - Add `verifiedStores: VerifiedStore[]` to `AdminDashboardData` type
  - Add `verifiedStoresTotal: number` for pagination support
  - Define `VerifiedStore` type similar to `PendingStore`:
    ```typescript
    export type VerifiedStore = {
      id: string;
      name: string;
      owner: string;
      verifiedAt: Date;
      productsCount?: number;
    };
    ```

#### 1.2 Update `getAdminDashboardData` Function
- **File**: `src/application/dashboard/admin/getAdminDashboardData.ts`
- **Changes**:
  - Add query to fetch verified stores:
    - Filter: `verification_status = 'verified'`
    - Select: `id, name, created_at, verified_at, products_count, owner (name, email)`
    - Order by: `verified_at DESC`
    - Include total count for pagination
    - Initially fetch first page (e.g., 10-15 stores for initial dashboard load)
  - Add verified stores count query
  - Process owner information (handle array or single object pattern)
  - Map to `VerifiedStore` type
  - Return alongside existing data

### Phase 2: Component Development

#### 2.1 Create `VerifiedStoresList` Component
- **File**: `src/components/dashboard/admin/VerifiedStoresList.tsx` (new)
- **Props**:
  ```typescript
  interface VerifiedStoresListProps {
    stores: VerifiedStore[];
    totalCount?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    itemsPerPage?: number;
  }
  ```
- **Features**:
  - Display verified stores in a table format (similar to `PendingStoresList`)
  - Show minimal info: Store Name, Owner, Verified Date, Link to details
  - Actions:
    - View Details button (link to `/dashboard/admin/stores/[id]`)
    - Revoke Verification button (with confirmation dialog)
    - Edit Store button (link to edit page or modal)
  - Badge indicating "Verified" status with Check icon
  - Empty state: "No verified stores"
  - Pagination component (if totalCount and onPageChange provided)
  - Loading states
  - Responsive design matching existing components
  - Use Card, Table, Badge, Button components (shadcn/ui)
  - Use icons: Check, ExternalLink, Edit, X (from lucide-react)

#### 2.2 Create Pagination Component (if not exists)
- Check if pagination component exists in UI library
- If not, create simple pagination component or use existing one
- Display page numbers, prev/next buttons
- Show "Showing X-Y of Z stores"

#### 2.3 Update `AdminDashboardClient` Component
- **File**: `src/components/dashboard/admin/AdminDashboardClient.tsx`
- **Changes**:
  - Import new `VerifiedStoresList` component
  - Update grid layout from `md:grid-cols-2 lg:grid-cols-3` to support 4 columns
  - Add verified stores list in the 4th column position
  - Add pagination state management (if client-side pagination needed)
  - Maintain responsive layout (collapse to fewer columns on smaller screens)
  - Grid layout should be: `md:grid-cols-2 lg:grid-cols-4` or similar

### Phase 3: Action Handlers

#### 3.1 Create Revoke Verification Handler
- **File**: `src/components/dashboard/admin/VerifiedStoresList.tsx`
- **Functionality**:
  - Create `handleRevoke` function
  - **Note**: Revoke differs from reject - revoke sets status to "pending" (for re-verification), reject sets to "rejected"
  - Option A: Create new endpoint `POST /api/admin/stores/[id]/revoke` that sets status to "pending"
  - Option B: Modify existing reject endpoint to accept an action parameter ("reject" or "revoke")
  - Show confirmation dialog before revoking with clear message
  - On success: Refresh dashboard or update state
  - On error: Show error toast
  - Handle loading state during request

#### 3.2 Create Edit Store Handler
- **File**: `src/components/dashboard/admin/VerifiedStoresList.tsx`
- **Functionality**:
  - Navigate to store edit page or open edit modal
  - Link to: `/dashboard/admin/stores/[id]/edit` (may need to create)
  - Or open existing `StoreApprovalPage` in edit mode

#### 3.3 API Endpoint for Revoke (NEW)
- **File**: `src/app/api/admin/stores/[id]/revoke/route.ts` (new file)
- **Functionality**:
  - POST endpoint to revoke verification
  - Sets `verification_status` to "pending" (not "rejected")
  - Clears `verified_at` timestamp
  - Updates `updated_at` timestamp
  - Returns updated store object
  - Follows same pattern as approve/reject endpoints
  - Include error handling and validation

### Phase 4: UI/UX Implementation

#### 4.1 Dashboard Layout Updates
- **File**: `src/components/dashboard/admin/AdminDashboardClient.tsx`
- **Layout**:
  - Current: 3-column grid `lg:grid-cols-3`
  - New: 4-column grid `lg:grid-cols-4`
  - Responsive breakpoints:
    - Mobile: 1 column
    - Tablet: 2 columns (`md:grid-cols-2`)
    - Desktop: 4 columns (`lg:grid-cols-4`)
  - Ensure all cards fit properly in 4-column layout

#### 4.2 Verified Stores Card Design
- Match existing card styling (Card, CardHeader, CardTitle, CardDescription)
- Table design matching `PendingStoresList`
- Action buttons: View (outline), Edit (outline), Revoke (destructive)
- Badge: "Verified" with green/success variant
- Verification date formatting: Use `date-fns` format function

#### 4.3 Pagination UI
- Add pagination component at bottom of table
- Show: "Showing 1-15 of 42 stores" or similar
- Page numbers with ellipsis for large page counts
- Previous/Next buttons
- Ensure pagination works with server-side or client-side fetching

### Phase 5: Translation & Internationalization

#### 5.1 Add Translation Keys
- **File**: `messages/en.json`
- **Keys to add under `admin.dashboard`**:
  ```json
  {
    "verifiedStores": "Verified Stores",
    "verifiedStoresDesc": "Stores that have been verified",
    "noVerifiedStores": "No verified stores",
    "verifiedAt": "Verified",
    "revokeVerification": "Revoke Verification",
    "revokeConfirmTitle": "Revoke Store Verification",
    "revokeConfirmDesc": "Are you sure you want to revoke verification for {name}? The store will need to be re-verified.",
    "editStore": "Edit Store",
    "showingStores": "Showing {start}-{end} of {total} stores"
  }
  ```

### Phase 6: Pagination Implementation

#### 6.1 Server-Side Pagination (Recommended)
- **File**: `src/application/dashboard/admin/getAdminDashboardData.ts`
- **Implementation**:
  - Accept pagination parameters (page, limit) in function
  - Calculate offset: `(page - 1) * limit`
  - Fetch stores with limit and offset
  - Return: `stores`, `totalCount`, `page`, `limit`
  - Update function signature to accept optional pagination params

#### 6.2 Client-Side Pagination (Alternative)
- **File**: `src/components/dashboard/admin/VerifiedStoresList.tsx`
- **Implementation**:
  - Fetch all verified stores initially
  - Implement pagination logic in component
  - Slice stores array based on current page
  - Only recommended if store count is relatively small (< 100)

#### 6.3 Pagination State Management
- Use React state for current page
- Handle page changes via callback
- For server-side: Refetch data on page change
- For client-side: Update displayed slice

### Phase 7: Real-time Updates

#### 7.1 Realtime Integration
- **File**: `src/components/dashboard/admin/AdminDashboardClient.tsx`
- **Current State**: `useAdminRealtime` already handles store updates
- **Verification**:
  - When a pending store is approved → Should appear in verified list
  - When a verified store is revoked → Should disappear from verified list
  - Test that `handleStoreChange` updates verified stores appropriately
  - May need to refresh or update state when verification status changes

### Phase 8: Testing

#### 8.1 Component Tests
- **File**: `src/components/dashboard/admin/__tests__/VerifiedStoresList.test.tsx` (new)
- **Test Cases**:
  - Renders verified stores correctly
  - Shows empty state when no verified stores
  - Displays store information correctly (name, owner, verified date)
  - Links to store details work
  - Revoke button triggers confirmation dialog
  - Revoke action calls API and updates state
  - Edit button navigates correctly
  - Pagination renders and works correctly
  - Handles loading states
  - Handles error states

#### 8.2 Integration Tests
- **File**: `src/application/dashboard/admin/__tests__/getAdminDashboardData.test.ts` (if exists)
- **Test Cases**:
  - Fetches verified stores correctly
  - Returns verified stores in correct format
  - Handles pagination parameters
  - Returns correct total count

#### 8.3 E2E Considerations
- Admin can see verified stores list
- Verified stores update after approving a pending store
- Revoke verification works and updates dashboard
- Pagination works correctly
- Responsive design works on mobile/tablet/desktop

### Phase 9: Documentation

#### 9.1 Code Documentation
- Add JSDoc comments to new components
- Document component props and interfaces
- Document data flow and pagination approach
- Document API endpoints used

### Files to Create
1. `src/components/dashboard/admin/VerifiedStoresList.tsx`
2. `src/components/dashboard/admin/__tests__/VerifiedStoresList.test.tsx`

### Files to Modify
1. `src/application/dashboard/admin/getAdminDashboardData.ts`
   - Add `verifiedStores` to return type
   - Add verified stores query
   - Add pagination support
2. `src/components/dashboard/admin/AdminDashboardClient.tsx`
   - Update grid layout to 4 columns
   - Add VerifiedStoresList component
   - Add pagination state management
3. `messages/en.json`
   - Add translation keys for verified stores

### Files to Review/Create (if needed)
1. `src/app/[locale]/dashboard/admin/stores/[id]/edit/page.tsx` (may need to create for edit functionality)
   - Alternative: Reuse `StoreApprovalPage` component with edit mode
   - Or: Navigate to existing store detail page and add edit capabilities there
2. ✅ `src/components/ui/pagination.tsx` (exists - can use existing Pagination component)

### Dependencies
- No new external dependencies required
- Uses existing UI components (Card, Table, Badge, Button, AlertDialog, Pagination)
- Uses existing icons from `lucide-react`
- Uses existing date formatting (`date-fns`)
- Uses existing routing (`next/navigation`, `@/i18n/routing-config`)
- Uses existing pagination component from `src/components/ui/pagination.tsx`

### Implementation Notes
1. **Pagination Approach**: Recommend server-side pagination for better performance with many stores
   - Update `getAdminDashboardData` to accept optional pagination params
   - Fetch verified stores with limit/offset
   - Return total count for pagination calculation
2. **Grid Layout**: Ensure 4-column layout doesn't break existing components - may need to adjust other cards
   - Current: `lg:grid-cols-3` (3 columns)
   - New: `lg:grid-cols-4` (4 columns) - may need to test responsiveness
   - Consider: Cards may become narrower, ensure text is readable
3. **Actions**: Edit functionality - multiple options:
   - Option A: Navigate to existing `/dashboard/admin/stores/[id]` page (StoreApprovalPage)
   - Option B: Open edit modal/dialog
   - Option C: Create dedicated edit page
   - Recommendation: Start with Option A (navigate to detail page), add edit mode later if needed
4. **Revoke vs Reject**: 
   - **Revoke**: Sets status to "pending" - allows re-verification (for verified stores)
   - **Reject**: Sets status to "rejected" - application denied (for pending stores)
   - Need separate endpoint for revoke (sets to "pending")
5. **Real-time Updates**: Verify that real-time updates work correctly when store status changes
   - When pending store approved → should appear in verified list
   - When verified store revoked → should move to pending list
   - Test `handleStoreChange` callback updates both lists correctly
6. **Edit Store**: The edit action may be future work - can start with view only and add edit later

### Estimated Complexity
- **Data Layer**: Medium (add queries, pagination logic)
- **Component Development**: Medium-High (table, actions, pagination)
- **Integration**: Low-Medium (layout adjustments, state management)
- **Testing**: Medium (component tests, integration tests)

