# Hexagonal Backend Architect Agent - Update Summary

**Date:** December 3, 2025  
**Project:** The Secret Caps Society  
**Purpose:** Adapted hexagonal architecture agent for Next.js 15 + Supabase marketplace platform

---

## Overview of Changes

The `hexagonal-backend-architect.md` agent has been completely updated from a generic Vue 3 template to a **project-specific, Next.js 15-focused** architecture guide tailored for The Secret Caps Society marketplace.

---

## Major Changes

### 1. **Framework Migration: Vue 3 → Next.js 15**

**Before:** Focused on Vue 3 composables, Vue Router, and reactive state management  
**After:** Focused on Next.js App Router, API route handlers, and server-side patterns

#### Key Adaptations:
- Removed Vue-specific patterns (composables, `provide/inject`, reactive refs)
- Added Next.js API route patterns with proper request/response handling
- Integrated Supabase SSR client patterns (`@/lib/supabase/server`)
- Adapted dependency injection to Next.js serverless architecture

### 2. **Project Context Integration**

**Added:**
- Project description: "The Secret Caps Society" marketplace for baseball cap resellers
- User roles: Buyers, Sellers, Admins
- Core entities: Products, Stores, Orders, Payments, Users
- Database schema alignment with existing PostgreSQL tables

**Example entities updated:**
- Generic `Product` → Cap-specific `Product` with store associations
- Added `Store` entity with verification workflow
- Added `Address` value object for US addresses

### 3. **Architecture Layers Restructured**

**Updated diagram:**
```
Presentation Layer (Vue Components) 
→ Presentation Layer (Next.js App Router + React Components)

No API Layer
→ API Layer (Next.js API Route Handlers - NEW)

Application Layer (Use Cases)
→ Application Layer (Services)

Infrastructure Layer (Supabase Adapters)
→ Infrastructure Layer (Supabase + PostgreSQL Adapters)
```

### 4. **Domain Layer Updates**

#### Entities:
- **Product Entity**: Aligned with actual database schema
  - `sellerId` → `storeId` (matches database foreign key)
  - Added `stock`, `category`, `isFeatured` fields
  - Business methods: `incrementStock()`, `decrementStock()`, `markAsFeatured()`

- **Store Entity** (NEW): 
  - Complete business verification workflow
  - Methods: `approve()`, `reject()`, `incrementProductCount()`
  - Reflects actual database columns

#### Value Objects:
- Enhanced `Money` with currency rounding
- Added `Address` value object with US ZIP validation

### 5. **Application Layer Transformation**

**Before:** Use Case classes with Result types  
**After:** Service classes with direct error throwing

#### Pattern Change:
```typescript
// Old Pattern (Vue-style)
class CreateProductUseCase {
  async execute(dto): Promise<CreateProductResult> {
    return { success: true, product };
  }
}

// New Pattern (Next.js-style)
class ProductService {
  async createProduct(dto): Promise<Product> {
    // Throws errors directly
    return product;
  }
}
```

**Rationale:** Next.js API routes handle error responses, so services can throw errors directly instead of wrapping in Result types.

### 6. **Repository Interfaces**

Aligned with project's existing structure:
- Moved from `@/application/ports/repositories/` to `@/domain/*/repositories/`
- Updated interfaces to match actual Supabase queries
- Added project-specific filters (e.g., `verificationStatus` for stores)

Example:
```typescript
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByStore(storeId: string): Promise<Product[]>;
  findFeatured(): Promise<Product[]>;
  // ... matches actual usage
}
```

### 7. **Infrastructure Layer Overhaul**

#### Supabase Repository Implementation:
- **Database Mapping**: Explicit `toDomain()` and `toPersistence()` methods
  - Converts snake_case (database) ↔ camelCase (domain)
  - Example: `store_id` ↔ `storeId`, `is_featured` ↔ `isFeatured`
  
- **Updated for Next.js**:
  ```typescript
  // Uses Supabase SSR client
  const supabase = await createClient();
  ```

- **Added Store Repository**: Complete implementation for store management

#### Auth Service:
- Simplified from complex Result types to direct async/await
- Integrated user metadata for roles (`buyer`, `seller`, `admin`)
- Aligned with actual Supabase auth patterns in the project

### 8. **Dependency Injection Redesign**

**Before:** Vue-style container with `provide/inject`  
**After:** Factory pattern for Next.js API routes

```typescript
// Old: Container-based DI
const container = setupContainer();
const service = container.resolve('ProductService');

// New: Factory-based DI
export class ServiceFactory {
  static async createProductService(): Promise<ProductService> {
    const supabase = await createClient();
    const repository = new SupabaseProductRepository(supabase);
    return new ProductService(repository);
  }
}

// Usage in API routes
const productService = await createProductService();
```

**Benefits:**
- Works with Next.js serverless functions
- Each request gets fresh instances
- No global state or singleton issues

### 9. **Next.js API Routes Integration (NEW)**

Added comprehensive examples for:

#### Seller Product Management:
- `GET /api/seller/products` - List products for authenticated seller
- `POST /api/seller/products` - Create new product
- `PATCH /api/seller/products/[id]` - Update product
- `DELETE /api/seller/products/[id]` - Delete product

#### Admin Store Approval:
- `POST /api/admin/stores/[id]/approve` - Approve pending store

#### Key Patterns Demonstrated:
1. **Authentication**: Using Supabase server client
   ```typescript
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   ```

2. **Authorization**: Owner/role verification
   ```typescript
   const { data: store } = await supabase
     .from('stores')
     .select('owner_id')
     .eq('id', storeId)
     .eq('owner_id', user.id);
   ```

3. **Service Usage**: Clean business logic separation
   ```typescript
   const productService = await createProductService();
   const product = await productService.createProduct(dto);
   ```

4. **Error Handling**: Domain errors → HTTP status codes
   ```typescript
   try {
     await service.method();
   } catch (error) {
     if (error instanceof Error) {
       return NextResponse.json({ error: error.message }, { status: 400 });
     }
   }
   ```

### 10. **Testing Strategy Updates**

Updated from Vue-focused tests to Next.js patterns:

#### Service Tests (Unit):
```typescript
describe('ProductService', () => {
  let mockRepository: IProductRepository;
  let service: ProductService;
  
  beforeEach(() => {
    mockRepository = { /* mocked methods */ };
    service = new ProductService(mockRepository);
  });
});
```

#### Domain Entity Tests:
```typescript
describe('Product Entity', () => {
  it('should decrement stock', () => {
    product.decrementStock(3);
    expect(product.stock).toBe(7);
  });
});
```

#### API Route Tests (Integration):
```typescript
describe('POST /api/seller/products', () => {
  it('should return 401 for unauthenticated request');
  it('should create product successfully');
});
```

### 11. **Best Practices Updated**

Added Next.js-specific guidelines:
- **Supabase Client**: Always use server-side client in API routes
- **Database Mapping**: Separate database DTOs from domain entities
- **Authentication in Routes**: Handle auth in route handlers, not services
- **Error Handling**: Throw from services, catch and map in routes
- **Type Safety**: TypeScript strict mode for all contracts

### 12. **Project Structure Guide**

Added specific folder structure for The Secret Caps Society:

```
src/
├── domain/                    # Pure TypeScript, no framework deps
│   ├── entities/             # Product, Store, Order
│   ├── value-objects/        # Email, Money, Address
│   ├── products/repositories/
│   ├── stores/repositories/
│   └── auth/services/
├── application/              # Business logic services
│   ├── products/            
│   ├── stores/              
│   └── dashboard/           
├── infrastructure/          
│   ├── repositories/        # Supabase implementations
│   ├── services/            # SupabaseAuthService
│   └── factories/           # ServiceFactory
├── app/api/                 # Next.js API routes
│   ├── seller/             
│   ├── admin/              
│   └── auth/               
└── lib/supabase/           # Supabase client setup
```

---

## What Stayed the Same

✅ **Core Hexagonal Architecture Principles:**
- Domain independence
- Ports and Adapters pattern
- Dependency inversion
- Repository pattern
- Clean separation of concerns

✅ **SOLID Principles**
✅ **Domain-Driven Design concepts**
✅ **Testability focus**

---

## Usage Examples for The Secret Caps Society

### Creating a New Feature: Order Processing

Following the updated agent guidelines:

1. **Define Domain Entity:**
   ```typescript
   // src/domain/entities/Order.ts
   export class Order {
     // Domain rules for order processing
   }
   ```

2. **Create Repository Interface:**
   ```typescript
   // src/domain/orders/repositories/IOrderRepository.ts
   export interface IOrderRepository {
     findById(id: string): Promise<Order | null>;
     save(order: Order): Promise<Order>;
   }
   ```

3. **Implement Repository:**
   ```typescript
   // src/infrastructure/repositories/SupabaseOrderRepository.ts
   export class SupabaseOrderRepository implements IOrderRepository {
     private toDomain(raw: any): Order { /* mapping */ }
     private toPersistence(order: Order): any { /* mapping */ }
   }
   ```

4. **Create Service:**
   ```typescript
   // src/application/orders/orderService.ts
   export class OrderService {
     constructor(private repo: IOrderRepository) {}
     
     async createOrder(dto: CreateOrderDTO): Promise<Order> {
       // Business logic
     }
   }
   ```

5. **Add to Factory:**
   ```typescript
   // src/infrastructure/factories/ServiceFactory.ts
   static async createOrderService(): Promise<OrderService> {
     const supabase = await createClient();
     const repo = new SupabaseOrderRepository(supabase);
     return new OrderService(repo);
   }
   ```

6. **Create API Route:**
   ```typescript
   // src/app/api/buyer/orders/route.ts
   export async function POST(request: NextRequest) {
     const supabase = await createClient();
     const { data: { user } } = await supabase.auth.getUser();
     // Auth & validation
     
     const orderService = await createOrderService();
     const order = await orderService.createOrder(dto);
     
     return NextResponse.json({ order });
   }
   ```

---

## Benefits of the Updated Agent

### For The Secret Caps Society Project:

1. **Aligned with Tech Stack**: Next.js 15, React 19, Supabase patterns
2. **Matches Existing Code**: Follows patterns already in the codebase
3. **Database Schema Aware**: Entities match actual PostgreSQL tables
4. **Role-Based Access**: Examples for buyer/seller/admin flows
5. **Marketplace-Specific**: Cap products, store verification, orders

### For Development:

1. **Clear Separation**: API routes → Services → Repositories → Entities
2. **Testable**: Mock repositories, test services independently
3. **Maintainable**: Business logic in domain, infrastructure swappable
4. **Type-Safe**: TypeScript interfaces for all contracts
5. **Scalable**: Add new features following same pattern

### For Team Onboarding:

1. **Complete Examples**: Real code for products, stores, authentication
2. **Best Practices**: Next.js + Supabase specific guidelines
3. **Testing Strategy**: Unit, integration, and e2e test examples
4. **Folder Structure**: Clear organization matching project structure

---

## Migration Path for Existing Code

If refactoring existing tightly-coupled code:

### Before (Direct Supabase in API Route):
```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data } = await supabase
    .from('products')
    .insert({ ...body })
    .select()
    .single();
    
  return NextResponse.json({ data });
}
```

### After (Clean Architecture):
```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  
  const body = await request.json();
  
  const productService = await createProductService();
  const product = await productService.createProduct({
    storeId: body.storeId,
    name: body.name,
    price: body.price,
    stock: body.stock,
    // ... domain DTO
  });
  
  return NextResponse.json({ product });
}
```

**Benefits:**
- ✅ Business logic (validation) in service
- ✅ Domain rules enforced by entity
- ✅ Testable without Supabase
- ✅ Database mapping centralized
- ✅ Service reusable across multiple routes

---

## Conclusion

The updated `hexagonal-backend-architect.md` agent is now a **comprehensive, project-specific guide** for implementing clean architecture in The Secret Caps Society marketplace. It provides:

- ✅ Real examples from the actual domain (caps, stores, orders)
- ✅ Next.js 15 and Supabase SSR patterns
- ✅ Complete workflow from entity to API route
- ✅ Testing strategies for all layers
- ✅ Best practices for marketplace development

Use this agent when implementing new features, refactoring existing code, or reviewing architecture decisions to maintain clean, testable, and maintainable backend code.

---

**Generated:** December 3, 2025  
**Agent Version:** 2.0 (Next.js 15 + Supabase Edition)  
**Project:** The Secret Caps Society

