# Web Toolbox PKC

> A comprehensive web application for managing tasks, meetings, and documentation for PT Pupuk Kujang Cikampek

## ✨ Key Features

- **📱 Mobile-Friendly UI** – Fully responsive design optimized for mobile and tablet use
- **📋 Task Management** - Create, manage, and track tasks with automatic notifications
- **🤝 Meeting Management** - Schedule meetings with reminders and agenda
- **📝 Meeting Minutes (Notulensi)** - Generate and export meeting minutes to PDF
- **📊 Real-time Dashboard** - Live tracking and analytics visualization
- **🔐 Multi-Role Support** - Admin, Manager, and Employee permissions
- **🌙 Dark/Light Theme** - Modern UI with theme switching
  

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.4 + React 19.1.0 + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI + Custom Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Heroicons + Lucide React
- **PDF Generator**: Puppeteer
- **Development**: Turbopack

## 📁 Project Structure

```
web-toolbox-pkc/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── meetings/       # Meeting management
│   ├── notulensi/      # Meeting minutes
│   └── tasks/          # Task management
├── components/         # Reusable UI components
├── lib/               # Utilities & hooks
├── migrations/        # Database setup
└── types/             # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd web-toolbox-pkc

# Install dependencies
pnpm install

# Setup environment variables
# Copy .env.local and update with your Supabase credentials
# Follow: ./migrations/SUPABASE_SETUP.md

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
pnpm dev    # Start development server
pnpm build  # Build for production
pnpm start  # Start production server
pnpm lint   # Run ESLint
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for PT Pupuk Kujang Cikampek Toolbox**
