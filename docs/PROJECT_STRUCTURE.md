# Project Structure - Web Toolbox PKC

## Overview

Web Toolbox PKC adalah aplikasi task management untuk perusahaan seperti PT Pupuk Kujang, terinspirasi dari Bordio.com dan Notion.com. Aplikasi ini memungkinkan manajemen task, reminder untuk meeting, dan pembuatan notulensi yang dapat diexport ke PDF atau dikirim via WhatsApp/Email.

## Technology Stack

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Runtime**: React 19.1.0
- **Build Tool**: Turbopack
- **Linting**: ESLint
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage

## Project Architecture

```
web-toolbox-pkc/
├── app/                          # Next.js App Router directory
│   ├── globals.css              # Global styles with Tailwind
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home page
│   └── favicon.ico              # App icon
├── components/                   # Reusable UI components (to be created)
│   ├── ui/                      # Basic UI components
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   └── features/                # Feature-specific components
├── lib/                         # Utility functions and configurations
│   ├── utils.ts                 # General utilities
│   ├── db/                      # Database configurations
│   └── api/                     # API utilities
├── types/                       # TypeScript type definitions
├── hooks/                       # Custom React hooks
├── store/                       # State management (Zustand/Redux)
├── public/                      # Static assets
│   ├── icons/                   # SVG icons
│   └── images/                  # Images
├── docs/                        # Documentation files
│   ├── PROJECT_STRUCTURE.md    # This file
│   ├── API_DOCUMENTATION.md    # API documentation
│   └── LOGIC_FLOW.md           # Business logic flow
└── config files                 # Configuration files
```

## Core Features Architecture

### 1. Task Management System

```
app/
├── tasks/
│   ├── page.tsx                 # Task list view
│   ├── [id]/
│   │   └── page.tsx            # Task detail view
│   ├── create/
│   │   └── page.tsx            # Create task form
│   └── components/
│       ├── TaskCard.tsx        # Individual task component
│       ├── TaskList.tsx        # Task list component
│       └── TaskForm.tsx        # Task creation/edit form
```

### 2. Meeting & Notification System

```
app/
├── meetings/
│   ├── page.tsx                 # Meeting list
│   ├── [id]/
│   │   └── page.tsx            # Meeting detail
│   └── components/
│       ├── MeetingCard.tsx     # Meeting component
│       └── NotificationBell.tsx # Notification component
```

### 3. Notulensi System

```
app/
├── notulensi/
│   ├── page.tsx                 # Notulensi list
│   ├── [id]/
│   │   ├── page.tsx            # View notulensi
│   │   └── edit/
│   │       └── page.tsx        # Edit notulensi
│   └── components/
│       ├── NotulensiEditor.tsx   # Rich text editor
│       ├── PDFExport.tsx       # PDF generation
│       └── ShareOptions.tsx    # WhatsApp/Email sharing
```

### 4. Dashboard & Analytics

```
app/
├── dashboard/
│   ├── page.tsx                 # Main dashboard
│   └── components/
│       ├── StatsCards.tsx      # Statistics cards
│       ├── RecentTasks.tsx     # Recent tasks widget
│       ├── UpcomingMeetings.tsx # Upcoming meetings widget
│       └── AnalyticsCharts.tsx # Meeting analytics charts
├── analytics/
│   ├── page.tsx                 # Analytics overview
│   ├── meetings/
│   │   └── page.tsx            # Meeting analytics detail
│   └── components/
│       ├── AttendanceChart.tsx # Attendance analytics
│       ├── ParticipationRate.tsx # Participation metrics
│       └── MeetingInsights.tsx # Meeting insights
```

### 5. QR Code & Attendance System

```
app/
├── attendance/
│   ├── scan/
│   │   └── page.tsx            # QR code scanner
│   ├── [meetingId]/
│   │   └── page.tsx            # Meeting check-in page
│   └── components/
│       ├── QRScanner.tsx       # QR code scanner component
│       ├── QRGenerator.tsx     # QR code generator
│       └── AttendanceList.tsx  # Real-time attendance list
```

## Supabase Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('admin', 'VP', 'AVP','employee')) DEFAULT 'employee',
  department VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
  priority VARCHAR CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assignee_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Meetings Table

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60,
  status VARCHAR CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'scheduled',
  location VARCHAR,
  meeting_type VARCHAR CHECK (meeting_type IN ('onsite', 'virtual', 'hybrid')) DEFAULT 'onsite',
  qr_code_url VARCHAR,
  qr_code_expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  agenda TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Meeting Participants Table

```sql
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status VARCHAR CHECK (status IN ('invited', 'accepted', 'declined', 'tentative')) DEFAULT 'invited',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Meeting Attendance Table

```sql
CREATE TABLE meeting_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_in_method VARCHAR CHECK (check_in_method IN ('qr_code', 'manual', 'auto')) DEFAULT 'qr_code',
  location_lat DECIMAL,
  location_lng DECIMAL,
  device_info JSONB
);
```

### Notulensi Table

```sql
CREATE TABLE notulensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  decisions TEXT[],
  next_meeting_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Action Items Table

```sql
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notulensi_id UUID REFERENCES notulensi(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assignee_id UUID REFERENCES users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  priority VARCHAR CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status VARCHAR CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR CHECK (type IN ('task', 'meeting', 'reminder', 'system')) NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Meeting Analytics Table

```sql
CREATE TABLE meeting_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  total_invited INTEGER DEFAULT 0,
  total_attended INTEGER DEFAULT 0,
  attendance_rate DECIMAL DEFAULT 0,
  average_check_in_time INTERVAL,
  late_arrivals INTEGER DEFAULT 0,
  early_departures INTEGER DEFAULT 0,
  engagement_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration Files

- **package.json**: Dependencies and scripts
- **tsconfig.json**: TypeScript configuration
- **tailwind.config.js**: Tailwind CSS configuration
- **next.config.ts**: Next.js configuration
- **eslint.config.mjs**: ESLint configuration
- **.env.local**: Environment variables (Supabase keys, API keys)
- **supabase/**: Supabase configuration and migrations
  - **config.toml**: Supabase project configuration
  - **migrations/**: Database migration files
  - **seed.sql**: Initial data seeding

## Development Workflow

1. **Development**: `pnpm run dev` (with Turbopack)
2. **Build**: `pnpm run build`
3. **Start**: `pnpm run start`
4. **Lint**: `pnpm run lint`

## Deployment Strategy

- **Platform**: Vercel (recommended for Next.js)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for PDF and QR codes)
- **Email Service**: SendGrid/Nodemailer
- **WhatsApp Integration**: WhatsApp Business API
- **QR Code Generation**: qrcode.js library
- **QR Code Scanning**: @zxing/library or html5-qrcode

## Security Considerations

- Environment variables for sensitive data
- Authentication system (NextAuth.js)
- Role-based access control
- Input validation and sanitization
- CSRF protection

## Performance Optimization

- Server-side rendering with Next.js
- Image optimization with next/image
- Code splitting and lazy loading
- Caching strategies
- Database query optimization

This structure provides a solid foundation for building a comprehensive task management and meeting documentation system for PT Pupuk Kujang.
