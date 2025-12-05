# Supabase Configuration Required for Password Reset

## Issue
Password reset emails show error: `otp_expired` or redirect to home with error in URL fragment.

## Solution

### 1. Add Redirect URLs to Supabase Dashboard

Go to your Supabase Dashboard:

**Path:** Project → Authentication → URL Configuration

**Add these URLs to "Redirect URLs":**

For Development:
```
http://localhost:3000/api/auth/callback
http://localhost:3001/api/auth/callback
http://localhost:3000/**
```

For Production:
```
https://your-production-domain.com/api/auth/callback
https://your-production-domain.com/**
```

### 2. Configure Site URL

**Path:** Project → Authentication → URL Configuration → Site URL

Set to:
- Development: `http://localhost:3000`
- Production: `https://your-production-domain.com`

### 3. Email Template (Optional)

**Path:** Project → Authentication → Email Templates → Reset Password

Default template should work, but you can customize:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 4. Token Expiration Settings

**Path:** Project → Authentication → Email Auth

- Magic Link Expiry: Default is 60 minutes
- For testing, you might want to increase this temporarily

## Testing After Configuration

1. Request a new password reset (old emails won't work)
2. Click the link quickly (within expiration time)
3. You should be redirected to `/en/reset-password` successfully
4. Reset your password

## Current Flow

```
User clicks email link
    ↓
https://yourapp.com/api/auth/callback?code=xxx&next=/en/reset-password
    ↓
Callback exchanges code for session (if code valid and not expired)
    ↓
Redirect to /en/reset-password (with session in cookies)
    ↓
User sees password reset form
    ↓
User submits new password
    ↓
Password updated ✅
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `otp_expired` | Token expired | Click link faster, or increase expiry in Supabase |
| `access_denied` | Redirect URL not whitelisted | Add callback URL to Supabase allowed URLs |
| `Email link is invalid` | Link already used or expired | Request new reset email |
| `Invalid Reset Link` | No valid session | Ensure callback URL is whitelisted |

