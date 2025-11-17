# Project Coordinator Plan: Issue #11 - Implement Seller and Buyer Dashboards

## Issue Summary

**GitHub Issue**: #11 - Feature: Implement Seller and Buyer Dashboards

**Scope**: 
- Refactor dashboard to use role-specific components (buyer, seller)
- Implement real database queries for summary cards
- Keep charts using mock data initially (incremental approach)
- Add server-side caching for < 2s load time
- Comprehensive testing (unit, component, E2E)

**Architecture**: Hybrid approach - single route `/dashboard` with role-based component rendering

---

## Agents Involved

### 1. **typescript-test-explorer**
**Role**: Test case design and exploratory testing
**Tasks**:
- Design comprehensive test cases for data services
- Define test scenarios for components
- Identify edge cases and failure modes
- Create test structure following TDD approach

**Timing**: Start early, can run in parallel with initial planning

### 2. **frontend-developer**
**Role**: Main implementation (components, data services, architecture)
**Tasks**:
- Refactor dashboard page to render role-specific components
- Create `BuyerDashboard.tsx` and `SellerDashboard.tsx` components
- Implement `getBuyerDashboardData.ts` with real Supabase queries
- Implement `getSellerDashboardData.ts` with real Supabase queries
- Add server-side caching with Next.js `unstable_cache`
- Add i18n translation keys
- Implement error handling and empty states

**Timing**: Main implementation phase, works in TDD cycles with frontend-test-engineer

### 3. **frontend-test-engineer**
**Role**: Write unit and component tests
**Tasks**:
- Write unit tests for data services (`getBuyerDashboardData.test.ts`, `getSellerDashboardData.test.ts`)
- Write component tests for `BuyerDashboard.tsx` and `SellerDashboard.tsx`
- Test caching behavior
- Test error handling and empty states
- Verify type safety and edge cases

**Timing**: Works in TDD cycles alongside frontend-developer (test first, then implement)

### 4. **qa-criteria-validation**
**Role**: Acceptance criteria validation and E2E testing
**Tasks**:
- Define/validate acceptance criteria for buyer and seller dashboards
- Create Playwright E2E tests (`e2e/dashboard.spec.ts`)
- Validate performance (< 2s load time)
- Validate accessibility (ARIA labels, keyboard navigation)
- Run final validation after implementation

**Timing**: Early for acceptance criteria, late for E2E validation

---

## Parallel Execution Strategy

### Phase 0: Planning & Test Design (Parallel - No Dependencies)

**Can run in parallel**:
1. **typescript-test-explorer**: Design comprehensive test cases
   - Analyze requirements from issue #11
   - Design test scenarios for data services
   - Define component test cases
   - Identify edge cases
   - **Output**: `.cursor/doc/role-based-dashboards/test_cases.md`

2. **qa-criteria-validation**: Define/validate acceptance criteria
   - Review issue requirements
   - Define Given-When-Then scenarios
   - Create acceptance criteria checklist
   - **Output**: Update issue with acceptance criteria

**Estimated Time**: 30-60 minutes

---

### Phase 1: Architecture Setup (TDD Cycle 1)

**Sequential TDD** - Frontend-developer + Frontend-test-engineer work together:

#### Step 1.1: Refactor Dashboard Page (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test dashboard page renders role-specific components
- [ ] Test role detection logic (buyer, seller, admin)
- [ ] Test redirect when user not authenticated
- **File**: `src/__tests__/app/dashboard/page.test.tsx`

**Implement** (`frontend-developer`):
- [ ] Refactor `src/app/[locale]/dashboard/page.tsx`
- [ ] Add role-based component rendering logic
- [ ] Maintain shared layout (Navbar, Footer)

**Verify**: Tests pass, dashboard renders correctly

**Estimated Time**: 30-45 minutes

#### Step 1.2: Create Buyer Dashboard Component Shell (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `BuyerDashboard.tsx` renders with userId prop
- [ ] Test loading state display
- [ ] Test empty state display
- **File**: `src/components/dashboard/__tests__/buyer/BuyerDashboard.test.tsx`

**Implement** (`frontend-developer`):
- [ ] Create `src/components/dashboard/buyer/BuyerDashboard.tsx` (shell only)
- [ ] Add basic structure with loading/empty states
- [ ] Integrate with dashboard page

**Verify**: Tests pass, component renders

**Estimated Time**: 20-30 minutes

#### Step 1.3: Create Seller Dashboard Component Shell (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `SellerDashboard.tsx` renders with userId prop
- [ ] Test loading state display
- [ ] Test empty state display
- **File**: `src/components/dashboard/__tests__/seller/SellerDashboard.test.tsx`

**Implement** (`frontend-developer`):
- [ ] Create `src/components/dashboard/seller/SellerDashboard.tsx` (shell only)
- [ ] Add basic structure with loading/empty states
- [ ] Integrate with dashboard page

**Verify**: Tests pass, component renders

**Estimated Time**: 20-30 minutes

---

### Phase 2: Buyer Dashboard Data Service (TDD Cycles 2-5)

**Sequential TDD** - Small pieces, step by step:

#### Cycle 2.1: Total Orders Count Query (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getBuyerOrdersCount` function with mocked Supabase
- [ ] Test with valid userId returns count
- [ ] Test with no orders returns 0
- [ ] Test with database error handles gracefully
- **File**: `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`

**Implement** (`frontend-developer`):
- [ ] Create `src/application/dashboard/buyer/getBuyerDashboardData.ts`
- [ ] Implement `getBuyerOrdersCount` function
- [ ] Add error handling

**Verify**: Tests pass, function works correctly

#### Cycle 2.2: Total Spent Query (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getBuyerTotalSpent` function
- [ ] Test sums only completed orders
- [ ] Test returns 0 when no completed orders
- [ ] Test handles null values correctly

**Implement** (`frontend-developer`):
- [ ] Implement `getBuyerTotalSpent` function
- [ ] Add currency formatting

**Verify**: Tests pass

#### Cycle 2.3: Recent Order Date Query (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getBuyerRecentOrderDate` function
- [ ] Test returns most recent order date
- [ ] Test returns null when no orders
- [ ] Test date formatting

**Implement** (`frontend-developer`):
- [ ] Implement `getBuyerRecentOrderDate` function
- [ ] Add date formatting

**Verify**: Tests pass

#### Cycle 2.4: Pending Orders Count Query (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getBuyerPendingOrdersCount` function
- [ ] Test counts pending and processing orders
- [ ] Test excludes completed/cancelled orders

**Implement** (`frontend-developer`):
- [ ] Implement `getBuyerPendingOrdersCount` function

**Verify**: Tests pass

#### Cycle 2.5: Complete Buyer Dashboard Data Service (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getBuyerDashboardData` aggregates all metrics
- [ ] Test caching behavior (Next.js unstable_cache)
- [ ] Test error handling when any query fails
- [ ] Test empty state data structure

**Implement** (`frontend-developer`):
- [ ] Implement `getBuyerDashboardData` main function
- [ ] Add Next.js caching (`unstable_cache` with 60s revalidation)
- [ ] Add error handling and empty states
- [ ] Format data for summary cards

**Verify**: Tests pass, caching works

**Estimated Time per Cycle**: 20-30 minutes
**Total Phase 2**: ~2-2.5 hours

---

### Phase 3: Buyer Dashboard UI Components (TDD Cycles 6-8)

#### Cycle 3.1: Buyer Summary Cards Integration (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test BuyerDashboard displays summary cards with real data
- [ ] Test cards show correct values from data service
- [ ] Test loading state shows skeleton
- [ ] Test empty state shows message

**Implement** (`frontend-developer`):
- [ ] Integrate `getBuyerDashboardData` into `BuyerDashboard.tsx`
- [ ] Display summary cards with real data
- [ ] Add loading and empty states

**Verify**: Tests pass, UI shows real data

#### Cycle 3.2: Buyer Order History Component (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `BuyerOrderHistory.tsx` renders order list
- [ ] Test displays order status, date, amount
- [ ] Test orders sorted by most recent
- [ ] Test empty state when no orders
- **File**: `src/components/dashboard/__tests__/buyer/BuyerOrderHistory.test.tsx`

**Implement** (`frontend-developer`):
- [ ] Create `src/components/dashboard/buyer/BuyerOrderHistory.tsx`
- [ ] Fetch recent orders from database
- [ ] Display order list with status badges
- [ ] Add empty state

**Verify**: Tests pass, orders display correctly

#### Cycle 3.3: Buyer Dashboard i18n (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test translation keys load correctly
- [ ] Test buyer dashboard in English, Spanish, Arabic

**Implement** (`frontend-developer`):
- [ ] Add translation keys to `messages/{locale}.json`
- [ ] Integrate i18n into buyer dashboard components

**Verify**: Translations work in all locales

**Total Phase 3**: ~1.5-2 hours

---

### Phase 4: Seller Dashboard Data Service (TDD Cycles 9-13)

**Sequential TDD** - Similar pattern to buyer dashboard:

#### Cycle 4.1: Get Seller Stores Query (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getSellerStores` function
- [ ] Test returns stores for seller's owner_id
- [ ] Test handles seller with no stores

**Implement** (`frontend-developer`):
- [ ] Implement `getSellerStores` function

**Verify**: Tests pass

#### Cycle 4.2: Seller Revenue Query (7 days) (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getSellerRevenue7Days` function
- [ ] Test calculates revenue from order_items correctly
- [ ] Test joins products, stores correctly
- [ ] Test filters by date range

**Implement** (`frontend-developer`):
- [ ] Implement `getSellerRevenue7Days` with complex JOIN query
- [ ] Add currency formatting

**Verify**: Tests pass, revenue calculated correctly

#### Cycle 4.3: Orders Fulfilled Count (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getSellerOrdersFulfilled` function
- [ ] Test counts only completed orders
- [ ] Test handles complex JOIN correctly

**Implement** (`frontend-developer`):
- [ ] Implement `getSellerOrdersFulfilled` function

**Verify**: Tests pass

#### Cycle 4.4: Products Listed Count (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getSellerProductsCount` function
- [ ] Test counts products from seller's stores

**Implement** (`frontend-developer`):
- [ ] Implement `getSellerProductsCount` function

**Verify**: Tests pass

#### Cycle 4.5: Low Stock Alerts Query (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getSellerLowStockProducts` function
- [ ] Test filters products with stock < 10
- [ ] Test orders by stock ascending
- [ ] Test returns empty array when no low stock

**Implement** (`frontend-developer`):
- [ ] Implement `getSellerLowStockProducts` function

**Verify**: Tests pass

#### Cycle 4.6: Complete Seller Dashboard Data Service (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `getSellerDashboardData` aggregates all metrics
- [ ] Test caching behavior
- [ ] Test error handling

**Implement** (`frontend-developer`):
- [ ] Implement `getSellerDashboardData` main function
- [ ] Add caching (60s revalidation)
- [ ] Add error handling

**Verify**: Tests pass

**Total Phase 4**: ~2-2.5 hours

---

### Phase 5: Seller Dashboard UI Components (TDD Cycles 14-16)

#### Cycle 5.1: Seller Summary Cards Integration (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test SellerDashboard displays summary cards with real data
- [ ] Test loading and empty states

**Implement** (`frontend-developer`):
- [ ] Integrate `getSellerDashboardData` into `SellerDashboard.tsx`
- [ ] Display summary cards with real data

**Verify**: Tests pass

#### Cycle 5.2: Seller Order List Component (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `SellerOrderList.tsx` displays pending orders
- [ ] Test shows product details and buyer info
- **File**: `src/components/dashboard/__tests__/seller/SellerOrderList.test.tsx`

**Implement** (`frontend-developer`):
- [ ] Create `src/components/dashboard/seller/SellerOrderList.tsx`
- [ ] Fetch pending orders for seller's products
- [ ] Display order list

**Verify**: Tests pass

#### Cycle 5.3: Seller Low Stock Alerts Component (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test `SellerLowStockAlerts.tsx` displays low stock products
- [ ] Test sorted by urgency (lowest stock first)
- **File**: `src/components/dashboard/__tests__/seller/SellerLowStockAlerts.test.tsx`

**Implement** (`frontend-developer`):
- [ ] Create `src/components/dashboard/seller/SellerLowStockAlerts.tsx`
- [ ] Display low stock products with stock counts

**Verify**: Tests pass

#### Cycle 5.4: Seller Dashboard i18n (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test seller dashboard translations

**Implement** (`frontend-developer`):
- [ ] Add seller translation keys
- [ ] Integrate i18n

**Verify**: Translations work

**Total Phase 5**: ~1.5-2 hours

---

### Phase 6: Performance & Caching Validation (TDD Cycle 17)

#### Cycle 6.1: Performance Testing (Test → Implement → Verify)

**Test First** (`frontend-test-engineer`):
- [ ] Test dashboard loads in < 2 seconds (E2E)
- [ ] Test caching prevents duplicate queries
- [ ] Test cache invalidation after 60s

**Implement** (`frontend-developer`):
- [ ] Optimize queries if needed
- [ ] Verify caching configuration
- [ ] Add performance monitoring

**Verify**: Performance targets met

**Total Phase 6**: ~30-45 minutes

---

### Phase 7: E2E Testing & Validation (Parallel - After Implementation)

**Can run in parallel**:

1. **qa-criteria-validation**: 
   - Create Playwright E2E tests (`e2e/dashboard.spec.ts`)
   - Test buyer login → dashboard → view orders flow
   - Test seller login → dashboard → view sales flow
   - Validate < 2s load time
   - Test empty states and error scenarios
   - Validate accessibility

2. **frontend-test-engineer**:
   - Final test review
   - Ensure >80% coverage
   - Test edge cases

**Estimated Time**: 1-1.5 hours

---

## Summary: TDD Implementation Flow

### Quick Reference

**Total Estimated Time**: 8-10 hours

**Phases**:
1. **Phase 0** (Parallel): Planning & test design - 30-60 min
2. **Phase 1** (Sequential TDD): Architecture setup - 1-1.5 hours
3. **Phase 2** (Sequential TDD): Buyer data service - 2-2.5 hours
4. **Phase 3** (Sequential TDD): Buyer UI components - 1.5-2 hours
5. **Phase 4** (Sequential TDD): Seller data service - 2-2.5 hours
6. **Phase 5** (Sequential TDD): Seller UI components - 1.5-2 hours
7. **Phase 6** (Sequential TDD): Performance validation - 30-45 min
8. **Phase 7** (Parallel): E2E testing & final validation - 1-1.5 hours

**TDD Pattern**: Each cycle follows Test → Implement → Verify
- Small, focused pieces
- One functionality at a time
- Tests guide implementation
- Continuous verification

---

## Dependencies & Blockers

**No Blockers**: All database tables and RLS policies already exist

**Dependencies**:
- Phase 2 depends on Phase 1 (component shells)
- Phase 3 depends on Phase 2 (data service)
- Phase 4 can start after Phase 2 (different data service, no overlap)
- Phase 5 depends on Phase 4 (data service)
- Phase 7 depends on Phases 1-6 (full implementation)

**Parallel Opportunities**:
- Phase 0: All planning agents can run in parallel
- Phase 4 can start while Phase 3 is in progress (different services)
- Phase 7: E2E and final validation can run in parallel

---

## Files to Create/Modify

### New Files
- `src/components/dashboard/buyer/BuyerDashboard.tsx`
- `src/components/dashboard/buyer/BuyerOrderHistory.tsx`
- `src/components/dashboard/seller/SellerDashboard.tsx`
- `src/components/dashboard/seller/SellerOrderList.tsx`
- `src/components/dashboard/seller/SellerLowStockAlerts.tsx`
- `src/application/dashboard/buyer/getBuyerDashboardData.ts`
- `src/application/dashboard/seller/getSellerDashboardData.ts`
- Test files for all above components/services

### Modified Files
- `src/app/[locale]/dashboard/page.tsx` (refactor)
- `messages/en.json`, `messages/es.json`, `messages/ar.json` (add translations)

---

## Success Criteria

- ✅ Buyer dashboard shows real order data from database
- ✅ Seller dashboard shows real revenue and inventory from database
- ✅ Dashboard loads in < 2 seconds
- ✅ All unit tests pass (>80% coverage)
- ✅ All component tests pass
- ✅ E2E tests pass
- ✅ Caching works correctly (60s buyer/seller)
- ✅ Error handling and empty states work
- ✅ i18n translations complete
- ✅ Code review ready (Clean Architecture, TypeScript strict)

---

## Next Steps After User Approval

1. Start Phase 0: Launch `typescript-test-explorer` and `qa-criteria-validation` in parallel
2. Begin Phase 1: Start TDD cycle with `frontend-developer` + `frontend-test-engineer`
3. Proceed step-by-step through all phases
4. Before commit: Run `@vercel-deployment-verifier`
5. After approval: Commit and push to `feature-issue-#11` branch

