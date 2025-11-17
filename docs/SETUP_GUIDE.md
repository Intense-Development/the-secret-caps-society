# Registration Flow Setup Guide

This guide will help you set up and configure the new registration flow for The Secret Caps Society.

---

## Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- PostgreSQL database (or Supabase managed database)

---

## 1. Supabase Project Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name:** the-secret-caps-society
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
4. Click "Create new project"

### Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### Step 3: Set Up Environment Variables ⚠️ CRITICAL

**This step is REQUIRED - the app will not work without it!**

1. Copy the example file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` with your actual values:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration (Optional - for direct PostgreSQL access)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Importante:** `NEXT_PUBLIC_APP_URL` se usa para construir el enlace de retorno del magic link. Asegúrate de que coincida con el dominio disponible públicamente (o `http://localhost:3000` en desarrollo) para evitar errores de Supabase.

3. **Restart your development server** after creating `.env.local`:
   ```bash
   # Stop the server (Ctrl+C) then:
   npm run dev
   ```

**Without these environment variables, you will see:**
- ❌ "Your project's URL and API key are required to create a Supabase client!"
- ❌ Registration will fail with 500 errors

---

## 2. Database Setup

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the migration file: `src/infrastructure/database/migrations/002_complete_schema.sql`
3. Verify tables were created in **Table Editor**

### Option B: Using Command Line

```bash
# Connect to your database
psql $DATABASE_URL

# Run the migration
\i src/infrastructure/database/migrations/002_complete_schema.sql
```

### Option C: Verify with Diagnostics (Recommended)

After running the migration, verify everything is set up correctly:

1. In Supabase **SQL Editor**, run the diagnostics script:
   ```
   src/infrastructure/database/diagnostics.sql
   ```

2. Check the output for any ❌ marks
3. All checks should show ✅

**Expected output:**
```
✅ users table exists
✅ stores table exists
✅ RLS ENABLED for all tables
✅ Users table allows anonymous INSERT
✅ ALL CHECKS PASSED - Registration should work!
```

---

## 3. Supabase Storage Setup

### Create Storage Bucket for Verification Documents

1. In Supabase dashboard, go to **Storage**
2. Click "**New bucket**"
3. Name: `verification-documents`
4. **Public bucket:** Yes (or configure RLS policies)
5. Click "Create bucket"

### Set Storage Policies (Optional but Recommended)

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-documents');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verification-documents');
```

---

## 4. Supabase Auth Configuration

### Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**
   - **Magic Link**
   - **Change Email Address**
   - **Reset Password**

### Enable Email Confirmations

1. Go to **Authentication** → **Settings**
2. Toggle "**Enable email confirmations**"
3. Configure redirect URLs:
   - **Site URL:** `http://localhost:3000` (dev) or your production URL
   - **Redirect URLs:** Add your domains

### OAuth Providers (Optional - Future Enhancement)

To enable OAuth login:

1. Go to **Authentication** → **Providers**
2. Enable desired providers (Google, Apple, etc.)
3. Add OAuth credentials from provider consoles

---

## 5. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

---

## 6. Run Database Migrations

```bash
# Using the provided migration
npm run migrate
# or manually run the SQL file in Supabase SQL Editor
```

---

## 7. Test the Application

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/register`

### Verify Login + Smart Dashboard

1. Crea un usuario en Supabase (o usa uno existente con rol `buyer`, `seller` o `admin`).
2. Navega a `http://localhost:3000/login` y:
   - Inicia sesión con email + contraseña para validar el flujo tradicional.
   - Marca/desmarca **Remember me** y confirma que la sesión persiste según lo esperado.
   - Haz clic en **Email me a magic link** para recibir un enlace passwordless (revisa la bandeja de salida de Supabase en modo dev).
3. Tras iniciar sesión, serás redirigido a `/dashboard`, donde verás paneles adaptados al rol del usuario, gráficas Recharts y recomendaciones personalizadas.
4. Intenta acceder a `/dashboard` en una ventana privada: deberías ser redirigido a `/login` gracias al middleware de protección.

> Tip: Usa la consola de Supabase → Auth → Users para asignar metadata de `role` o edita la fila en la tabla `users` para probar los escenarios buyer/seller/admin.

### Test Buyer Registration

1. Click "Buyer" account type
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: SecurePass123!
   - Confirm Password: SecurePass123!
3. Check "I agree to terms"
4. Click "Create Account"

### Test Seller Registration

1. Click "Seller" account type
2. Complete all 4 steps:
   - **Step 1:** Account information
   - **Step 2:** Store information
   - **Step 3:** Business location
   - **Step 4:** Upload verification document
3. Submit and verify success modal appears

---

## 8. Run Tests

### Unit Tests

```bash
npm test
# or
npm run test:unit
```

### E2E Tests

```bash
# Install Playwright if not already installed
npx playwright install

# Run E2E tests
npm run test:e2e
```

---

## 9. Verify Setup

### Check Supabase Dashboard

1. **Authentication** → **Users**: New users should appear after registration
2. **Table Editor** → **users**: Verify user records
3. **Table Editor** → **stores**: Verify store records for sellers
4. **Storage** → **verification-documents**: Check uploaded files

### Check Database

```sql
-- Verify users table
SELECT * FROM users;

-- Verify stores table
SELECT * FROM stores;

-- Check verification status
SELECT name, verification_status FROM stores;
```

---

## 10. Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution:** Double-check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

### Issue: "Table does not exist"
**Solution:** Run the database migration in Supabase SQL Editor

### Issue: "Upload failed"
**Solution:** 
1. Check if `verification-documents` bucket exists in Storage
2. Verify bucket is public or has proper RLS policies
3. Check file size (must be < 10MB)

### Issue: "User already exists"
**Solution:** This is expected behavior. Use a different email or delete the test user from Supabase Auth dashboard

### Issue: CORS Errors
**Solution:** 
1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. In Supabase, add your domain to allowed redirect URLs

---

## 11. Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
DATABASE_URL=your-production-database-url
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Supabase Settings

1. Update **Site URL** to your production domain
2. Add production domain to **Redirect URLs**
3. Enable **Email confirmations** if not already enabled
4. Consider enabling **CAPTCHA** for bot protection

### Security Checklist

- [ ] Environment variables secured (not in git)
- [ ] HTTPS enabled
- [ ] Email verification enabled
- [ ] Rate limiting configured
- [ ] RLS policies applied to database tables
- [ ] Storage bucket policies configured
- [ ] OAuth credentials rotated (if using)

---

## 12. Next Steps

After basic setup is complete:

1. **Customize Email Templates** in Supabase
2. **Set up OAuth providers** (Google, Apple, etc.)
3. **Configure password reset flow**
4. **Add admin approval workflow** for seller verification
5. **Set up monitoring** and error tracking
6. **Configure backup strategy** for database

---

## Support

For issues or questions:

1. Check the [QA Validation Report](./QA_VALIDATION_REPORT.md)
2. Review E2E tests in `e2e/` directory
3. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)

---

## Quick Reference

### File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   ├── buyer/route.ts
│   │   │   │   └── seller/route.ts
│   │   │   └── check-email/route.ts
│   │   └── upload/route.ts
│   └── register/page.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validations/
│   │   └── auth.ts
│   └── services/
│       └── authService.ts
├── components/
│   └── auth/
│       ├── PasswordStrengthIndicator.tsx
│       └── FileUpload.tsx
└── infrastructure/
    └── database/
        └── migrations/
            └── 002_complete_schema.sql
```

### Key Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Run tests
npm test
npm run test:e2e

# Database migrations
npm run migrate

# Linting
npm run lint
```

---

**Setup Complete! 🎉**

Your registration flow is now ready to accept buyers and sellers!

