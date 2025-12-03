# Hexagonal Architecture - Quick Reference Guide

> Fast reference for implementing features in The Secret Caps Society using clean architecture

---

## 🚀 Quick Start: Add New Feature in 6 Steps

### Example: Implementing "Product Reviews"

#### 1. **Domain Entity** (`src/domain/entities/Review.ts`)

```typescript
export interface ReviewProps {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export class Review {
  private constructor(private readonly props: ReviewProps) {}
  
  static create(props: Omit<ReviewProps, 'id' | 'createdAt'>): Review {
    if (props.rating < 1 || props.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return new Review({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }
  
  get rating(): number { return this.props.rating; }
  // ... other getters
}
```

#### 2. **Repository Interface** (`src/domain/reviews/repositories/IReviewRepository.ts`)

```typescript
import { Review } from '@/domain/entities/Review';

export interface IReviewRepository {
  findByProduct(productId: string): Promise<Review[]>;
  save(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
}
```

#### 3. **Supabase Adapter** (`src/infrastructure/repositories/SupabaseReviewRepository.ts`)

```typescript
import { IReviewRepository } from '@/domain/reviews/repositories/IReviewRepository';
import { Review } from '@/domain/entities/Review';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseReviewRepository implements IReviewRepository {
  constructor(private readonly supabase: SupabaseClient) {}
  
  async findByProduct(productId: string): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId);
      
    if (error || !data) return [];
    return data.map(this.toDomain);
  }
  
  async save(review: Review): Promise<Review> {
    const { data, error } = await this.supabase
      .from('reviews')
      .insert([this.toPersistence(review)])
      .select()
      .single();
      
    if (error) throw new Error(`Failed to save review: ${error.message}`);
    return this.toDomain(data);
  }
  
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(`Failed to delete review: ${error.message}`);
  }
  
  private toDomain(raw: any): Review {
    return Review.fromPersistence({
      id: raw.id,
      productId: raw.product_id,
      userId: raw.user_id,
      rating: raw.rating,
      comment: raw.comment,
      createdAt: new Date(raw.created_at),
    });
  }
  
  private toPersistence(review: Review): any {
    const props = review.toJSON();
    return {
      id: props.id,
      product_id: props.productId,
      user_id: props.userId,
      rating: props.rating,
      comment: props.comment,
      created_at: props.createdAt.toISOString(),
    };
  }
}
```

#### 4. **Application Service** (`src/application/reviews/reviewService.ts`)

```typescript
import { Review } from '@/domain/entities/Review';
import { IReviewRepository } from '@/domain/reviews/repositories/IReviewRepository';

export interface CreateReviewDTO {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}

export class ReviewService {
  constructor(private readonly reviewRepository: IReviewRepository) {}
  
  async createReview(dto: CreateReviewDTO): Promise<Review> {
    // Validate
    if (!dto.comment || dto.comment.trim().length === 0) {
      throw new Error('Review comment is required');
    }
    
    // Create domain entity (includes business rules)
    const review = Review.create({
      productId: dto.productId,
      userId: dto.userId,
      rating: dto.rating,
      comment: dto.comment.trim(),
    });
    
    // Persist
    return await this.reviewRepository.save(review);
  }
  
  async getProductReviews(productId: string): Promise<Review[]> {
    return await this.reviewRepository.findByProduct(productId);
  }
  
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    // TODO: Add authorization check
    await this.reviewRepository.delete(reviewId);
  }
}
```

#### 5. **Service Factory** (`src/infrastructure/factories/ServiceFactory.ts`)

```typescript
// Add to existing ServiceFactory class

static async createReviewService(): Promise<ReviewService> {
  const supabase = await createClient();
  const reviewRepository = new SupabaseReviewRepository(supabase);
  return new ReviewService(reviewRepository);
}

// Helper function
export async function createReviewService(): Promise<ReviewService> {
  return ServiceFactory.createReviewService();
}
```

#### 6. **API Routes** (`src/app/api/reviews/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createReviewService } from '@/infrastructure/factories/ServiceFactory';

/**
 * POST /api/reviews
 * Create a new product review
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Parse request
    const body = await request.json();
    const { productId, rating, comment } = body;
    
    if (!productId || rating === undefined || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, rating, comment' },
        { status: 400 }
      );
    }
    
    // 3. Use service
    const reviewService = await createReviewService();
    const review = await reviewService.createReview({
      productId,
      userId: user.id,
      rating,
      comment,
    });
    
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/reviews?productId=xxx
 * Get reviews for a product
 */
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'productId query parameter required' },
        { status: 400 }
      );
    }
    
    const reviewService = await createReviewService();
    const reviews = await reviewService.getProductReviews(productId);
    
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 📋 Checklist for New Features

- [ ] **Domain Entity** created with business rules
- [ ] **Repository Interface** defined in domain layer
- [ ] **Repository Implementation** with Supabase adapter
- [ ] **Application Service** with business logic
- [ ] **Service Factory** updated with new service
- [ ] **API Routes** with auth, validation, and service calls
- [ ] **Unit Tests** for entity and service
- [ ] **Integration Tests** for API routes
- [ ] **Database Migration** if new table needed

---

## 🎯 Common Patterns

### Pattern 1: Authenticated Endpoint

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of logic
}
```

### Pattern 2: Owner Authorization

```typescript
// Verify user owns the resource
const { data: resource } = await supabase
  .from('stores')
  .select('owner_id')
  .eq('id', resourceId)
  .eq('owner_id', user.id)
  .single();
  
if (!resource) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

### Pattern 3: Admin-Only Route

```typescript
const role = user.user_metadata?.role || user.app_metadata?.role;

if (role !== 'admin') {
  return NextResponse.json(
    { error: 'Forbidden: Admin access required' },
    { status: 403 }
  );
}
```

### Pattern 4: Error Handling

```typescript
try {
  const service = await createService();
  const result = await service.method(dto);
  return NextResponse.json({ result });
} catch (error) {
  console.error('Error:', error);
  
  // Domain/validation errors
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  // Unknown errors
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### Pattern 5: Database Mapping

```typescript
// Always separate database DTOs from domain entities

private toDomain(raw: any): Entity {
  return Entity.fromPersistence({
    id: raw.id,
    fieldName: raw.field_name,  // snake_case → camelCase
    createdAt: new Date(raw.created_at),
  });
}

private toPersistence(entity: Entity): any {
  const props = entity.toJSON();
  return {
    id: props.id,
    field_name: props.fieldName,  // camelCase → snake_case
    created_at: props.createdAt.toISOString(),
  };
}
```

---

## 🧪 Testing Quick Reference

### Test Domain Entity

```typescript
import { describe, it, expect } from 'vitest';
import { Entity } from '@/domain/entities/Entity';

describe('Entity', () => {
  it('should enforce business rules', () => {
    expect(() => Entity.create({ invalidData }))
      .toThrow('Business rule violation message');
  });
});
```

### Test Application Service

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Service } from '@/application/service';
import { IRepository } from '@/domain/repositories/IRepository';

describe('Service', () => {
  let mockRepo: IRepository;
  let service: Service;
  
  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      // ... other methods
    };
    service = new Service(mockRepo);
  });
  
  it('should call repository correctly', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(mockEntity);
    
    const result = await service.create(dto);
    
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Object));
    expect(result).toBeDefined();
  });
});
```

---

## 🚫 Common Anti-Patterns to Avoid

### ❌ DON'T: Put Supabase in Domain Layer

```typescript
// BAD - Domain depends on Supabase
export class Product {
  async save() {
    const supabase = createClient();  // ❌ NO!
    await supabase.from('products').insert(...);
  }
}
```

### ✅ DO: Keep Domain Pure

```typescript
// GOOD - Domain is pure TypeScript
export class Product {
  updatePrice(newPrice: number): void {
    if (newPrice <= 0) throw new Error('Invalid price');
    this.props.price = newPrice;
  }
}
```

### ❌ DON'T: Business Logic in API Routes

```typescript
// BAD - Business logic in route handler
export async function POST(request: NextRequest) {
  const { price, quantity } = await request.json();
  
  // ❌ Business logic here
  if (price <= 0) {
    return NextResponse.json({ error: 'Invalid price' });
  }
  
  const total = price * quantity;
  // ...
}
```

### ✅ DO: Business Logic in Service/Entity

```typescript
// GOOD - Business logic in service
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const service = await createService();
  const result = await service.method(body);  // ✅ Handles validation
  
  return NextResponse.json({ result });
}
```

### ❌ DON'T: Mixed Concerns in Service

```typescript
// BAD - Service knows about HTTP
export class ProductService {
  async create(request: NextRequest): Promise<NextResponse> {  // ❌
    const body = await request.json();
    return NextResponse.json({ ... });
  }
}
```

### ✅ DO: Service Uses Domain DTOs

```typescript
// GOOD - Service knows only business concepts
export class ProductService {
  async createProduct(dto: CreateProductDTO): Promise<Product> {  // ✅
    const product = Product.create(dto);
    return await this.repository.save(product);
  }
}
```

---

## 📁 File Locations Reference

| Layer | Location | Example |
|-------|----------|---------|
| Domain Entities | `src/domain/entities/` | `Product.ts`, `Store.ts` |
| Value Objects | `src/domain/value-objects/` | `Email.ts`, `Money.ts` |
| Repository Interfaces | `src/domain/*/repositories/` | `IProductRepository.ts` |
| Service Interfaces | `src/domain/*/services/` | `IAuthService.ts` |
| Application Services | `src/application/*/` | `productService.ts` |
| Repository Implementations | `src/infrastructure/repositories/` | `SupabaseProductRepository.ts` |
| Service Implementations | `src/infrastructure/services/` | `SupabaseAuthService.ts` |
| Service Factory | `src/infrastructure/factories/` | `ServiceFactory.ts` |
| API Routes | `src/app/api/` | `route.ts` |
| Supabase Setup | `src/lib/supabase/` | `client.ts`, `server.ts` |

---

## 💡 Pro Tips

1. **Start with the Entity**: Define business rules first
2. **Mock Repositories in Tests**: Never test against real database
3. **One Service Method = One Business Operation**
4. **Keep API Routes Thin**: Auth + Validation + Service Call
5. **Map at Repository Level**: Convert snake_case ↔ camelCase once
6. **Throw Errors in Services**: Catch and convert to HTTP in routes
7. **Use TypeScript Strict Mode**: Catch errors at compile time
8. **Document Service Methods**: Explain business logic intent

---

## 🔗 Related Documentation

- Full Guide: `.cursor/agents/hexagonal-backend-architect.md`
- Update Summary: `.cursor/agents/HEXAGONAL_ARCHITECT_UPDATE_SUMMARY.md`
- Database Schema: `src/infrastructure/database/migrations/`
- Existing Services: `src/application/`

---

**Version:** 1.0  
**Last Updated:** December 3, 2025  
**Project:** The Secret Caps Society

