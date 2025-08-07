# Logic Flow - Web Toolbox PKC

## Overview

Dokumen ini menjelaskan alur bisnis dan perjalanan pengguna (user journey) dalam aplikasi Web Toolbox PKC. Aplikasi ini dirancang untuk memfasilitasi manajemen task, meeting, dan dokumentasi notulensi untuk perusahaan seperti PT Pupuk Kujang.

## User Roles & Permissions

### 1. Admin

- Mengelola semua user dan departemen
- Akses penuh ke semua task dan meeting
- Konfigurasi sistem dan notifikasi
- Export data dan laporan

### 2. Manager

- Membuat dan mengelola task untuk tim
- Mengatur meeting dan notulensi
- Melihat progress tim dan laporan
- Approve task completion

### 3. Employee

- Melihat dan mengerjakan task yang ditugaskan
- Berpartisipasi dalam meeting
- Update status task
- Melihat notifikasi dan reminder

## Core Business Flows

### 1. User Authentication Flow

```mermaid
flowchart TD
    A[User Access App] --> B{Authenticated?}
    B -->|No| C[Login Page]
    B -->|Yes| D[Dashboard]
    C --> E[Enter Credentials]
    E --> F{Valid Credentials?}
    F -->|No| G[Show Error Message]
    F -->|Yes| H[Generate JWT Token]
    G --> C
    H --> I[Set Session]
    I --> D
    D --> J[Load User Data]
    J --> K[Show Personalized Dashboard]
```

**Steps:**

1. User mengakses aplikasi
2. Sistem cek authentication status
3. Jika belum login, redirect ke login page
4. User input email dan password
5. Sistem validasi credentials
6. Jika valid, generate JWT token dan set session
7. Redirect ke dashboard dengan data user

### 2. Task Management Flow

#### 2.1 Task Creation Flow

```mermaid
flowchart TD
    A[Manager/Admin Click Create Task] --> B[Open Task Form]
    B --> C[Fill Task Details]
    C --> D[Select Assignee]
    D --> E[Set Priority & Due Date]
    E --> F[Add Tags/Categories]
    F --> G[Submit Form]
    G --> H{Validation Passed?}
    H -->|No| I[Show Validation Errors]
    H -->|Yes| J[Save Task to Database]
    I --> C
    J --> K[Send Notification to Assignee]
    K --> L[Update Dashboard]
    L --> M[Show Success Message]
```

**Business Rules:**

- Hanya Manager dan Admin yang bisa membuat task
- Task harus memiliki title, assignee, dan due date
- Priority default adalah 'medium'
- Notification otomatis dikirim ke assignee
- Task dengan priority 'urgent' mendapat notifikasi khusus

#### 2.2 Task Execution Flow

```mermaid
flowchart TD
    A[Employee Receives Task Notification] --> B[Open Task Details]
    B --> C[Review Task Requirements]
    C --> D[Start Working on Task]
    D --> E[Update Status to 'In Progress']
    E --> F[Work on Task]
    F --> G{Task Completed?}
    G -->|No| H[Continue Working]
    G -->|Yes| I[Update Status to 'Completed']
    H --> F
    I --> J[Add Completion Notes]
    J --> K[Submit for Review]
    K --> L[Notify Manager]
    L --> M{Manager Approval?}
    M -->|Rejected| N[Send Back with Comments]
    M -->|Approved| O[Mark as Final Completed]
    N --> F
    O --> P[Update Statistics]
```

**Business Rules:**

- Employee hanya bisa update task yang ditugaskan kepada mereka
- Status change otomatis trigger notifikasi ke manager
- Task yang overdue mendapat highlight khusus
- Completion memerlukan approval dari manager (opsional)

### 3. Meeting Management Flow

#### 3.1 Meeting Scheduling Flow

```mermaid
flowchart TD
    A[Manager Creates Meeting] --> B[Set Meeting Details]
    B --> C[Add Participants]
    C --> D[Set Agenda Items]
    D --> E[Choose Meeting Type]
    E --> F[Schedule Date & Time]
    F --> G[Send Invitations]
    G --> H[Participants Receive Notification]
    H --> I{Participant Response}
    I -->|Accept| J[Add to Calendar]
    I -->|Decline| K[Update Attendance List]
    I -->|Tentative| L[Mark as Maybe]
    J --> M[Meeting Confirmed]
    K --> M
    L --> M
    M --> N[Send Reminder 24h Before]
    N --> O[Send Reminder 1h Before]
```

**Business Rules:**

- Meeting harus memiliki minimal 2 participants
- Reminder otomatis dikirim 24 jam dan 1 jam sebelum meeting
- Participants bisa decline dengan alasan
- Meeting bisa virtual, onsite, atau hybrid

#### 3.2 QR Code Generation Flow

```mermaid
flowchart TD
    A[Meeting Created/Updated] --> B[Generate QR Code]
    B --> C[Set Expiration Time]
    C --> D[Store QR Data in Database]
    D --> E[Generate QR Image]
    E --> F[Upload to Supabase Storage]
    F --> G[Return QR Code URL]
    G --> H[Display QR Code to Organizer]
    H --> I[Share QR Code with Participants]
    I --> J{Meeting Started?}
    J -->|Yes| K[Activate QR Code]
    J -->|No| L[QR Code Inactive]
    K --> M[Enable Check-in]
    L --> N[Wait for Meeting Start]
    N --> J
```

#### 3.3 Meeting Check-in Flow

```mermaid
flowchart TD
    A[Participant Scans QR Code] --> B[Validate QR Token]
    B --> C{Token Valid?}
    C -->|No| D[Show Error Message]
    C -->|Yes| E[Check Meeting Status]
    D --> F[Redirect to Manual Check-in]
    E --> G{Meeting Active?}
    G -->|No| H[Show Meeting Not Started]
    G -->|Yes| I[Get User Location]
    H --> F
    I --> J[Record Check-in Time]
    J --> K[Save to Database]
    K --> L[Update Real-time Attendance]
    L --> M[Send Notification to Organizer]
    M --> N[Show Success Message]
    N --> O[Display Meeting Details]
```

#### 3.4 Meeting Execution Flow

```mermaid
flowchart TD
    A[Meeting Time Arrives] --> B[Send Start Notification]
    B --> C[Activate QR Code Check-in]
    C --> D[Participants Join/Check-in]
    D --> E[Real-time Attendance Tracking]
    E --> F[Meeting Starts]
    F --> G[Follow Agenda Items]
    G --> H[Discuss Each Item]
    H --> I[Record Decisions]
    I --> J[Assign Action Items]
    J --> K{More Agenda Items?}
    K -->|Yes| H
    K -->|No| L[Meeting Ends]
    L --> M[Generate Attendance Report]
    M --> N[Create Notulensi Draft]
    N --> O[Calculate Analytics]
```

### 4. Notulensi Flow

#### 4.1 Notulensi Creation Flow

```mermaid
flowchart TD
    A[Meeting Ends] --> B[Notulensi Taker Opens Editor]
    B --> C[Fill Notulensi Summary]
    C --> D[List Attendees]
    D --> E[Record Key Decisions]
    E --> F[Add Action Items]
    F --> G[Set Action Item Assignees]
    G --> H[Set Due Dates for Actions]
    H --> I[Review Content]
    I --> J{Content Complete?}
    J -->|No| K[Continue Editing]
    J -->|Yes| L[Save Draft]
    K --> C
    L --> M[Send for Review]
    M --> N{Manager Approval?}
    N -->|Needs Changes| O[Send Back with Comments]
    N -->|Approved| P[Finalize Notulensi]
    O --> C
    P --> Q[Distribute to Participants]
```

#### 4.2 Notulensi Distribution Flow

```mermaid
flowchart TD
    A[Notulensi Finalized] --> B[Generate PDF]
    B --> C[Create Distribution List]
    C --> D{Distribution Method}
    D -->|Email| E[Send Email with PDF]
    D -->|WhatsApp| F[Send WhatsApp with PDF]
    D -->|Both| G[Send Both Email & WhatsApp]
    E --> H[Log Email Delivery]
    F --> I[Log WhatsApp Delivery]
    G --> H
    G --> I
    H --> J[Update Delivery Status]
    I --> J
    J --> K[Create Action Item Tasks]
    K --> L[Notify Action Item Assignees]
```

**Business Rules:**

- Notulensi harus di-approve sebelum distribusi
- PDF otomatis di-generate saat finalisasi
- Action items otomatis menjadi task baru
- Delivery status di-track untuk audit

### 5. Notification & Reminder System

#### 5.1 Notification Trigger Flow

```mermaid
flowchart TD
    A[System Event Occurs] --> B{Event Type}
    B -->|Task Created| C[Notify Assignee]
    B -->|Task Due Soon| D[Notify Assignee & Manager]
    B -->|Task Overdue| E[Escalate to Manager]
    B -->|Meeting Scheduled| F[Notify Participants]
    B -->|Meeting Reminder| G[Send Reminder]
    B -->|Notulensi Available| H[Notify Participants]
    C --> I[Create Notification Record]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J[Send Push Notification]
    J --> K[Send Email if Configured]
    K --> L[Update Notification Status]
```

#### 5.2 Reminder Logic Flow

```mermaid
flowchart TD
    A[Daily Cron Job Runs] --> B[Check Upcoming Deadlines]
    B --> C[Check Tasks Due in 24h]
    C --> D[Check Tasks Due in 1h]
    D --> E[Check Overdue Tasks]
    E --> F[Check Upcoming Meetings]
    F --> G[Check Unfinished Action Items]
    G --> H[Generate Reminder List]
    H --> I[Send Batch Notifications]
    I --> J[Update Last Reminder Time]
```

**Reminder Rules:**

- Task reminder: 24 jam, 1 jam sebelum due date
- Meeting reminder: 24 jam, 1 jam sebelum meeting
- Overdue task: Daily reminder sampai completed
- Action item: Weekly reminder jika belum completed

### 6. Dashboard & Analytics Flow

#### 6.1 Dashboard Data Loading

```mermaid
flowchart TD
    A[User Opens Dashboard] --> B[Load User Role]
    B --> C{User Role}
    C -->|Employee| D[Load Personal Tasks]
    C -->|Manager| E[Load Team Overview]
    C -->|Admin| F[Load System Overview]
    D --> G[Load Personal Meetings]
    E --> H[Load Team Tasks & Meetings]
    F --> I[Load All Statistics]
    G --> J[Load Recent Notifications]
    H --> J
    I --> J
    J --> K[Render Dashboard Widgets]
    K --> L[Setup Real-time Updates]
```

#### 6.2 Analytics Calculation Flow

```mermaid
flowchart TD
    A[Analytics Request] --> B[Define Time Period]
    B --> C[Fetch Raw Data]
    C --> D[Calculate Task Metrics]
    D --> E[Calculate Meeting Metrics]
    E --> F[Calculate Productivity Metrics]
    F --> G[Generate Charts Data]
    G --> H[Cache Results]
    H --> I[Return Analytics]
```

**Analytics Metrics:**

- Task completion rate
- Average task duration
- Overdue task percentage
- Meeting attendance rate
- Action item completion rate
- Team productivity trends

### 7. Integration Flows

#### 7.1 WhatsApp Integration Flow

```mermaid
flowchart TD
    A[User Requests WhatsApp Share] --> B[Validate Phone Numbers]
    B --> C[Generate Message Content]
    C --> D[Attach PDF if Applicable]
    D --> E[Call WhatsApp Business API]
    E --> F{API Response}
    F -->|Success| G[Log Successful Delivery]
    F -->|Failed| H[Log Error & Retry]
    G --> I[Update Delivery Status]
    H --> J{Retry Count < 3?}
    J -->|Yes| K[Wait & Retry]
    J -->|No| L[Mark as Failed]
    K --> E
    L --> I
```

#### 7.2 Email Integration Flow

```mermaid
flowchart TD
    A[Email Send Request] --> B[Validate Email Addresses]
    B --> C[Generate Email Content]
    C --> D[Attach Files if Any]
    D --> E[Connect to SMTP Server]
    E --> F[Send Email]
    F --> G{Send Status}
    G -->|Success| H[Log Delivery]
    G -->|Failed| I[Log Error]
    H --> J[Update Status]
    I --> K[Schedule Retry]
    K --> L{Retry Attempts < 3?}
    L -->|Yes| E
    L -->|No| M[Mark as Failed]
    M --> J
```

### 8. Analytics & Reporting Flow

#### 8.1 Real-time Analytics Flow

```mermaid
flowchart TD
    A[User Checks-in] --> B[Update Attendance Table]
    B --> C[Trigger Analytics Calculation]
    C --> D[Calculate Attendance Rate]
    D --> E[Update Meeting Analytics]
    E --> F[Broadcast to Real-time Subscribers]
    F --> G[Update Dashboard Widgets]
    G --> H[Send Analytics Notifications]
    H --> I{Threshold Reached?}
    I -->|Low Attendance| J[Alert Organizer]
    I -->|Normal| K[Continue Monitoring]
    J --> L[Suggest Actions]
    K --> M[Update Charts]
    L --> M
```

#### 8.2 Analytics Dashboard Flow

```mermaid
flowchart TD
    A[User Opens Analytics] --> B[Select Time Period]
    B --> C[Choose Filters]
    C --> D[Fetch Meeting Data]
    D --> E[Fetch Attendance Data]
    E --> F[Calculate Metrics]
    F --> G[Generate Charts Data]
    G --> H[Render Visualizations]
    H --> I[Display Insights]
    I --> J{Export Requested?}
    J -->|Yes| K[Generate PDF Report]
    J -->|No| L[Enable Real-time Updates]
    K --> M[Download Report]
    L --> N[Subscribe to Updates]
```

#### 8.3 Attendance Analytics Calculation

```mermaid
flowchart TD
    A[Meeting Completed] --> B[Collect Attendance Data]
    B --> C[Calculate Basic Metrics]
    C --> D[Attendance Rate = Attended/Invited]
    D --> E[Late Arrival Rate = Late/Total]
    E --> F[Average Check-in Time]
    F --> G[Engagement Score Calculation]
    G --> H[Department Comparison]
    H --> I[Trend Analysis]
    I --> J[Store Analytics Results]
    J --> K[Update Dashboard]
    K --> L[Generate Insights]
    L --> M[Send Summary to Stakeholders]
```

### 9. Error Handling & Recovery

#### 8.1 System Error Flow

```mermaid
flowchart TD
    A[Error Occurs] --> B[Log Error Details]
    B --> C{Error Type}
    C -->|Database Error| D[Retry Connection]
    C -->|API Error| E[Retry Request]
    C -->|Validation Error| F[Return User-Friendly Message]
    C -->|System Error| G[Alert Admin]
    D --> H{Retry Successful?}
    E --> H
    H -->|Yes| I[Continue Operation]
    H -->|No| J[Fallback Procedure]
    F --> K[Show Error to User]
    G --> L[System Recovery Mode]
    J --> M[Notify User of Issue]
    L --> N[Attempt Auto-Recovery]
```

### 10. Data Backup & Recovery

#### 9.1 Backup Flow

```mermaid
flowchart TD
    A[Daily Backup Schedule] --> B[Create Database Snapshot]
    B --> C[Backup File Attachments]
    C --> D[Compress Backup Files]
    D --> E[Upload to Cloud Storage]
    E --> F[Verify Backup Integrity]
    F --> G{Backup Valid?}
    G -->|Yes| H[Update Backup Log]
    G -->|No| I[Retry Backup Process]
    H --> J[Clean Old Backups]
    I --> K{Retry Count < 3?}
    K -->|Yes| B
    K -->|No| L[Alert Admin]
```

### 11. QR Code Security Flow

#### 11.1 QR Code Validation Flow

```mermaid
flowchart TD
    A[QR Code Scanned] --> B[Extract Token & Meeting ID]
    B --> C[Validate Token Format]
    C --> D{Format Valid?}
    D -->|No| E[Return Invalid QR Error]
    D -->|Yes| F[Check Token in Database]
    E --> G[Log Security Event]
    F --> H{Token Exists?}
    H -->|No| I[Return Token Not Found]
    H -->|Yes| J[Check Expiration]
    I --> G
    J --> K{Token Expired?}
    K -->|Yes| L[Return Expired Token]
    K -->|No| M[Validate Meeting Status]
    L --> G
    M --> N{Meeting Active?}
    N -->|No| O[Return Meeting Inactive]
    N -->|Yes| P[Allow Check-in]
    O --> G
    P --> Q[Log Successful Validation]
```

#### 11.2 Anti-fraud Measures

```mermaid
flowchart TD
    A[Check-in Attempt] --> B[Validate Device Info]
    B --> C[Check Location if Required]
    C --> D[Verify User Identity]
    D --> E{Duplicate Check-in?}
    E -->|Yes| F[Block Duplicate]
    E -->|No| G[Check Rate Limiting]
    F --> H[Log Fraud Attempt]
    G --> I{Too Many Attempts?}
    I -->|Yes| J[Temporary Block]
    I -->|No| K[Allow Check-in]
    J --> H
    K --> L[Record Successful Check-in]
    H --> M[Alert Security Team]
    L --> N[Update Analytics]
```

## Performance Optimization Strategies

### 1. Database Optimization

- Index pada kolom yang sering di-query (user_id, due_date, status)
- Pagination untuk large datasets
- Database connection pooling
- Query optimization dan caching

### 2. Frontend Optimization

- Lazy loading untuk komponen besar
- Virtual scrolling untuk attendance lists
- Image optimization dengan next/image
- Code splitting per route
- Chart.js lazy loading untuk analytics
- QR scanner component lazy loading

### 3. Caching Strategy

- Supabase built-in caching
- Browser caching untuk static assets
- API response caching untuk analytics data
- Database query result caching
- QR code image caching
- Analytics dashboard data caching

### 4. Real-time Updates

- Supabase Realtime untuk live attendance updates
- WebSocket untuk live notifications
- Server-Sent Events untuk dashboard updates
- Optimistic UI updates untuk better UX
- Real-time analytics dashboard

### 5. QR Code Optimization

- QR code caching untuk reduce generation time
- Batch QR code generation untuk multiple meetings
- Compressed QR data untuk faster scanning
- Progressive image loading untuk QR displays

## Security Considerations

### 1. Authentication & Authorization

- JWT token dengan expiration
- Role-based access control (RBAC)
- Session management
- Password hashing dengan bcrypt

### 2. Data Protection

- Input validation dan sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens

### 3. File Security

- File type validation
- Virus scanning untuk uploads
- Secure file storage
- Access control untuk file downloads

### 4. Communication Security

- HTTPS enforcement
- API rate limiting
- Secure headers
- Environment variable protection

Dokumen ini memberikan panduan lengkap tentang alur bisnis dan logic flow dalam aplikasi Web Toolbox PKC, memastikan semua stakeholder memahami bagaimana sistem bekerja dari end-to-end.
