#!/usr/bin/env node
/**
 * Vercel Deployment Verification Script
 * 
 * This script verifies Vercel deployment configuration and build readiness.
 * Run this before pushing changes to ensure the app is ready for Vercel deployment.
 * 
 * Usage:
 *   npm run verify:vercel
 *   tsx scripts/verify-vercel.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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
  console.log('🚀 VERCEL DEPLOYMENT VERIFICATION REPORT');
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

function verifyNextConfig() {
  console.log('Checking Next.js configuration...\n');

  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  const nextConfigJsPath = path.join(process.cwd(), 'next.config.js');
  const nextConfigMjsPath = path.join(process.cwd(), 'next.config.mjs');

  if (fs.existsSync(nextConfigPath)) {
    try {
      const content = fs.readFileSync(nextConfigPath, 'utf-8');
      
      // Check for common issues
      if (content.includes('output: "standalone"')) {
        addResult(
          'Next.js Configuration',
          'warning',
          'Standalone output mode detected',
          'Vercel uses its own build system, standalone mode may not be needed'
        );
      }

      if (content.includes('images')) {
        addResult(
          'Next.js Configuration',
          'pass',
          'Image optimization is configured',
          'Image domains and optimization settings found'
        );
      }

      if (content.includes('next-intl') || content.includes('createNextIntlPlugin')) {
        addResult(
          'Next.js Configuration',
          'pass',
          'i18n plugin is configured',
          'next-intl integration found'
        );
      }

      addResult(
        'Next.js Configuration',
        'pass',
        'next.config.ts exists and appears valid',
        'Configuration file found'
      );
    } catch (error) {
      addResult(
        'Next.js Configuration',
        'fail',
        'Failed to read next.config.ts',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  } else if (fs.existsSync(nextConfigJsPath) || fs.existsSync(nextConfigMjsPath)) {
    addResult(
      'Next.js Configuration',
      'pass',
      'Next.js config file found (JS/MJS)',
      'Using JavaScript config file'
    );
  } else {
    addResult(
      'Next.js Configuration',
      'warning',
      'No next.config.ts/js/mjs found',
      'Next.js will use default configuration'
    );
  }

  return true;
}

function verifyVercelConfig() {
  console.log('Checking Vercel configuration...\n');

  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

  if (fs.existsSync(vercelConfigPath)) {
    try {
      const content = fs.readFileSync(vercelConfigPath, 'utf-8');
      const config = JSON.parse(content);

      if (config.framework && config.framework !== 'nextjs') {
        addResult(
          'Vercel Configuration',
          'warning',
          `Framework is set to "${config.framework}"`,
          'For Next.js apps, framework should be "nextjs"'
        );
      } else if (config.framework === 'nextjs') {
        addResult(
          'Vercel Configuration',
          'pass',
          'Framework is correctly set to "nextjs"',
          'Vercel will auto-detect Next.js'
        );
      }

      if (config.buildCommand) {
        addResult(
          'Vercel Configuration',
          'pass',
          'Build command is specified',
          `Build command: ${config.buildCommand}`
        );
      }

      if (config.outputDirectory && config.outputDirectory !== '.next') {
        addResult(
          'Vercel Configuration',
          'warning',
          `Output directory is "${config.outputDirectory}"`,
          'For Next.js, output directory should be ".next/"'
        );
      }

      addResult(
        'Vercel Configuration',
        'pass',
        'vercel.json exists and is valid',
        'Vercel configuration file found'
      );
    } catch (error) {
      addResult(
        'Vercel Configuration',
        'fail',
        'vercel.json exists but is invalid JSON',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  } else {
    addResult(
      'Vercel Configuration',
      'warning',
      'vercel.json not found',
      'Vercel will auto-detect Next.js, but explicit config is recommended'
    );
  }

  return true;
}

function verifyPackageJson() {
  console.log('Checking package.json...\n');

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    addResult(
      'Package.json',
      'fail',
      'package.json not found',
      'This is required for Vercel deployment'
    );
    return false;
  }

  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);

    // Check for build script
    if (!pkg.scripts || !pkg.scripts.build) {
      addResult(
        'Package.json',
        'fail',
        'No "build" script found',
        'Vercel requires a build script in package.json'
      );
      return false;
    }

    if (pkg.scripts.build !== 'next build') {
      addResult(
        'Package.json',
        'warning',
        `Build script is "${pkg.scripts.build}"`,
        'For Next.js, build script should be "next build"'
      );
    } else {
      addResult(
        'Package.json',
        'pass',
        'Build script is correctly configured',
        'Build script: next build'
      );
    }

    // Check for Next.js dependency
    if (!pkg.dependencies?.next && !pkg.devDependencies?.next) {
      addResult(
        'Package.json',
        'fail',
        'Next.js not found in dependencies',
        'Next.js must be in dependencies or devDependencies'
      );
      return false;
    }

    addResult(
      'Package.json',
      'pass',
      'package.json is valid',
      `Next.js version: ${pkg.dependencies?.next || pkg.devDependencies?.next}`
    );

    return true;
  } catch (error) {
    addResult(
      'Package.json',
      'fail',
      'Failed to parse package.json',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

function verifyFileStructure() {
  console.log('Checking file structure...\n');

  const appDir = path.join(process.cwd(), 'src', 'app');
  const pagesDir = path.join(process.cwd(), 'src', 'pages');
  const publicDir = path.join(process.cwd(), 'public');

  // Check for App Router
  if (fs.existsSync(appDir)) {
    addResult(
      'File Structure',
      'pass',
      'App Router structure found',
      'src/app/ directory exists'
    );

    // Check for API routes
    const apiDir = path.join(appDir, 'api');
    if (fs.existsSync(apiDir)) {
      addResult(
        'File Structure',
        'pass',
        'API routes directory found',
        'src/app/api/ exists'
      );
    }
  } else if (fs.existsSync(pagesDir)) {
    addResult(
      'File Structure',
      'warning',
      'Pages Router detected',
      'App Router (src/app/) is recommended for Next.js 13+'
    );
  } else {
    addResult(
      'File Structure',
      'fail',
      'No app or pages directory found',
      'Next.js requires either src/app/ or src/pages/'
    );
    return false;
  }

  // Check for public directory
  if (fs.existsSync(publicDir)) {
    addResult(
      'File Structure',
      'pass',
      'Public directory found',
      'Static files directory exists'
    );
  } else {
    addResult(
      'File Structure',
      'warning',
      'Public directory not found',
      'Static files should be in public/ directory'
    );
  }

  return true;
}

function verifyBuild() {
  console.log('Testing production build...\n');

  try {
    console.log('Running: npm run build\n');
    execSync('npm run build', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    addResult(
      'Build Process',
      'pass',
      'Production build completed successfully',
      'No build errors detected'
    );

    // Check if .next directory was created
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      addResult(
        'Build Output',
        'pass',
        'Build output directory created',
        '.next/ directory exists'
      );
    } else {
      addResult(
        'Build Output',
        'warning',
        'Build output directory not found',
        '.next/ should be created after build'
      );
    }

    return true;
  } catch (error) {
    addResult(
      'Build Process',
      'fail',
      'Production build failed',
      'Run "npm run build" manually to see detailed errors'
    );
    return false;
  }
}

function verifyEnvironmentVariables() {
  console.log('Checking environment variables...\n');

  const envExamplePath = path.join(process.cwd(), 'env.example');
  const envLocalPath = path.join(process.cwd(), '.env.local');

  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf-8');
    
    const requiredVars: string[] = [];
    if (envExample.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      requiredVars.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (envExample.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      requiredVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (envExample.includes('NEXT_PUBLIC_APP_URL')) {
      requiredVars.push('NEXT_PUBLIC_APP_URL');
    }

    if (requiredVars.length > 0) {
      addResult(
        'Environment Variables',
        'warning',
        `Required variables: ${requiredVars.join(', ')}`,
        'Make sure these are set in Vercel dashboard for production'
      );
    }
  }

  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf-8');
    
    // Check for localhost URLs that shouldn't be in production
    if (envLocal.includes('localhost') && envLocal.includes('NEXT_PUBLIC_APP_URL')) {
      addResult(
        'Environment Variables',
        'warning',
        'Localhost URL found in .env.local',
        'Update NEXT_PUBLIC_APP_URL to production URL in Vercel dashboard'
      );
    }

    addResult(
      'Environment Variables',
      'pass',
      '.env.local file exists',
      'Local environment variables are configured'
    );
  } else {
    addResult(
      'Environment Variables',
      'warning',
      '.env.local not found',
      'Required for local development, but production uses Vercel dashboard'
    );
  }

  return true;
}

function verifyMiddleware() {
  console.log('Checking middleware compatibility...\n');

  const middlewarePath = path.join(process.cwd(), 'middleware.ts');

  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf-8');
    
    // Check for Edge Runtime compatibility
    if (content.includes('export const runtime') && content.includes('edge')) {
      addResult(
        'Middleware',
        'pass',
        'Middleware uses Edge Runtime',
        'Compatible with Vercel Edge Network'
      );
    } else if (content.includes('export const runtime') && !content.includes('edge')) {
      addResult(
        'Middleware',
        'warning',
        'Middleware runtime is not explicitly set to "edge"',
        'Vercel runs middleware on Edge Runtime by default'
      );
    }

    // Check for next-intl middleware
    if (content.includes('next-intl') || content.includes('createMiddleware')) {
      addResult(
        'Middleware',
        'pass',
        'i18n middleware detected',
        'next-intl middleware is Vercel-compatible'
      );
    }

    addResult(
      'Middleware',
      'pass',
      'Middleware file exists',
      'Middleware will run on Vercel Edge Runtime'
    );
  } else {
    addResult(
      'Middleware',
      'warning',
      'No middleware.ts found',
      'Middleware is optional but may be needed for auth/i18n'
    );
  }

  return true;
}

async function main() {
  console.log('🚀 Starting Vercel Deployment Verification...\n');

  // Step 1: Verify Next.js configuration
  const nextConfigValid = verifyNextConfig();
  if (!nextConfigValid) {
    printResults();
    return;
  }

  // Step 2: Verify Vercel configuration
  verifyVercelConfig();

  // Step 3: Verify package.json
  const packageJsonValid = verifyPackageJson();
  if (!packageJsonValid) {
    printResults();
    return;
  }

  // Step 4: Verify file structure
  const fileStructureValid = verifyFileStructure();
  if (!fileStructureValid) {
    printResults();
    return;
  }

  // Step 5: Verify middleware
  verifyMiddleware();

  // Step 6: Check environment variables
  verifyEnvironmentVariables();

  // Step 7: Test build (this takes time, so do it last)
  const buildValid = verifyBuild();
  if (!buildValid) {
    printResults();
    return;
  }

  // Print final results
  printResults();
}

main().catch((error) => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});

