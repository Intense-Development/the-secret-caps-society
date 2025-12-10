# Password Reset Setup - DEFINITIVE SOLUTION

## The Problem
Supabase password reset can send codes in different formats:
1. **Hash tokens** (`#access_token=...&refresh_token=...`) - Implicit flow
2. **Query code** (`?code=xxx&type=recovery`) - PKCE flow (but password reset doesn't use PKCE)

## The Solution
The current implementation handles BOTH flows on the client side:

### Flow 1: Hash Tokens (Implicit Flow)
1. User clicks email link → lands on `/en/reset-password#access_token=...`
2. Client detects hash tokens → calls `supabase.auth.setSession({ access_token, refresh_token })`
3. Session established → form enables

### Flow 2: Query Code (PKCE-like, but not really PKCE)
1. User clicks email link → lands on `/en/reset-password?code=xxx&type=recovery`
2. Client detects code → tries `exchangeCodeForSession(code)` first
3. If that fails (PKCE error), tries `verifyOtp({ token: code, type: 'recovery' })`
4. Session established → form enables

## Supabase Configuration REQUIRED

### 1. Redirect URLs in Supabase Dashboard
**Path:** Project → Authentication → URL Configuration → Redirect URLs

**Add these URLs:**
```
http://localhost:3000/en/reset-password
http://localhost:3000/**
https://your-production-domain.com/en/reset-password
https://your-production-domain.com/**
```

### 2. Site URL
**Path:** Project → Authentication → URL Configuration → Site URL

Set to:
- Development: `http://localhost:3000`
- Production: `https://your-production-domain.com`

### 3. Email Template (Optional)
**Path:** Project → Authentication → Email Templates → Reset Password

The default template should work, but ensure it uses `{{ .ConfirmationURL }}` which contains the full redirect URL.

## Testing

1. Request a new password reset (old emails won't work after config changes)
2. Click the link from the email
3. Should land on `/en/reset-password` with either:
   - Hash tokens in URL (`#access_token=...`)
   - Code in query params (`?code=xxx&type=recovery`)
4. Page should automatically process the tokens/code
5. Form should enable within 1-2 seconds
6. Enter new password and submit

## If It Still Doesn't Work

Check the browser console for these logs:
- `[RESET_PASSWORD_HASH_CHECK]` - Shows if hash tokens detected
- `[RESET_PASSWORD_CODE_DETECTED]` - Shows if code detected
- `[RESET_PASSWORD_EXCHANGE_ERROR]` - Shows if code exchange failed
- `[RESET_PASSWORD_VERIFY_OTP_ERROR]` - Shows if verifyOtp failed
- `[RESET_PASSWORD_SESSION_FROM_EXCHANGE]` - Success with exchangeCodeForSession
- `[RESET_PASSWORD_SESSION_FROM_VERIFY_OTP]` - Success with verifyOtp
- `[RESET_PASSWORD_SESSION_FROM_HASH_SUCCESS]` - Success with hash tokens

The implementation tries all methods and should work with the correct Supabase configuration.

