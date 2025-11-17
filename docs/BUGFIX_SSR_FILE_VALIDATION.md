# Bug Fix: SSR File Validation Error

## Issue
**Error:** `ReferenceError: File is not defined`  
**Location:** `src/lib/validations/auth.ts:64`  
**Severity:** Critical - Blocked registration page from loading

## Root Cause
The `File` API is only available in browser environments, not in Node.js/server-side contexts. When Next.js performed Server-Side Rendering (SSR), it attempted to evaluate `z.instanceof(File)` which caused a ReferenceError.

## Solution Implemented
Created a custom Zod validator that gracefully handles both SSR and browser environments:

```typescript
const fileSchema = z.custom<File>((val) => {
  // Skip validation on server-side (File API not available in Node.js)
  if (typeof File === 'undefined') return true
  // Validate on client-side
  return val instanceof File
}, {
  message: 'Invalid file format',
})
```

## Changes Made
1. **Updated:** `src/lib/validations/auth.ts`
   - Replaced `z.instanceof(File)` with custom `fileSchema`
   - Maintains type safety while supporting SSR

2. **Updated:** `src/__tests__/validations/auth.test.ts`
   - Enhanced test coverage for verification schema
   - Added test for both file and URL scenarios

## Testing
- ✅ No linting errors
- ✅ Unit tests updated and passing
- ✅ SSR compatibility verified
- ✅ Type safety maintained

## Impact
- **Before:** Registration page returned HTTP 500 error
- **After:** Page loads successfully, file validation works client-side

## Prevention
When creating validation schemas that will be imported in SSR contexts:
- Avoid `z.instanceof()` for browser-only APIs
- Use `z.custom()` with environment checks
- Test SSR builds before deployment

---

**Fixed:** November 4, 2025  
**Status:** ✅ Resolved

