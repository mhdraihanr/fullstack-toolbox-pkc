# Notulensi Supabase Integration

Dokumentasi ini menjelaskan cara mengintegrasikan sistem notulensi dengan Supabase untuk Web Toolbox PKC.

## Prerequisites

1. Akun Supabase aktif
2. Project Supabase sudah dibuat
3. Sistem meetings sudah terintegrasi (lihat `MEETINGS_SUPABASE_INTEGRATION.md`)
4. Environment variables sudah dikonfigurasi di `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Puppeteer untuk PDF export (akan diinstall otomatis)

## Database Setup

### 1. Jalankan SQL Script

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Navigasi ke **SQL Editor**
4. Buat query baru dan copy-paste isi dari `notulensi-setup.sql`
5. Jalankan script tersebut

### 2. Verifikasi Tabel

Pastikan tabel-tabel berikut sudah terbuat:
- `notulensi` - Tabel utama untuk data notulensi
- `action_items` - Tabel untuk action items dari notulensi

### 3. Struktur Tabel

#### Tabel `notulensi`
```sql
id uuid PRIMARY KEY
meeting_id uuid REFERENCES meetings(id) NOT NULL
content text NOT NULL
decisions text[]
next_meeting_date timestamptz
created_by uuid REFERENCES profiles(id) NOT NULL
approved_by uuid REFERENCES profiles(id)
approved_at timestamptz
is_draft boolean DEFAULT false
created_at timestamptz
updated_at timestamptz
```

#### Tabel `action_items`
```sql
id uuid PRIMARY KEY
notulensi_id uuid REFERENCES notulensi(id) NOT NULL
description text NOT NULL
assignee_id uuid REFERENCES profiles(id)
due_date timestamptz
priority text DEFAULT 'medium'
status text DEFAULT 'pending'
completed_at timestamptz
created_at timestamptz
```

### 4. Views dan Functions

#### View `notulensi_with_details`
View yang menggabungkan data notulensi dengan informasi meeting, creator, dan approver.

#### View `action_items_with_details`
View yang menggabungkan data action items dengan informasi assignee dan meeting.

#### Function `get_notulensi_stats`
Function untuk mendapatkan statistik notulensi user.

## Row Level Security (RLS)

### Policies yang Diterapkan

#### Notulensi Table
- **View**: Semua authenticated users dapat melihat notulensi
- **Create**: Users dapat membuat notulensi untuk meeting yang valid
- **Update**: Creator, approver, atau admin/manager dapat update
- **Delete**: Creator dapat delete (hanya jika belum disetujui) atau admin/manager

#### Action Items Table
- **View**: Semua authenticated users dapat melihat action items
- **Manage**: Assignee dapat update action items mereka, creator/approver notulensi atau admin/manager dapat manage semua

## API Endpoints

Setelah setup database, API endpoints berikut akan tersedia:

### Notulensi
- `GET /api/notulensi` - List semua notulensi dengan filtering
- `POST /api/notulensi` - Buat notulensi baru
- `GET /api/notulensi/[id]` - Detail notulensi
- `PUT /api/notulensi/[id]` - Update notulensi
- `DELETE /api/notulensi/[id]` - Hapus notulensi
- `GET /api/notulensi/[id]/export` - Export notulensi ke PDF

### Query Parameters untuk GET /api/notulensi
- `page` - Halaman (default: 1)
- `limit` - Limit per halaman (default: 10)
- `approved` - Filter berdasarkan status approval (true/false)
- `created_by` - Filter berdasarkan creator
- `meeting_id` - Filter berdasarkan meeting
- `search` - Search dalam content dan decisions
- `is_draft` - Filter draft (true/false)
- `date_from` - Filter tanggal mulai
- `date_to` - Filter tanggal akhir

## Frontend Integration

### Types
Tipe TypeScript sudah didefinisikan di `types/index.ts`:
- `Notulensi`
- `ActionItem`
- `NotulensiFormData`

### Hooks
Custom hooks tersedia di `lib/hooks/`:
- `useNotulensi` - Manage notulensi data dengan fitur lengkap

#### useNotulensi Features
```typescript
const {
  notulensi,           // Array notulensi
  allNotulensi,        // All notulensi (unfiltered)
  loading,             // Loading state
  error,               // Error state
  pagination,          // Pagination info
  refetch,             // Refetch function
  createNotulensi,     // Create function
  updateNotulensi,     // Update function
  deleteNotulensi,     // Delete function
  approveNotulensi,    // Approve function
  unapproveNotulensi,  // Unapprove function
  exportToPDF          // Export to PDF function
} = useNotulensi(options);
```

### Pages
- `/notulensi` - List notulensi
- `/notulensi/create` - Buat notulensi baru
- `/notulensi/[id]` - Detail notulensi
- `/notulensi/[id]/edit` - Edit notulensi

## Features

### Core Features
1. **CRUD Notulensi** - Create, Read, Update, Delete notulensi
2. **Draft System** - Save sebagai draft sebelum finalisasi
3. **Approval Workflow** - Sistem approval dengan approver
4. **Action Items Management** - Manage action items dengan assignee dan due date
5. **Rich Content** - Support rich text content untuk notulensi
6. **Meeting Integration** - Terintegrasi penuh dengan sistem meetings

### Advanced Features
1. **PDF Export** - Export notulensi ke PDF dengan format profesional
2. **Search & Filter** - Advanced search dan filtering
3. **Statistics** - Dashboard statistik notulensi
4. **Real-time Updates** - Menggunakan Supabase realtime
5. **Priority Management** - Priority system untuk action items
6. **Due Date Tracking** - Track overdue action items

### PDF Export Features
1. **Professional Layout** - Layout profesional dengan header dan footer
2. **Complete Information** - Semua informasi meeting dan notulensi
3. **Action Items Table** - Tabel action items dengan status dan priority
4. **Signature Section** - Section untuk tanda tangan creator dan approver
5. **Auto Filename** - Filename otomatis berdasarkan meeting dan tanggal

## Security

1. **Row Level Security** - Semua tabel menggunakan RLS
2. **Authentication Required** - Semua operations memerlukan authentication
3. **Role-based Access** - Admin/manager memiliki akses lebih luas
4. **Approval Control** - Hanya approved notulensi yang tidak bisa diedit sembarangan
5. **Data Validation** - Server-side validation untuk semua input

## Installation Dependencies

Untuk PDF export, tambahkan dependency berikut:

```bash
npm install puppeteer
# atau
yarn add puppeteer
```

## Usage Examples

### Membuat Notulensi Baru
```typescript
const { createNotulensi } = useNotulensi();

const newNotulensi = await createNotulensi({
  meeting_id: 'meeting-uuid',
  content: 'Isi notulensi...',
  decisions: ['Keputusan 1', 'Keputusan 2'],
  action_items: [
    {
      description: 'Task 1',
      assignee_id: 'user-uuid',
      due_date: '2024-02-01',
      priority: 'high',
      status: 'pending'
    }
  ],
  is_draft: false
});
```

### Export ke PDF
```typescript
const { exportToPDF } = useNotulensi();

const success = await exportToPDF('notulensi-uuid');
if (success) {
  // PDF akan otomatis didownload
}
```

### Approve Notulensi
```typescript
const { approveNotulensi } = useNotulensi();

const approved = await approveNotulensi('notulensi-uuid');
```

## Testing

1. Buat meeting baru
2. Buat notulensi untuk meeting tersebut
3. Tambahkan action items
4. Test approval workflow
5. Test PDF export
6. Verify search dan filtering

## Troubleshooting

### Common Issues

1. **PDF Export Error**
   - Pastikan Puppeteer terinstall dengan benar
   - Check server memory untuk large PDFs
   - Verify content tidak mengandung karakter invalid

2. **Meeting Not Found**
   - Pastikan meeting_id valid dan exists
   - Check permissions untuk meeting

3. **Approval Permission Error**
   - Verify user memiliki permission untuk approve
   - Check RLS policies

4. **Action Items Not Saving**
   - Check assignee_id valid
   - Verify action items format

### Debug Tips

1. Check Supabase logs di dashboard
2. Use browser developer tools untuk network requests
3. Verify PDF generation di server logs
4. Test API endpoints dengan Postman/curl
5. Check Puppeteer installation: `node -e "console.log(require('puppeteer'))"`

## Performance Optimization

1. **Pagination** - Gunakan pagination untuk large datasets
2. **Client-side Search** - Untuk better UX pada small datasets
3. **PDF Caching** - Consider caching PDF untuk notulensi yang tidak berubah
4. **Index Optimization** - Database indexes sudah dioptimalkan

## Migration dari Sistem Lain

Jika Anda migrasi dari sistem notulensi lain:

1. Export data dalam format JSON/CSV
2. Transform data sesuai schema Supabase
3. Import meetings terlebih dahulu
4. Import notulensi dengan meeting_id yang benar
5. Import action items
6. Verify data integrity
7. Test PDF export functionality

## Best Practices

1. **Draft First** - Selalu buat sebagai draft dulu sebelum finalisasi
2. **Regular Approval** - Setup workflow approval yang jelas
3. **Action Items Follow-up** - Regular follow-up untuk overdue action items
4. **PDF Backup** - Export PDF untuk backup dan distribusi
5. **Search Optimization** - Gunakan keywords yang jelas dalam content

## Monitoring

1. Monitor PDF generation performance
2. Track approval workflow metrics
3. Monitor action items completion rate
4. Check storage usage untuk PDF exports
5. Monitor API response times