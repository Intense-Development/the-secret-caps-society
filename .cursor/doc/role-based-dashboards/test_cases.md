# Comprehensive Test Cases: Role-Based Dashboards (Issue #11)

## Test Strategy Overview

This document outlines comprehensive test cases for implementing buyer and seller dashboards with role-specific components and real database queries. Tests follow TDD principles: write test first, then implement, then verify.

**Test Framework**: Jest + React Testing Library for unit/component tests, Playwright for E2E tests  
**Mock Strategy**: Mock Supabase client in tests, use MSW for API mocking when needed  
**Coverage Target**: >80% coverage for data services and components

---

## 1. Buyer Dashboard Data Service Tests

### 1.1 Get Buyer Orders Count
**File**: `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createClient } from "@/lib/supabase/server";
import { getBuyerOrdersCount } from "@/application/dashboard/buyer/getBuyerDashboardData";

jest.mock("@/lib/supabase/server");

describe("getBuyerOrdersCount", () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return total orders count for valid userId", async () => {
    // Arrange
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({ data: 5, error: null });

    mockSupabase.from.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    // Act
    const result = await getBuyerOrdersCount(userId);

    // Assert
    expect(mockSupabase.from).toHaveBeenCalledWith("orders");
    expect(mockSelect).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(mockEq).toHaveBeenCalledWith("buyer_id", userId);
    expect(result).toBe(5);
  });

  it("should return 0 when buyer has no orders", async () => {
    // Arrange
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({ data: 0, error: null });

    mockSupabase.from.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    // Act
    const result = await getBuyerOrdersCount(userId);

    // Assert
    expect(result).toBe(0);
  });

  it("should handle database errors gracefully", async () => {
    // Arrange
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Database connection failed" },
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    // Act & Assert
    await expect(getBuyerOrdersCount(userId)).rejects.toThrow("Database connection failed");
  });

  it("should handle null userId", async () => {
    // Arrange
    const userId = null as unknown as string;

    // Act & Assert
    await expect(getBuyerOrdersCount(userId)).rejects.toThrow();
  });
});
```

### 1.2 Get Buyer Total Spent
**File**: `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`

```typescript
describe("getBuyerTotalSpent", () => {
  it("should return sum of completed orders", async () => {
    // Test: Returns correct sum when buyer has completed orders
    // Test: Returns 0 when no completed orders
    // Test: Only includes completed status, excludes pending/cancelled
    // Test: Handles null total_amount gracefully
    // Test: Handles database errors
  });

  it("should format currency correctly", async () => {
    // Test: Returns value formatted as USD currency
    // Test: Handles large numbers correctly
    // Test: Handles decimal precision
  });
});
```

### 1.3 Get Buyer Recent Order Date
**File**: `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`

```typescript
describe("getBuyerRecentOrderDate", () => {
  it("should return most recent order date", async () => {
    // Test: Returns MAX(created_at) from orders
    // Test: Returns null when no orders exist
    // Test: Handles multiple orders correctly (returns most recent)
    // Test: Date is properly formatted
  });

  it("should handle timezone correctly", async () => {
    // Test: Converts UTC to local timezone
    // Test: Handles daylight saving time
  });
});
```

### 1.4 Get Buyer Pending Orders Count
**File**: `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`

```typescript
describe("getBuyerPendingOrdersCount", () => {
  it("should count pending and processing orders only", async () => {
    // Test: Counts orders with status 'pending'
    // Test: Counts orders with status 'processing'
    // Test: Excludes 'completed' orders
    // Test: Excludes 'cancelled' orders
    // Test: Excludes 'refunded' orders
  });

  it("should return 0 when no pending orders", async () => {
    // Test: Returns 0 when all orders are completed
  });
});
```

### 1.5 Get Buyer Recent Orders List
**File**: `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`

```typescript
describe("getBuyerRecentOrders", () => {
  it("should return recent orders sorted by date", async () => {
    // Test: Returns orders ordered by created_at DESC
    // Test: Limits to 10 most recent orders
    // Test: Returns full order details (id, status, total_amount, created_at)
    // Test: Handles less than 10 orders gracefully
  });

  it("should handle empty order list", async () => {
    // Test: Returns empty array when no orders
  });
});
```

### 1.6 Get Buyer Dashboard Data (Aggregated)
**File**: `src/__tests__/application/dashboard/buyer/getBuyerDashboardData.test.ts`

```typescript
describe("getBuyerDashboardData", () => {
  it("should aggregate all buyer metrics", async () => {
    // Test: Returns object with all summary card data
    // Test: Returns structure matching SummaryCard[] format
    // Test: Includes orders count, total spent, recent date, pending count
    // Test: Formats currency values correctly
    // Test: Calculates trends and change labels
  });

  it("should handle caching correctly", async () => {
    // Test: Uses Next.js unstable_cache with correct key
    // Test: Cache key includes userId
    // Test: Revalidation set to 60 seconds
    // Test: Returns cached data on subsequent calls within 60s
  });

  it("should handle partial failures gracefully", async () => {
    // Test: If one query fails, others still return
    // Test: Shows appropriate error messages
    // Test: Doesn't crash entire dashboard
  });

  it("should handle empty state correctly", async () => {
    // Test: Returns valid data structure when buyer has no orders
    // Test: All counts are 0
    // Test: Total spent is $0.00
    // Test: Recent order date is null
    // Test: Empty orders array returned
  });
});
```

---

## 2. Seller Dashboard Data Service Tests

### 2.1 Get Seller Stores
**File**: `src/__tests__/application/dashboard/seller/getSellerDashboardData.test.ts`

```typescript
describe("getSellerStores", () => {
  it("should return stores owned by seller", async () => {
    // Test: Returns stores where owner_id matches userId
    // Test: Returns store IDs array
    // Test: Handles seller with multiple stores
    // Test: Returns empty array when seller has no stores
  });

  it("should handle database errors", async () => {
    // Test: Throws error when database query fails
  });
});
```

### 2.2 Get Seller Revenue (7 days)
**File**: `src/__tests__/application/dashboard/seller/getSellerDashboardData.test.ts`

```typescript
describe("getSellerRevenue7Days", () => {
  it("should calculate revenue from order_items correctly", async () => {
    // Test: Joins order_items, products, stores correctly
    // Test: Calculates SUM(oi.price * oi.quantity)
    // Test: Filters by store owner_id
    // Test: Filters by date range (last 7 days)
    // Test: Returns correct revenue amount
  });

  it("should handle complex JOIN correctly", async () => {
    // Test: Joins multiple tables (order_items → products → stores)
    // Test: Filters correctly with WHERE conditions
    // Test: Handles seller with multiple stores
    // Test: Handles products from different stores
  });

  it("should return 0 when no revenue in 7 days", async () => {
    // Test: Returns 0 when no orders in date range
  });

  it("should handle timezone in date filtering", async () => {
    // Test: Date range calculation accounts for timezone
    // Test: Uses NOW() - INTERVAL correctly
  });
});
```

### 2.3 Get Seller Orders Fulfilled Count
**File**: `src/__tests__/application/dashboard/seller/getSellerDashboardData.test.ts`

```typescript
describe("getSellerOrdersFulfilled", () => {
  it("should count distinct completed orders", async () => {
    // Test: COUNT(DISTINCT o.id) from orders
    // Test: Joins through order_items → products → stores
    // Test: Filters by seller's owner_id
    // Test: Only counts orders with status 'completed'
    // Test: Handles same order with multiple items correctly
  });

  it("should return 0 when no completed orders", async () => {
    // Test: Returns 0 when all orders are pending
  });
});
```

### 2.4 Get Seller Products Count
**File**: `src/__tests__/application/dashboard/seller/getSellerDashboardData.test.ts`

```typescript
describe("getSellerProductsCount", () => {
  it("should count products from seller's stores", async () => {
    // Test: COUNT(*) from products where store_id IN (seller_stores)
    // Test: Handles seller with multiple stores
    // Test: Returns correct total product count
    // Test: Returns 0 when no products
  });
});
```

### 2.5 Get Seller Low Stock Products
**File**: `src/__tests__/application/dashboard/seller/getSellerDashboardData.test.ts`

```typescript
describe("getSellerLowStockProducts", () => {
  it("should return products with stock < 10", async () => {
    // Test: Filters products where stock < 10
    // Test: Orders by stock ASC (lowest first)
    // Test: Returns product details (id, name, stock, category)
    // Test: Only includes products from seller's stores
  });

  it("should handle threshold edge cases", async () => {
    // Test: stock = 9 is included
    // Test: stock = 10 is excluded
    // Test: stock = 0 is included
    // Test: stock = null is handled gracefully
  });

  it("should return empty array when no low stock", async () => {
    // Test: Returns [] when all products have stock >= 10
  });
});
```

### 2.6 Get Seller Dashboard Data (Aggregated)
**File**: `src/__tests__/application/dashboard/seller/getSellerDashboardData.test.ts`

```typescript
describe("getSellerDashboardData", () => {
  it("should aggregate all seller metrics", async () => {
    // Test: Returns object with all summary card data
    // Test: Includes revenue (7d/30d), orders fulfilled, products listed, low stock count
    // Test: Formats currency values correctly
    // Test: Includes low stock products array
  });

  it("should handle caching correctly", async () => {
    // Test: Uses Next.js unstable_cache with correct key
    // Test: Cache key includes userId
    // Test: Revalidation set to 60 seconds
  });

  it("should handle seller with no stores", async () => {
    // Test: Returns valid structure when seller has no stores
    // Test: All metrics are 0 or empty
    // Test: Doesn't crash on missing store data
  });
});
```

---

## 3. Dashboard Page Component Tests

### 3.1 Dashboard Page Role Rendering
**File**: `src/__tests__/app/dashboard/page.test.tsx`

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/[locale]/dashboard/page";
import { createClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server");
jest.mock("@/components/Navbar");
jest.mock("@/components/Footer");
jest.mock("@/components/dashboard/buyer/BuyerDashboard");
jest.mock("@/components/dashboard/seller/SellerDashboard");

describe("DashboardPage", () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should redirect to login when user is not authenticated", async () => {
    // Arrange
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    // Act & Assert
    // Test redirect behavior (requires Next.js router mock)
  });

  it("should render BuyerDashboard when role is buyer", async () => {
    // Arrange
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId, email: "buyer@test.com" } },
    });

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockMaybeSingle = jest.fn().mockResolvedValue({
      data: { name: "Buyer User", role: "buyer" },
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });

    // Act
    const component = await DashboardPage();
    render(component);

    // Assert
    // Test BuyerDashboard component is rendered
    // Test userId prop is passed correctly
  });

  it("should render SellerDashboard when role is seller", async () => {
    // Test similar to buyer but with seller role
  });

  it("should fallback to buyer role when role not found", async () => {
    // Test: When profile.role is null/undefined
    // Test: Falls back to user_metadata.role
    // Test: Falls back to app_metadata.role
    // Test: Defaults to "buyer" if all fail
  });

  it("should extract firstName from greetingName correctly", async () => {
    // Test: firstName = first word of name
    // Test: Handles single name (no spaces)
    // Test: Falls back to email when name not available
    // Test: Falls back to "there" when nothing available
  });
});
```

---

## 4. Buyer Dashboard Component Tests

### 4.1 BuyerDashboard Component
**File**: `src/components/dashboard/__tests__/buyer/BuyerDashboard.test.tsx`

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import BuyerDashboard from "@/components/dashboard/buyer/BuyerDashboard";
import { getBuyerDashboardData } from "@/application/dashboard/buyer/getBuyerDashboardData";

jest.mock("@/application/dashboard/buyer/getBuyerDashboardData");

describe("BuyerDashboard", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
  const mockDashboardData = {
    summaryCards: [
      { id: "orders-placed", title: "Orders placed", value: "5", changeLabel: "+2", trend: "up" },
      { id: "total-spent", title: "Total spent", value: "$450.00", changeLabel: "+10%", trend: "up" },
    ],
    recentOrders: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getBuyerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);
  });

  it("should render loading state initially", async () => {
    // Test: Shows skeleton loader while data loads
    // Test: Loading state is accessible
  });

  it("should display summary cards with real data", async () => {
    // Arrange
    render(<BuyerDashboard userId={mockUserId} />);

    // Act
    await waitFor(() => {
      expect(screen.getByText("Orders placed")).toBeInTheDocument();
    });

    // Assert
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("$450.00")).toBeInTheDocument();
  });

  it("should display empty state when no orders", async () => {
    // Arrange
    const emptyData = {
      summaryCards: [
        { id: "orders-placed", title: "Orders placed", value: "0", changeLabel: "0", trend: "up" },
      ],
      recentOrders: [],
    };
    (getBuyerDashboardData as jest.Mock).mockResolvedValue(emptyData);

    // Act
    render(<BuyerDashboard userId={mockUserId} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
    });
  });

  it("should handle errors gracefully", async () => {
    // Arrange
    (getBuyerDashboardData as jest.Mock).mockRejectedValue(new Error("Database error"));

    // Act
    render(<BuyerDashboard userId={mockUserId} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
    });
  });

  it("should display order history section", async () => {
    // Test: BuyerOrderHistory component is rendered
    // Test: Recent orders are displayed
  });
});
```

---

## 5. Seller Dashboard Component Tests

### 5.1 SellerDashboard Component
**File**: `src/components/dashboard/__tests__/seller/SellerDashboard.test.tsx`

```typescript
describe("SellerDashboard", () => {
  it("should render summary cards with real data", async () => {
    // Test: Revenue (7 days) card displays
    // Test: Orders fulfilled count displays
    // Test: Products listed count displays
    // Test: Low stock alerts count displays
  });

  it("should display low stock alerts section", async () => {
    // Test: SellerLowStockAlerts component is rendered
    // Test: Low stock products are listed
    // Test: Products sorted by stock (lowest first)
  });

  it("should display order management section", async () => {
    // Test: SellerOrderList component is rendered
    // Test: Pending orders are displayed
  });

  it("should handle seller with no stores", async () => {
    // Test: Shows empty state message
    // Test: All metrics show 0
  });

  it("should handle errors gracefully", async () => {
    // Test: Shows error message when data fetch fails
  });
});
```

### 5.2 SellerOrderList Component
**File**: `src/components/dashboard/__tests__/seller/SellerOrderList.test.tsx`

```typescript
describe("SellerOrderList", () => {
  it("should display pending orders", async () => {
    // Test: Orders from seller's products are listed
    // Test: Shows order status, date, buyer info
    // Test: Shows product details for each order
    // Test: Orders sorted by most recent first
  });

  it("should handle empty orders list", async () => {
    // Test: Shows "No pending orders" message
  });

  it("should filter orders correctly", async () => {
    // Test: Only shows orders for seller's products
    // Test: Excludes orders for other sellers' products
  });
});
```

### 5.3 SellerLowStockAlerts Component
**File**: `src/components/dashboard/__tests__/seller/SellerLowStockAlerts.test.tsx`

```typescript
describe("SellerLowStockAlerts", () => {
  it("should display low stock products", async () => {
    // Test: Products with stock < 10 are listed
    // Test: Shows product name, current stock, category
    // Test: Products sorted by stock ascending
    // Test: Shows urgency indicator (color coding)
  });

  it("should handle empty alerts", async () => {
    // Test: Shows "All products well stocked" message
  });

  it("should highlight critical stock levels", async () => {
    // Test: stock = 0 shows as critical (red)
    // Test: stock 1-3 shows as warning (yellow)
    // Test: stock 4-9 shows as low (orange)
  });
});
```

---

## 6. Edge Cases & Error Scenarios

### 6.1 Database Connection Failures
```typescript
describe("Database Error Handling", () => {
  it("should handle Supabase connection timeout", async () => {
    // Test: Query times out after 30s
    // Test: Shows appropriate error message
    // Test: Doesn't crash application
  });

  it("should handle RLS policy violations", async () => {
    // Test: When RLS blocks query
    // Test: Shows user-friendly error
    // Test: Logs error server-side
  });

  it("should handle malformed database responses", async () => {
    // Test: Database returns unexpected format
    // Test: Handles null/undefined gracefully
    // Test: Validates response structure
  });
});
```

### 6.2 Missing Data Scenarios
```typescript
describe("Missing Data Handling", () => {
  it("should handle buyer with no profile", async () => {
    // Test: user exists but profile doesn't
    // Test: Falls back to user_metadata
    // Test: Defaults role to "buyer"
  });

  it("should handle seller with no stores", async () => {
    // Test: Seller role but no stores created
    // Test: Shows empty state message
    // Test: All metrics show 0
  });

  it("should handle null/undefined userId", async () => {
    // Test: userId is null
    // Test: userId is undefined
    // Test: userId is empty string
    // Test: Shows error message
  });
});
```

### 6.3 Role Switching Scenarios
```typescript
describe("Role Switching", () => {
  it("should handle role change mid-session", async () => {
    // Test: User role changes in database
    // Test: Dashboard updates after cache expiry
    // Test: Correct dashboard renders
  });

  it("should handle invalid role values", async () => {
    // Test: role is "invalid_role"
    // Test: Falls back to default role
  });
});
```

### 6.4 Caching Edge Cases
```typescript
describe("Caching Behavior", () => {
  it("should cache data correctly per userId", async () => {
    // Test: Different users get separate cache entries
    // Test: Cache key includes userId
  });

  it("should revalidate cache after 60s", async () => {
    // Test: Cache expires after 60s
    // Test: Fresh data fetched on next request
    // Test: Uses stale-while-revalidate pattern
  });

  it("should handle cache invalidation", async () => {
    // Test: Manual cache invalidation works
    // Test: Cache tags work correctly
  });
});
```

---

## 7. Performance Tests

### 7.1 Load Time Tests
```typescript
describe("Performance", () => {
  it("should load dashboard in < 2 seconds", async () => {
    // E2E Test: Measure time from page load to content display
    // Test: Initial load < 2s
    // Test: Subsequent loads < 1s (cached)
  });

  it("should fetch data in parallel where possible", async () => {
    // Test: Multiple queries run concurrently (Promise.all)
    // Test: Total time < sum of individual query times
  });
});
```

### 7.2 Database Query Optimization
```typescript
describe("Query Optimization", () => {
  it("should use database indexes correctly", async () => {
    // Test: Queries use indexed columns (buyer_id, owner_id, store_id)
    // Test: No full table scans
  });

  it("should limit query results appropriately", async () => {
    // Test: Recent orders limited to 10
    // Test: Low stock products limited to 20
  });
});
```

---

## 8. Integration Tests

### 8.1 Data Service Integration
```typescript
describe("Data Service Integration", () => {
  it("should work with real Supabase client", async () => {
    // Integration test with test database
    // Test: Real queries work correctly
    // Test: RLS policies allow access
  });

  it("should handle concurrent requests", async () => {
    // Test: Multiple dashboard loads simultaneously
    // Test: Cache prevents duplicate queries
  });
});
```

### 8.2 Component Integration
```typescript
describe("Component Integration", () => {
  it("should integrate BuyerDashboard with SummaryCards", async () => {
    // Test: SummaryCards receives correct data format
    // Test: Cards display correctly
  });

  it("should integrate SellerDashboard with charts", async () => {
    // Test: Charts receive mock data correctly
    // Test: Charts render without errors
  });
});
```

---

## 9. E2E Tests (Playwright)

### 9.1 Buyer Dashboard E2E
**File**: `e2e/dashboard.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Buyer Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer user
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "buyer@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/en/dashboard");
  });

  test("should display buyer dashboard with real data", async ({ page }) => {
    // Verify: Buyer-specific dashboard renders
    // Verify: Summary cards show real order data
    // Verify: Order history section displays
    // Verify: Page loads in < 2 seconds
  });

  test("should show empty state when buyer has no orders", async ({ page }) => {
    // Setup: Use buyer with no orders
    // Verify: Empty state message displays
    // Verify: All counts show 0
  });

  test("should navigate to order details", async ({ page }) => {
    // Verify: Click on order navigates to details
    // Verify: Order information is correct
  });
});
```

### 9.2 Seller Dashboard E2E
**File**: `e2e/dashboard.spec.ts`

```typescript
test.describe("Seller Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller user
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "seller@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/en/dashboard");
  });

  test("should display seller dashboard with real data", async ({ page }) => {
    // Verify: Seller-specific dashboard renders
    // Verify: Summary cards show real revenue/inventory data
    // Verify: Low stock alerts display
    // Verify: Pending orders list displays
    // Verify: Page loads in < 2 seconds
  });

  test("should show low stock alerts correctly", async ({ page }) => {
    // Verify: Products with stock < 10 are listed
    // Verify: Products sorted by stock (lowest first)
    // Verify: Stock counts are accurate
  });

  test("should show pending orders for seller's products", async ({ page }) => {
    // Verify: Only orders for seller's products are shown
    // Verify: Order details are correct
  });
});
```

### 9.3 Performance E2E
```typescript
test.describe("Dashboard Performance", () => {
  test("should load dashboard in < 2 seconds", async ({ page }) => {
    // Measure: Time from navigation to content display
    // Assert: loadTime < 2000ms
  });

  test("should cache data correctly", async ({ page }) => {
    // Verify: First load fetches from database
    // Verify: Second load uses cache (faster)
    // Verify: Data updates after cache expiry
  });
});
```

### 9.4 Accessibility E2E
```typescript
test.describe("Dashboard Accessibility", () => {
  test("should be keyboard navigable", async ({ page }) => {
    // Verify: All interactive elements accessible via keyboard
    // Verify: Focus indicators visible
    // Verify: Tab order is logical
  });

  test("should have proper ARIA labels", async ({ page }) => {
    // Verify: Summary cards have aria-labels
    // Verify: Charts have accessible descriptions
    // Verify: Loading states announced to screen readers
  });
});
```

---

## 10. Type Safety Tests

### 10.1 TypeScript Type Validation
```typescript
describe("Type Safety", () => {
  it("should enforce DashboardRole type", () => {
    // Test: Only "buyer" | "seller" | "admin" allowed
    // Test: TypeScript errors on invalid roles
  });

  it("should enforce SummaryCard type structure", () => {
    // Test: SummaryCard requires all required fields
    // Test: TypeScript errors on missing fields
  });

  it("should enforce userId as UUID string", () => {
    // Test: userId must be valid UUID string
    // Test: TypeScript errors on invalid types
  });
});
```

---

## Test Execution Strategy

### Unit Tests
- **Run**: `npm test` or `npm run test:watch`
- **Files**: All `*.test.ts` and `*.test.tsx` files
- **Coverage**: Aim for >80% coverage on data services

### Component Tests
- **Run**: `npm test -- --testPathPattern=components`
- **Files**: Component test files in `__tests__/components/`
- **Mocking**: Mock data services, use React Testing Library

### E2E Tests
- **Run**: `npm run e2e` or `npm run e2e:headed`
- **Files**: `e2e/dashboard.spec.ts`
- **Browsers**: Chromium, Firefox, WebKit

### Test Data
- **Unit tests**: Mock Supabase client responses
- **Integration tests**: Use test database with seed data
- **E2E tests**: Use test accounts with known data

---

## Notes

- All tests follow TDD: Write test first, then implement, then verify
- Mock Supabase client for unit tests, use real client for integration
- Test both success and error paths
- Cover edge cases: null values, empty arrays, database errors
- Verify caching behavior separately
- Test performance requirements (< 2s load time) in E2E tests
- Ensure accessibility in E2E tests (keyboard navigation, ARIA labels)

