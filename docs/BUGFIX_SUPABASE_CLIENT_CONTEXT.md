# Bug Fix #2: Supabase Client Context Error

## Issue

**Error:** `@supabase/ssr: Your project's URL and API key are required to create a Supabase client!`  
**Location:** API routes using `authService.ts`  
**Severity:** Critical - All registration attempts failed

## Root Causes

### 1. Wrong Client Type in API Routes

API routes were using the **browser client** (`createBrowserClient`) instead of the **server client** (`createServerClient`).

**Problem Code:**

```typescript
// authService.ts (WRONG - used in API routes)
import { createClient } from "@/lib/supabase/client"; // Browser client!

export async function registerBuyer(data) {
  const supabase = createClient(); // ❌ Browser client in server context
  // ...
}
```

### 2. Architecture Confusion

The `authService.ts` was imported by both:

- ❌ Server-side API routes (incompatible with browser client)
- ✅ Client-side components (would work with browser client)

This caused a context mismatch.

### 3. Missing Environment Variables

Even with correct client, app needs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Solution Implemented

### 1. Removed Service Layer

**Deleted:** `src/lib/services/authService.ts`

**Reason:** Unnecessary abstraction that caused client/server confusion.

### 2. Moved Logic to API Routes

All authentication logic now lives directly in API routes where it belongs:

**Before:**

```typescript
// API route imports service (wrong client)
import { registerBuyer } from "@/lib/services/authService";
const result = await registerBuyer(data);
```

**After:**

```typescript
// API route uses server client directly
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient(); // ✅ Server client
  // ... business logic here
}
```

### 3. Updated All API Routes

**Modified files:**

1. `src/app/api/auth/register/buyer/route.ts`

   - Now uses server client
   - Contains full registration logic
   - Proper error handling and rollback

2. `src/app/api/auth/register/seller/route.ts`

   - Now uses server client
   - Handles user + store creation
   - Transaction-like rollback on errors

3. `src/app/api/auth/check-email/route.ts`
   - Now uses server client
   - Direct database query

### 4. Added Environment Setup

**Created:** `env.example`

- Template for required environment variables
- Clear instructions for setup
- Updated SETUP_GUIDE.md with warnings

## Changes Summary

### Files Modified

- ✅ `src/app/api/auth/register/buyer/route.ts` - Refactored with server client
- ✅ `src/app/api/auth/register/seller/route.ts` - Refactored with server client
- ✅ `src/app/api/auth/check-email/route.ts` - Refactored with server client
- ✅ `SETUP_GUIDE.md` - Enhanced environment setup instructions

### Files Deleted

- ❌ `src/lib/services/authService.ts` - Removed (caused confusion)

### Files Created

- ✅ `env.example` - Environment variables template

## Benefits

### 1. Clearer Architecture

- ✅ Client code uses `@/lib/supabase/client`
- ✅ Server code uses `@/lib/supabase/server`
- ✅ No ambiguity about which client to use

### 2. Simpler Code

- ✅ Fewer layers of abstraction
- ✅ Logic is where it's expected (in API routes)
- ✅ Easier to debug and maintain

### 3. Better Error Messages

- ✅ Server-side errors properly logged
- ✅ Client gets safe error messages
- ✅ No internal details leaked

## Testing

### Before Fix

```
❌ Registration page loads
❌ Form submission → 500 error
❌ Console: "File is not defined" (fixed in bugfix #1)
❌ Console: "API key required"
```

### After Fix (with env vars)

```
✅ Registration page loads
✅ Form validation works
✅ Buyer registration succeeds
✅ Seller registration succeeds
✅ Users created in Supabase Auth
✅ Records created in database
```

## Setup Requirements

### For Developers

1. **Must have** Supabase project created
2. **Must set** environment variables in `.env.local`
3. **Must run** database migrations
4. **Must restart** dev server after env setup

### Quick Setup

```bash
# 1. Copy environment template
cp env.example .env.local

# 2. Edit with your Supabase credentials
# (Get from https://supabase.com/dashboard)
nano .env.local

# 3. Restart dev server
npm run dev
```

## Prevention

### Best Practices

1. ✅ Never import browser client in API routes
2. ✅ Never import server client in client components
3. ✅ Keep API routes thin - they should handle I/O, not complex business logic
4. ✅ Document required environment variables
5. ✅ Provide example environment file in repo

### File Naming Convention

- `*.client.ts` - Browser-only code
- `*.server.ts` - Server-only code
- `*.ts` - Shared code (be careful!)

## Related Documentation

- `BUGFIX_SSR_FILE_VALIDATION.md` - Previous SSR issue
- `SETUP_GUIDE.md` - Complete setup instructions
- `QA_VALIDATION_REPORT.md` - Testing coverage

---

**Fixed:** November 4, 2025  
**Impact:** Critical functionality restored  
**Status:** ✅ Resolved & Tested
