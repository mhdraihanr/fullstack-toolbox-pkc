# Web Toolbox PKC

A comprehensive web application for managing tasks, meetings, and documentation for PKC (PT Pupuk Kujang Cikampek).

## 🚀 Quick Start

### 1. Setup Supabase Authentication

**PENTING:** Sebelum menjalankan aplikasi, Anda perlu setup Supabase untuk authentication.

📖 **Ikuti panduan lengkap di:** [`SUPABASE_SETUP.md`](./migrations/SUPABASE_SETUP.md)

Atau ringkasan singkat:

1. Buat project di [supabase.com](https://supabase.com)
2. Dapatkan Project URL dan Anon Key dari Dashboard > Settings > API
3. Update file `.env.local` dengan credentials Supabase Anda
4. Restart development server

### 2. Install Dependencies & Run

Sistem manajemen task dan meeting untuk perusahaan seperti PT Pupuk Kujang, terinspirasi dari Bordio.com dan Notion.com.

## 🎯 Fitur Utama

- **Task Management**: Membuat, mengelola, dan tracking task dengan notification otomatis
- **Meeting Management**: Penjadwalan meeting dengan reminder dan agenda
- **QR Code Attendance**: Peserta dapat bergabung meeting dengan scan QR code untuk check-in yang mudah
- **Meeting Analytics**: Analytics real-time untuk kehadiran meeting, metrik engagement, dan insight partisipasi
- **Notulensi**: Pembuatan notulensi yang dapat diexport ke PDF dan dikirim via WhatsApp/Email
- **Notification System**: Reminder otomatis untuk task dan meeting yang belum selesai
- **Multi-Role Support**: Admin, Manager, dan Employee dengan permission yang berbeda
- **Real-time Dashboard**: Live tracking kehadiran dan visualisasi analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.4 with React 19.1.0 and TypeScript
- **Styling**: Tailwind CSS v4 with Tailwind plugins
- **UI Components**: Radix UI primitives with custom components
- **Icons**: Heroicons and Lucide React
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with SSR support
- **State Management**: React hooks and context
- **Theme**: Next-themes for dark/light mode
- **Development**: Turbopack for fast development builds
- **PDF Generation**: Puppeteer for server-side PDF generation

## 🎨 Design Inspiration

This project draws design inspiration from:

- **Bordio.com**: Clean task management interface and user experience
- **Notion.com**: Flexible content organization and modern UI patterns
- **Modern Analytics Dashboards**: Real-time data visualization and interactive charts
- **QR Code Solutions**: Seamless mobile-first attendance tracking

With additional features tailored for Indonesian corporate environments, including WhatsApp integration for meeting notulensi distribution and QR code-based attendance system.

## 📁 Project Structure

```
web-toolbox-pkc/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── meetings/          # Meeting management
│   ├── notulensi/         # Meeting minutes
│   └── tasks/             # Task management
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── features/          # Feature-specific components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── ui/                # Base UI components
├── docs/                  # Project documentation
├── lib/                   # Utility libraries
│   ├── hooks/             # Custom React hooks
│   └── supabase/          # Supabase configuration
├── migrations/            # Database setup files
├── public/                # Static assets
├── store/                 # State management
└── types/                 # TypeScript type definitions
```

## 📚 Dokumentasi Lengkap

Untuk memahami project dari hulu ke hilir, silakan baca dokumentasi lengkap di folder [`docs/`](./docs/):

- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Peta arsitektur dan struktur folder
- **[API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - Fungsi, komponen, dan endpoint API
- **[LOGIC_FLOW.md](./docs/LOGIC_FLOW.md)** - Alur bisnis dan perjalanan pengguna
- **[README.md](./docs/README.md)** - Overview dokumentasi

### Setup Guides

- **[SUPABASE_SETUP.md](./migrations/SUPABASE_SETUP.md)** - Panduan setup Supabase authentication
- **[Database Migrations](./migrations/)** - SQL setup files untuk database schema

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account (for authentication and database)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd web-toolbox-pkc
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   - Copy `.env.local` and update with your Supabase credentials
   - Follow the [Supabase Setup Guide](./migrations/SUPABASE_SETUP.md) for detailed instructions

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code quality checks

## 🔧 Troubleshooting

### Common Issues

**Authentication not working:**

- Verify Supabase credentials in `.env.local`
- Check if Supabase project is active
- Ensure redirect URLs are configured correctly

**Database connection errors:**

- Run database migrations from `./migrations/` folder
- Check Supabase project status
- Verify database permissions

**Build errors:**

- Clear `.next` folder and rebuild
- Check TypeScript errors with `pnpm lint`
- Ensure all dependencies are installed

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to [Vercel](https://vercel.com)
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

## 📖 Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js)

### Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for PKC (Pusat Kajian Cyber)**
