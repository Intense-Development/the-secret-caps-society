-- =====================================================
-- DATABASE DIAGNOSTICS SCRIPT
-- The Secret Caps Society - Registration Flow
-- =====================================================
-- Run this script in Supabase SQL Editor to diagnose setup issues
-- It will check tables, RLS policies, and data integrity

\echo '==========================================';
\echo 'DATABASE DIAGNOSTICS FOR REGISTRATION FLOW';
\echo '==========================================';
\echo '';

-- =====================================================
-- 1. CHECK IF REQUIRED TABLES EXIST
-- =====================================================
\echo '1. CHECKING REQUIRED TABLES...';
\echo '-------------------------------------------';

SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN '✅ users table exists'
    ELSE '❌ users table MISSING - Run migration!'
  END AS users_table,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stores')
    THEN '✅ stores table exists'
    ELSE '❌ stores table MISSING - Run migration!'
  END AS stores_table,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')
    THEN '✅ products table exists'
    ELSE '❌ products table MISSING - Run migration!'
  END AS products_table,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders')
    THEN '✅ orders table exists'
    ELSE '❌ orders table MISSING - Run migration!'
  END AS orders_table,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items')
    THEN '✅ order_items table exists'
    ELSE '❌ order_items table MISSING - Run migration!'
  END AS order_items_table,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments')
    THEN '✅ payments table exists'
    ELSE '❌ payments table MISSING - Run migration!'
  END AS payments_table;

\echo '';

-- =====================================================
-- 2. CHECK USERS TABLE STRUCTURE
-- =====================================================
\echo '2. CHECKING USERS TABLE STRUCTURE...';
\echo '-------------------------------------------';

SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public'
ORDER BY ordinal_position;

\echo '';

-- =====================================================
-- 3. CHECK STORES TABLE STRUCTURE
-- =====================================================
\echo '3. CHECKING STORES TABLE STRUCTURE...';
\echo '-------------------------------------------';

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'stores'
  AND table_schema = 'public'
ORDER BY ordinal_position;

\echo '';

-- =====================================================
-- 4. CHECK ROW LEVEL SECURITY STATUS
-- =====================================================
\echo '4. CHECKING ROW LEVEL SECURITY (RLS) STATUS...';
\echo '-------------------------------------------';

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED - This will cause issues!'
  END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'stores', 'products', 'orders', 'order_items', 'payments')
ORDER BY tablename;

\echo '';

-- =====================================================
-- 5. CHECK RLS POLICIES
-- =====================================================
\echo '5. CHECKING RLS POLICIES...';
\echo '-------------------------------------------';

\echo '--- USERS TABLE POLICIES ---';
SELECT 
  policyname,
  cmd AS operation,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END AS using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END AS with_check_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

\echo '';
\echo '--- STORES TABLE POLICIES ---';
SELECT 
  policyname,
  cmd AS operation,
  roles
FROM pg_policies
WHERE tablename = 'stores'
ORDER BY policyname;

\echo '';

-- =====================================================
-- 6. CHECK REQUIRED POLICIES FOR REGISTRATION
-- =====================================================
\echo '6. VERIFYING CRITICAL POLICIES FOR REGISTRATION...';
\echo '-------------------------------------------';

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
        AND cmd = 'INSERT'
        AND 'anon' = ANY(roles)
    )
    THEN '✅ Users table allows anonymous INSERT (registration works)'
    ELSE '❌ Users table MISSING anonymous INSERT policy - REGISTRATION WILL FAIL!'
  END AS users_insert_policy,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'stores' 
        AND cmd = 'INSERT'
        AND 'anon' = ANY(roles)
    )
    THEN '✅ Stores table allows anonymous INSERT (seller registration works)'
    ELSE '❌ Stores table MISSING anonymous INSERT policy - SELLER REGISTRATION WILL FAIL!'
  END AS stores_insert_policy;

\echo '';

-- =====================================================
-- 7. CHECK INDEXES
-- =====================================================
\echo '7. CHECKING INDEXES FOR PERFORMANCE...';
\echo '-------------------------------------------';

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'stores', 'products', 'orders', 'order_items', 'payments')
ORDER BY tablename, indexname;

\echo '';

-- =====================================================
-- 8. CHECK DATA COUNTS
-- =====================================================
\echo '8. CHECKING DATA COUNTS...';
\echo '-------------------------------------------';

SELECT 
  'users' AS table_name,
  COUNT(*) AS row_count,
  COUNT(DISTINCT role) AS distinct_roles
FROM users
UNION ALL
SELECT 
  'stores',
  COUNT(*),
  COUNT(DISTINCT verification_status)
FROM stores
UNION ALL
SELECT 
  'products',
  COUNT(*),
  NULL
FROM products
UNION ALL
SELECT 
  'orders',
  COUNT(*),
  NULL
FROM orders;

\echo '';

-- =====================================================
-- 9. CHECK USER ROLES DISTRIBUTION
-- =====================================================
\echo '9. CHECKING USER ROLES DISTRIBUTION...';
\echo '-------------------------------------------';

SELECT 
  role,
  COUNT(*) AS user_count
FROM users
GROUP BY role
ORDER BY role;

\echo '';

-- =====================================================
-- 10. CHECK STORE VERIFICATION STATUS
-- =====================================================
\echo '10. CHECKING STORE VERIFICATION STATUS...';
\echo '-------------------------------------------';

SELECT 
  verification_status,
  COUNT(*) AS store_count
FROM stores
GROUP BY verification_status
ORDER BY verification_status;

\echo '';

-- =====================================================
-- 11. CHECK FOREIGN KEY CONSTRAINTS
-- =====================================================
\echo '11. CHECKING FOREIGN KEY CONSTRAINTS...';
\echo '-------------------------------------------';

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('users', 'stores', 'products', 'orders', 'order_items', 'payments')
ORDER BY tc.table_name, kcu.column_name;

\echo '';

-- =====================================================
-- 12. CHECK TRIGGERS
-- =====================================================
\echo '12. CHECKING TRIGGERS (updated_at automation)...';
\echo '-------------------------------------------';

SELECT 
  trigger_name,
  event_object_table AS table_name,
  action_timing,
  event_manipulation AS event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users', 'stores', 'products', 'orders', 'payments')
ORDER BY event_object_table, trigger_name;

\echo '';

-- =====================================================
-- 13. COMMON ISSUES SUMMARY
-- =====================================================
\echo '13. COMMON ISSUES SUMMARY...';
\echo '-------------------------------------------';

WITH diagnostics AS (
  SELECT 
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true) AS users_rls,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stores' AND rowsecurity = true) AS stores_rls,
    EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND cmd = 'INSERT' AND 'anon' = ANY(roles)) AS users_insert,
    EXISTS (SELECT FROM pg_policies WHERE tablename = 'stores' AND cmd = 'INSERT' AND 'anon' = ANY(roles)) AS stores_insert
)
SELECT 
  CASE 
    WHEN users_rls AND users_insert AND stores_rls AND stores_insert 
    THEN '✅ ALL CHECKS PASSED - Registration should work!'
    ELSE '❌ ISSUES FOUND - See details above'
  END AS overall_status,
  
  CASE 
    WHEN NOT users_rls THEN '❌ Enable RLS on users table'
    WHEN NOT users_insert THEN '❌ Add INSERT policy for users table'
    WHEN NOT stores_rls THEN '❌ Enable RLS on stores table'
    WHEN NOT stores_insert THEN '❌ Add INSERT policy for stores table'
    ELSE '✅ All critical policies in place'
  END AS action_needed
FROM diagnostics;

\echo '';
\echo '==========================================';
\echo 'DIAGNOSTICS COMPLETE';
\echo '==========================================';
\echo '';
\echo 'If issues were found, run the migration:';
\echo 'src/infrastructure/database/migrations/002_complete_schema.sql';
\echo '';

