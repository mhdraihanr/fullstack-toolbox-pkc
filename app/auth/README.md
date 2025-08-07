# Authentication System - Web Toolbox PKC

Sistem authentication lengkap menggunakan Supabase untuk aplikasi Web Toolbox PKC.

## 🚀 Fitur Authentication

### ✅ Halaman yang Tersedia
- **Login** (`/auth/login`) - Halaman masuk untuk pengguna
- **Register** (`/auth/register`) - Halaman pendaftaran akun baru
- **Forgot Password** (`/auth/forgot-password`) - Halaman lupa password
- **Reset Password** (`/auth/reset-password`) - Halaman reset password

### ✅ Fitur Keamanan
- **Protected Routes** - Middleware otomatis melindungi halaman yang memerlukan authentication
- **Auto Redirect** - Redirect otomatis ke dashboard jika sudah login
- **Session Management** - Manajemen session dengan Supabase
- **Password Reset** - Flow reset password via email
- **Form Validation** - Validasi form di client-side
- **Profile Management** - Otomatis sync data profile dari database
- **Context Provider** - State management global untuk auth dan profile
- **Error Handling** - Enhanced error handling dengan pesan spesifik

## 📁 Struktur Folder

```
app/auth/
├── login/
│   └── page.tsx              # Halaman login
├── register/
│   └── page.tsx              # Halaman register
├── forgot-password/
│   └── page.tsx              # Halaman lupa password
├── reset-password/
│   └── page.tsx              # Halaman reset password
├── demo/
│   └── page.tsx              # Demo halaman untuk testing auth
└── README.md                 # Dokumentasi ini

components/providers/
└── AuthProvider.tsx          # Context provider untuk authentication

lib/supabase/
├── client.ts                 # Supabase client untuk browser
└── server.ts                 # Supabase client untuk server

middleware.ts                 # Middleware untuk route protection
.env.example                  # Template environment variables
supabase-setup.sql            # SQL script untuk setup database
```

## ⚙️ Setup dan Konfigurasi

### 1. Install Dependencies

Dependencies sudah terinstall:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase SSR helpers untuk Next.js

### 2. Environment Variables

Buat file `.env.local` berdasarkan `.env.example`:

```bash
# Copy template
cp .env.example .env.local
```

Isi dengan konfigurasi Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Supabase Database

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  department TEXT,
  role TEXT DEFAULT 'employee',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, department, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'department',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Setup AuthProvider

Pastikan aplikasi Anda dibungkus dengan AuthProvider di `app/layout.tsx`:

```typescript
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 5. Konfigurasi Supabase Auth

Di Supabase Dashboard > Authentication > Settings:

1. **Site URL**: `http://localhost:3000` (development)
2. **Redirect URLs**: 
   - `http://localhost:3000/auth/reset-password`
   - `https://yourdomain.com/auth/reset-password` (production)

## 🔐 Cara Penggunaan

### AuthProvider Context

Sistem authentication menggunakan React Context untuk state management global:

```typescript
import { useAuth } from '@/components/providers/AuthProvider';

function MyComponent() {
  const { user, profile, session, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Welcome, {profile?.name || user?.email}!</p>
      <p>Department: {profile?.department}</p>
      <p>Role: {profile?.role}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

#### AuthProvider Interface

AuthProvider menyediakan interface berikut:

```typescript
interface AuthContextType {
  user: User | null;           // Supabase user object
  profile: UserProfile | null; // Profile data dari database
  session: Session | null;     // Supabase session
  loading: boolean;           // Loading state
  signOut: () => Promise<void>; // Logout function
}

interface UserProfile {
  id: string;
  name: string | null;
  department: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

#### Fitur AuthProvider

- **Auto Profile Sync**: Otomatis fetch profile data saat user login
- **Real-time Updates**: Profile data ter-update otomatis saat ada perubahan
- **Loading States**: Menyediakan loading state untuk UI yang responsive
- **Error Handling**: Handle error dengan graceful fallback
- **Session Management**: Sinkronisasi dengan Supabase session

### Login
```typescript
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Register
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe',
      department: 'IT',
      role: 'employee'
    }
  }
});
```

### Logout
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User & Profile
```typescript
const { data: { user } } = await supabase.auth.getUser();

// Profile data otomatis tersedia melalui AuthProvider
const { user, profile } = useAuth();
```

## 🛡️ Route Protection

Middleware otomatis melindungi routes berikut:
- `/dashboard/*`
- `/tasks/*`
- `/meetings/*`
- `/notulensi/*`
- `/analytics/*`
- `/attendance/*`

Jika user belum login, akan diarahkan ke `/auth/login`.

## 🎨 UI Components

Semua halaman auth menggunakan:
- **Tailwind CSS** untuk styling
- **Responsive design** untuk mobile dan desktop
- **Loading states** dengan spinner
- **Error handling** dengan pesan yang jelas
- **Success states** dengan konfirmasi

## 📱 Flow Authentication

### 1. Login Flow
1. User mengisi email dan password
2. Validasi form di client-side
3. Request ke Supabase Auth
4. Jika berhasil, redirect ke dashboard
5. Jika gagal, tampilkan error

### 2. Register Flow
1. User mengisi data lengkap
2. Validasi password match
3. Request signup ke Supabase
4. Trigger otomatis membuat profile
5. Email verifikasi dikirim
6. User verify email untuk aktivasi

### 3. Reset Password Flow
1. User input email di forgot password
2. Supabase kirim email reset
3. User klik link di email
4. Redirect ke reset password page
5. User input password baru
6. Password berhasil diubah

## 🔧 Troubleshooting

### Error: "Invalid login credentials"
- Pastikan email dan password benar
- Cek apakah user sudah verify email

### Error: "Email not confirmed"
- User harus verify email terlebih dahulu
- Cek spam folder untuk email verifikasi

### Error: "Invalid or expired token"
- Link reset password sudah expired
- Minta reset password baru

### Error: "Database error saving new user"
- Pastikan database sudah di-setup dengan `supabase-setup.sql`
- Cek apakah table `profiles` sudah dibuat
- Verifikasi trigger `on_auth_user_created` berfungsi

### Profile data tidak muncul
- Pastikan AuthProvider sudah di-setup di `app/layout.tsx`
- Cek apakah RLS policies sudah dikonfigurasi dengan benar
- Verifikasi user sudah login dan session aktif

### TypeScript error: "Property 'profile' does not exist"
- Pastikan menggunakan `useAuth()` hook dari AuthProvider
- Cek import path: `@/components/providers/AuthProvider`

### Middleware tidak bekerja
- Pastikan file `middleware.ts` ada di root project
- Cek konfigurasi matcher di middleware

## 🚀 Deployment

### Environment Variables Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### Redirect URLs Production
Tambahkan domain production di Supabase Dashboard:
- `https://yourdomain.com/auth/reset-password`

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

## 🎯 Update Terbaru

### AuthProvider Enhancement
- ✅ **Profile Management**: Otomatis sync data profile dari database
- ✅ **Context Provider**: State management global untuk auth dan profile
- ✅ **Enhanced Error Handling**: Pesan error yang lebih spesifik dan informatif
- ✅ **TypeScript Support**: Full type safety untuk auth dan profile data
- ✅ **Real-time Sync**: Profile data ter-update otomatis

### Files yang Diupdate
- `components/providers/AuthProvider.tsx` - Context provider dengan profile management
- `app/auth/register/page.tsx` - Enhanced error handling
- `supabase-setup.sql` - Database setup script yang kompatibel

**Catatan**: Sistem authentication ini sudah siap digunakan dan terintegrasi dengan aplikasi Web Toolbox PKC. Pastikan untuk:
1. Mengkonfigurasi environment variables
2. Menjalankan `supabase-setup.sql` di Supabase Dashboard
3. Setup AuthProvider di `app/layout.tsx`
4. Menggunakan `useAuth()` hook untuk mengakses auth dan profile data