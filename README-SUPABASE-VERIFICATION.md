# Supabase Deployment Verification

This project includes an automated Supabase verification system that runs before every git push to ensure your Supabase configuration is correct and deployment-ready.

## 🚀 Quick Start

The verification runs automatically before every `git push`. To run it manually:

```bash
npm run verify:supabase
```

## 📋 What Gets Verified

### 1. Environment Variables
- ✅ `NEXT_PUBLIC_SUPABASE_URL` is set and valid
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set and valid
- ✅ No placeholder values (e.g., "your-project-id")
- ✅ URL format matches Supabase requirements

### 2. Supabase Client Configuration
- ✅ Browser client (`src/lib/supabase/client.ts`) is properly configured
- ✅ Server client (`src/lib/supabase/server.ts`) is properly configured
- ✅ Client creation doesn't throw errors

### 3. Connectivity Testing
- ✅ Can reach Supabase API endpoint
- ✅ Authentication service responds correctly
- ✅ Database connection works (if applicable)

### 4. Code Integration
- ✅ Middleware uses Supabase correctly
- ✅ API routes properly initialize Supabase clients
- ✅ No hardcoded credentials in code

## 🔧 Setup

### Install Dependencies

The verification script requires `tsx` and `dotenv`:

```bash
npm install
```

These are already added to `devDependencies` in `package.json`.

### Environment Variables

Make sure you have a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API.

## 🎯 Using the Cursor Agent

You can invoke the Supabase verification agent directly in Cursor:

```
@supabase-deployment-verifier
```

Or use the command:

```
@verify-supabase-before-push
```

The agent will:
1. Check all environment variables
2. Test Supabase connectivity
3. Verify code integration
4. Provide a detailed report with recommendations

## 🚫 Bypassing the Check

If you need to bypass the verification (not recommended), use:

```bash
git push --no-verify
```

**Warning**: Only bypass if you're absolutely sure your Supabase configuration is correct. Deployment failures can occur if Supabase is not properly configured.

## 📊 Verification Report

The script provides a detailed report with:

- ✅ **Green checks**: Passed verification
- ⚠️ **Yellow warnings**: Issues that should be reviewed but won't block deployment
- ❌ **Red failures**: Critical issues that will block the push

### Example Output

```
============================================================
🔍 SUPABASE DEPLOYMENT VERIFICATION REPORT
============================================================

✅ Environment Variables
   All required environment variables are set and formatted correctly
   Details: URL: https://xxxxx.supabase.co..., Key: eyJhbGciOiJIUzI1NiIs...

✅ Supabase Client Creation
   Supabase client created successfully
   Details: Client initialized without errors

✅ Connectivity Test
   Successfully connected to Supabase
   Details: Authentication service is accessible

✅ Code Integration - Client
   Browser Supabase client is properly configured
   Details: src/lib/supabase/client.ts uses environment variables correctly

============================================================
✅ VERIFICATION PASSED - Safe to push
============================================================
```

## 🐛 Troubleshooting

### "Missing required environment variables"

**Solution**: Create a `.env.local` file with your Supabase credentials:

```bash
cp env.example .env.local
# Then edit .env.local with your actual values
```

### "Invalid Supabase URL format"

**Solution**: Ensure your URL follows the format:
```
https://[project-id].supabase.co
```

### "Invalid Supabase API key"

**Solution**: 
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the `anon public` key
5. Update `.env.local`

### "Network error when connecting to Supabase"

**Possible causes**:
- Supabase project is paused
- Network/firewall blocking connection
- Invalid project URL

**Solution**:
1. Check if your Supabase project is active
2. Verify the URL in your Supabase dashboard
3. Check network connectivity

## 📝 Files

- **Agent**: `.cursor/agents/supabase-deployment-verifier.md` - Cursor agent definition
- **Script**: `scripts/verify-supabase.ts` - Verification script
- **Hook**: `.git/hooks/pre-push` - Git pre-push hook
- **Command**: `.cursor/commands/verify-supabase-before-push.md` - Command documentation

## 🔄 How It Works

1. **Pre-Push Hook**: When you run `git push`, the `.git/hooks/pre-push` hook automatically runs
2. **Verification Script**: The hook executes `npm run verify:supabase`
3. **Checks**: The script performs all verification checks
4. **Result**: If any critical check fails, the push is blocked

## 💡 Best Practices

1. **Always run verification before pushing** - Don't bypass unless absolutely necessary
2. **Fix warnings** - Even if they don't block the push, warnings indicate potential issues
3. **Keep environment variables updated** - Update `.env.local` when Supabase credentials change
4. **Test in development first** - Verify locally before pushing to production

## 🆘 Need Help?

If you encounter issues:

1. Run the verification manually: `npm run verify:supabase`
2. Check the detailed error messages
3. Review the troubleshooting section above
4. Check [Supabase Documentation](https://supabase.com/docs)

---

**Note**: This verification system helps prevent deployment failures but doesn't guarantee 100% success. Always test your deployment in a staging environment before production.

