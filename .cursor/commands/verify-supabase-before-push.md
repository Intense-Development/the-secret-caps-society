# Command: Verify Supabase Before Push

This command uses the `supabase-deployment-verifier` agent to verify Supabase configuration and connectivity before pushing changes to the repository.

## Usage

```
@verify-supabase-before-push
```

Or manually:
```
npm run verify:supabase
```

## What It Does

1. **Environment Variable Validation**
   - Checks for `NEXT_PUBLIC_SUPABASE_URL`
   - Checks for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Validates format and ensures no placeholder values

2. **Supabase Client Verification**
   - Tests browser client creation
   - Tests server client creation
   - Verifies no runtime errors

3. **Connectivity Testing**
   - Tests connection to Supabase API
   - Verifies authentication service accessibility
   - Tests database connectivity (if available)

4. **Code Integration Check**
   - Verifies Supabase client files exist and are properly configured
   - Checks middleware integration
   - Validates API route usage

## Automatic Execution

This verification runs automatically before every `git push` via the pre-push hook located at `.git/hooks/pre-push`.

## Bypassing the Check

If you need to bypass the verification (not recommended), use:
```bash
git push --no-verify
```

## Manual Execution

You can run the verification manually at any time:
```bash
npm run verify:supabase
```

## Output

The script provides a detailed report with:
- ✅ Passed checks (green)
- ⚠️ Warnings (yellow)
- ❌ Failed checks (red)

If any critical checks fail, the push will be blocked.

