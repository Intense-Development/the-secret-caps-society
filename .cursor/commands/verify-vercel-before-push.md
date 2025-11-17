# Command: Verify Vercel Before Push

This command uses the `vercel-deployment-verifier` agent to verify Vercel deployment configuration and build readiness before pushing changes to the repository.

## Usage

```
@verify-vercel-before-push
```

Or manually:
```
npm run verify:vercel
```

## What It Does

1. **Next.js Configuration Validation**
   - Checks `next.config.ts` for proper configuration
   - Verifies image optimization settings
   - Validates i18n plugin configuration

2. **Vercel Configuration Check**
   - Verifies `vercel.json` exists and is valid
   - Checks framework detection
   - Validates build commands

3. **Build Process Verification**
   - Runs production build (`npm run build`)
   - Checks for TypeScript errors
   - Verifies ESLint passes
   - Validates static generation

4. **File Structure Check**
   - Verifies App Router structure
   - Checks API routes directory
   - Validates public directory

5. **Middleware Compatibility**
   - Verifies Edge Runtime compatibility
   - Checks i18n middleware setup

6. **Environment Variables**
   - Checks required variables are documented
   - Validates production URLs

## Automatic Execution

This verification runs automatically before every `git push` via the pre-push hook. Run `npm run setup:hooks` to install it.

## Bypassing the Check

If you need to bypass the verification (not recommended), use:
```bash
git push --no-verify
```

## Manual Execution

You can run the verification manually at any time:
```bash
npm run verify:vercel
```

## Output

The script provides a detailed report with:
- ✅ Passed checks (green)
- ⚠️ Warnings (yellow)
- ❌ Failed checks (red)

If any critical checks fail, the push will be blocked.

