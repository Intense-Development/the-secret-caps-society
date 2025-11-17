# Quick Fix Guide - DATABASE_ERROR

If you're still getting `DATABASE_ERROR: Failed to create user profile`, follow these steps in order:

## Step 1: Check Environment Variables

**Open your terminal and check:**

```bash
cd .trees/feature-issue-001
cat .env.local
```

**You should see:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If file doesn't exist or is empty:**
```bash
cp env.example .env.local
# Edit .env.local with your actual Supabase credentials
# Then restart dev server
```

## Step 2: Verify Supabase Project Setup

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy your:
   - Project URL
   - anon/public key

## Step 3: Run Database Migration

**Option A: Supabase SQL Editor (RECOMMENDED)**

1. Open Supabase Dashboard → **SQL Editor**
2. Click "New query"
3. Copy ALL contents of: `src/infrastructure/database/migrations/002_complete_schema.sql`
4. Paste into editor
5. Click "Run"
6. Wait for completion (should see "Success" message)

**Option B: Check if already run**

Run this in SQL Editor:
```sql
-- Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as users_exists;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';
```

## Step 4: Run Diagnostics

In Supabase SQL Editor, run:

```sql
-- Quick check for registration requirements
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
        AND cmd = 'INSERT'
        AND 'anon' = ANY(roles)
    )
    THEN '✅ Registration policy exists'
    ELSE '❌ MISSING - Need to run migration!'
  END AS status;
```

**If you see ❌:**
- You need to run the migration (Step 3)

**If you see ✅:**
- Policies exist, issue is elsewhere (see Step 5)

## Step 5: Manual RLS Fix (If migration can't run)

If you can't run the full migration, apply just the critical policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow registration
CREATE POLICY "Allow user registration"
ON users
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow store creation during registration"
ON stores
FOR INSERT
TO anon
WITH CHECK (true);
```

## Step 6: Restart Dev Server

**CRITICAL - Must do this after any env changes:**

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 7: Test Again

1. Visit: http://localhost:3000/register
2. Try buyer registration
3. Check browser console for detailed error

## Common Issues

### Issue: "Project URL and API key required"
**Fix:** Environment variables not set
```bash
# Make sure .env.local exists
ls -la .env.local
# Restart dev server after creating it
```

### Issue: "Table does not exist"
**Fix:** Migration not run
- Run migration in Supabase SQL Editor

### Issue: "Permission denied"
**Fix:** RLS policies missing
- Run Step 5 manual fix

### Issue: Still failing after all steps
**Fix:** Get detailed error
- Open browser DevTools → Network tab
- Try registration
- Click on the failed request
- Copy the full error response
- Share it for further diagnosis

## Quick Test Commands

Run these in Supabase SQL Editor:

```sql
-- 1. Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'stores');

-- 2. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'stores');

-- 3. Check policies
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('users', 'stores');

-- 4. Try manual insert (as test)
INSERT INTO users (id, name, email, role)
VALUES (
  gen_random_uuid(),
  'Test User',
  'test@example.com',
  'buyer'
);
-- This should work after RLS policies are applied
```

## Need More Help?

Share the following:

1. **Environment check:**
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo "Key length: ${#NEXT_PUBLIC_SUPABASE_ANON_KEY}"
   ```

2. **Table check output** (from Quick Test Commands above)

3. **Full error from browser:**
   - Open DevTools → Console
   - Look for red errors
   - Copy full error message

4. **Network request details:**
   - DevTools → Network
   - Find the `/api/auth/register/buyer` request
   - Click it → Response tab
   - Copy the response

