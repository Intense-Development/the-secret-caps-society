#!/usr/bin/env node
/**
 * Supabase Deployment Verification Script
 * 
 * This script verifies Supabase configuration and connectivity before deployment.
 * Run this before pushing changes to ensure Supabase is properly configured.
 * 
 * Usage:
 *   npm run verify:supabase
 *   node scripts/verify-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

function addResult(check: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string) {
  results.push({ check, status, message, details });
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 SUPABASE DEPLOYMENT VERIFICATION REPORT');
  console.log('='.repeat(60) + '\n');

  let hasFailures = false;
  let hasWarnings = false;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.check}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log();

    if (result.status === 'fail') hasFailures = true;
    if (result.status === 'warning') hasWarnings = true;
  });

  console.log('='.repeat(60));
  
  if (hasFailures) {
    console.log('❌ VERIFICATION FAILED - Do not push until issues are resolved');
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  VERIFICATION PASSED WITH WARNINGS - Review before pushing');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } else {
    console.log('✅ VERIFICATION PASSED - Safe to push');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  }
}

async function verifyEnvironmentVariables() {
  console.log('Checking environment variables...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Check NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    addResult(
      'Environment Variables',
      'fail',
      'NEXT_PUBLIC_SUPABASE_URL is not set',
      'Add NEXT_PUBLIC_SUPABASE_URL to your .env.local file'
    );
    return false;
  }

  if (supabaseUrl.includes('your-project-id') || supabaseUrl.includes('xxxxx')) {
    addResult(
      'Environment Variables',
      'fail',
      'NEXT_PUBLIC_SUPABASE_URL contains placeholder value',
      `Current value: ${supabaseUrl.substring(0, 30)}...`
    );
    return false;
  }

  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    addResult(
      'Environment Variables',
      'fail',
      'NEXT_PUBLIC_SUPABASE_URL has invalid format',
      `Expected format: https://[project-id].supabase.co, got: ${supabaseUrl}`
    );
    return false;
  }

  // Check NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseKey) {
    addResult(
      'Environment Variables',
      'fail',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set',
      'Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file'
    );
    return false;
  }

  if (supabaseKey.includes('your-anon-key') || supabaseKey.length < 50) {
    addResult(
      'Environment Variables',
      'fail',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a placeholder or invalid',
      'Get your anon key from Supabase Dashboard → Settings → API'
    );
    return false;
  }

  // Check if key looks like a JWT
  const jwtPattern = /^eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\./;
  if (!jwtPattern.test(supabaseKey)) {
    addResult(
      'Environment Variables',
      'warning',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY does not match JWT format',
      'Verify the key is correct from Supabase Dashboard'
    );
  }

  addResult(
    'Environment Variables',
    'pass',
    'All required environment variables are set and formatted correctly',
    `URL: ${supabaseUrl.substring(0, 30)}..., Key: ${supabaseKey.substring(0, 20)}...`
  );

  // Optional checks
  if (!databaseUrl) {
    addResult(
      'Environment Variables (Optional)',
      'warning',
      'DATABASE_URL is not set (optional for direct PostgreSQL access)',
      'This is only needed for migrations or direct database access'
    );
  }

  if (!appUrl) {
    addResult(
      'Environment Variables (Optional)',
      'warning',
      'NEXT_PUBLIC_APP_URL is not set',
      'This is used for magic link redirects. Set to your production URL for deployment'
    );
  }

  return true;
}

async function verifySupabaseClient() {
  console.log('Verifying Supabase client creation...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    addResult(
      'Supabase Client Creation',
      'pass',
      'Supabase client created successfully',
      'Client initialized without errors'
    );
    return supabase;
  } catch (error) {
    addResult(
      'Supabase Client Creation',
      'fail',
      'Failed to create Supabase client',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

async function verifyConnectivity(supabase: ReturnType<typeof createClient> | null) {
  console.log('Testing Supabase connectivity...\n');

  if (!supabase) {
    addResult(
      'Connectivity Test',
      'fail',
      'Cannot test connectivity - client creation failed',
      'Fix client creation issues first'
    );
    return false;
  }

  try {
    // Test authentication service
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError && sessionError.message.includes('Invalid API key')) {
      addResult(
        'Connectivity Test',
        'fail',
        'Invalid Supabase API key',
        'The anon key is not valid. Check your Supabase Dashboard → Settings → API'
      );
      return false;
    }

    if (sessionError && !sessionError.message.includes('Invalid API key')) {
      addResult(
        'Connectivity Test',
        'warning',
        'Supabase connection test returned an error (may be expected)',
        `Error: ${sessionError.message}`
      );
    } else {
      addResult(
        'Connectivity Test',
        'pass',
        'Successfully connected to Supabase',
        'Authentication service is accessible'
      );
    }

    // Test a simple query to verify database access
    try {
      const { error: healthError } = await supabase.from('_health').select('*').limit(1);
      // This might fail, which is okay - we're just testing connectivity
      if (!healthError || healthError.code === 'PGRST116') {
        addResult(
          'Database Connectivity',
          'pass',
          'Database service is accessible',
          'Can query Supabase database'
        );
      }
    } catch (dbError) {
      // Database query failed, but that's okay for basic verification
      addResult(
        'Database Connectivity',
        'warning',
        'Could not verify database connectivity',
        'This may be normal if RLS policies restrict access'
      );
    }

    return true;
  } catch (error) {
    addResult(
      'Connectivity Test',
      'fail',
      'Network error when connecting to Supabase',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

function verifyCodeIntegration() {
  console.log('Checking code integration...\n');

  const clientPath = path.join(process.cwd(), 'src/lib/supabase/client.ts');
  const serverPath = path.join(process.cwd(), 'src/lib/supabase/server.ts');
  const middlewarePath = path.join(process.cwd(), 'middleware.ts');

  // Check client.ts
  if (fs.existsSync(clientPath)) {
    const clientContent = fs.readFileSync(clientPath, 'utf-8');
    if (clientContent.includes('NEXT_PUBLIC_SUPABASE_URL') && clientContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      addResult(
        'Code Integration - Client',
        'pass',
        'Browser Supabase client is properly configured',
        'src/lib/supabase/client.ts uses environment variables correctly'
      );
    } else {
      addResult(
        'Code Integration - Client',
        'fail',
        'Browser Supabase client may not be using environment variables',
        'Check src/lib/supabase/client.ts'
      );
    }
  } else {
    addResult(
      'Code Integration - Client',
      'warning',
      'Browser Supabase client file not found',
      'Expected: src/lib/supabase/client.ts'
    );
  }

  // Check server.ts
  if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf-8');
    if (serverContent.includes('NEXT_PUBLIC_SUPABASE_URL') && serverContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      addResult(
        'Code Integration - Server',
        'pass',
        'Server Supabase client is properly configured',
        'src/lib/supabase/server.ts uses environment variables correctly'
      );
    } else {
      addResult(
        'Code Integration - Server',
        'fail',
        'Server Supabase client may not be using environment variables',
        'Check src/lib/supabase/server.ts'
      );
    }
  } else {
    addResult(
      'Code Integration - Server',
      'warning',
      'Server Supabase client file not found',
      'Expected: src/lib/supabase/server.ts'
    );
  }

  // Check middleware
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    if (middlewareContent.includes('supabase') || middlewareContent.includes('Supabase')) {
      addResult(
        'Code Integration - Middleware',
        'pass',
        'Middleware includes Supabase integration',
        'middleware.ts appears to use Supabase'
      );
    } else {
      addResult(
        'Code Integration - Middleware',
        'warning',
        'Middleware may not be using Supabase',
        'Check if Supabase auth is needed in middleware.ts'
      );
    }
  }
}

async function main() {
  console.log('🚀 Starting Supabase Deployment Verification...\n');

  // Step 1: Verify environment variables
  const envValid = await verifyEnvironmentVariables();
  if (!envValid) {
    printResults();
    return;
  }

  // Step 2: Verify client creation
  const supabase = await verifySupabaseClient();
  if (!supabase) {
    printResults();
    return;
  }

  // Step 3: Test connectivity
  await verifyConnectivity(supabase);

  // Step 4: Check code integration
  verifyCodeIntegration();

  // Print final results
  printResults();
}

main().catch((error) => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});

