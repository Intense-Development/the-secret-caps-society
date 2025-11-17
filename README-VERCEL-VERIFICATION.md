# Vercel Deployment Verification

This project includes an automated Vercel deployment verification system that runs before every git push to ensure your Next.js application is ready for Vercel deployment.

## 🚀 Quick Start

The verification runs automatically before every `git push`. To run it manually:

```bash
npm run verify:vercel
```

## 📋 What Gets Verified

### 1. Next.js Configuration
- ✅ `next.config.ts` exists and is valid
- ✅ Image optimization is configured
- ✅ i18n plugin (next-intl) is properly set up
- ✅ No conflicting or deprecated options

### 2. Vercel Configuration
- ✅ `vercel.json` exists and is valid (optional but recommended)
- ✅ Framework is set to "nextjs"
- ✅ Build command matches package.json
- ✅ Output directory is correct (`.next/`)

### 3. Build Process
- ✅ Production build completes successfully
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Static pages generate correctly
- ✅ i18n routes generate for all locales

### 4. File Structure
- ✅ App Router structure (`src/app/`) exists
- ✅ API routes directory (`src/app/api/`) exists
- ✅ Public directory for static files

### 5. Middleware Compatibility
- ✅ Middleware is Edge Runtime compatible
- ✅ i18n middleware is properly configured
- ✅ No Node.js-specific APIs

### 6. Environment Variables
- ✅ Required variables are documented
- ✅ Production URLs are configured (not localhost)
- ✅ `NEXT_PUBLIC_*` variables are set

## 🔧 Setup

### Install Dependencies

The verification script requires `tsx`:

```bash
npm install
```

This is already added to `devDependencies` in `package.json`.

### Setup Git Hooks

Install the pre-push hook to run verification automatically:

```bash
npm run setup:hooks
```

This will create `.git/hooks/pre-push` that runs verification before every push.

## 🎯 Using the Cursor Agent

You can invoke the Vercel verification agent directly in Cursor:

```
@vercel-deployment-verifier
```

Or use the command:

```
@verify-vercel-before-push
```

The agent will:
1. Check Next.js and Vercel configuration
2. Verify file structure
3. Test production build
4. Validate middleware compatibility
5. Check environment variables
6. Provide a detailed report with recommendations

## 🚫 Bypassing the Check

If you need to bypass the verification (not recommended), use:

```bash
git push --no-verify
```

**Warning**: Only bypass if you're absolutely sure your application is ready for Vercel deployment. Build failures can occur if configuration is incorrect.

## 📊 Verification Report

The script provides a detailed report with:

- ✅ **Green checks**: Passed verification
- ⚠️ **Yellow warnings**: Issues that should be reviewed but won't block deployment
- ❌ **Red failures**: Critical issues that will block the push

### Example Output

```
============================================================
🚀 VERCEL DEPLOYMENT VERIFICATION REPORT
============================================================

✅ Next.js Configuration
   next.config.ts exists and appears valid
   Details: Configuration file found

✅ Vercel Configuration
   vercel.json exists and is valid
   Details: Vercel configuration file found

✅ Package.json
   Build script is correctly configured
   Details: Build script: next build

✅ File Structure
   App Router structure found
   Details: src/app/ directory exists

✅ Middleware
   Middleware file exists
   Details: Middleware will run on Vercel Edge Runtime

✅ Build Process
   Production build completed successfully
   Details: No build errors detected

============================================================
✅ VERIFICATION PASSED - Safe to push
============================================================
```

## 🐛 Troubleshooting

### "Build script not found"

**Solution**: Ensure `package.json` has a `build` script:
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### "Next.js not found in dependencies"

**Solution**: Install Next.js:
```bash
npm install next
```

### "Build failed"

**Possible causes**:
- TypeScript errors
- ESLint errors
- Missing dependencies
- Configuration issues

**Solution**:
1. Run `npm run build` manually to see detailed errors
2. Fix TypeScript errors: `npx tsc --noEmit`
3. Fix ESLint errors: `npm run lint`
4. Install missing dependencies: `npm install`

### "Middleware compatibility issues"

**Solution**: Ensure middleware uses Edge Runtime compatible APIs:
- No Node.js filesystem operations
- No Node.js-specific modules
- Use Edge Runtime compatible APIs only

### "Environment variables not set"

**Solution**: 
1. For local development: Create `.env.local` with required variables
2. For production: Set environment variables in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` variables
   - Ensure production URLs (not localhost)

## 📝 Files

- **Agent**: `.cursor/agents/vercel-deployment-verifier.md` - Cursor agent definition
- **Script**: `scripts/verify-vercel.ts` - Verification script
- **Hook Setup**: `scripts/setup-vercel-hooks.sh` - Git hooks installation script
- **Command**: `.cursor/commands/verify-vercel-before-push.md` - Command documentation

## 🔄 How It Works

1. **Pre-Push Hook**: When you run `git push`, the `.git/hooks/pre-push` hook automatically runs
2. **Verification Script**: The hook executes `npm run verify:vercel`
3. **Checks**: The script performs all verification checks including a full production build
4. **Result**: If any critical check fails, the push is blocked

## 💡 Best Practices

1. **Always run verification before pushing** - Don't bypass unless absolutely necessary
2. **Fix warnings** - Even if they don't block the push, warnings indicate potential issues
3. **Test builds locally** - Run `npm run build` before pushing
4. **Keep Vercel config updated** - Update `vercel.json` when build requirements change
5. **Set environment variables in Vercel** - Don't rely on `.env.local` for production

## 🆘 Need Help?

If you encounter issues:

1. Run the verification manually: `npm run verify:vercel`
2. Check the detailed error messages
3. Review the troubleshooting section above
4. Check [Vercel Documentation](https://vercel.com/docs)
5. Check [Next.js Documentation](https://nextjs.org/docs)

## Vercel-Specific Considerations

1. **Edge Runtime**: Middleware runs on Edge Runtime - ensure compatibility
2. **Serverless Functions**: API routes run as serverless functions
3. **Static Generation**: Pre-rendered pages are served from CDN
4. **Environment Variables**: Must be set in Vercel dashboard
5. **Build Output**: Must be `.next/` directory
6. **i18n Routing**: Ensure locale routing works with Vercel's routing
7. **Image Optimization**: Uses Vercel's image optimization service

---

**Note**: This verification system helps prevent deployment failures but doesn't guarantee 100% success. Always test your deployment in a staging environment before production.

