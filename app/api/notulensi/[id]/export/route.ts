import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import puppeteer from 'puppeteer';

// GET /api/notulensi/[id]/export - Export notulensi to PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch notulensi with all related data
    const { data: notulensi, error } = await supabase
      .from('notulensi')
      .select(`
        *,
        meeting:meeting_id(
          id,
          title,
          description,
          date_time,
          duration,
          status,
          location,
          meeting_type,
          agenda,
          creator:created_by(id, name, department, role, avatar_url),
          participants:meeting_participants(
            id,
            status,
            user:user_id(id, name, department, role, avatar_url)
          )
        ),
        creator:created_by(id, name, department, role, avatar_url),
        approver:approved_by(id, name, department, role, avatar_url),
        action_items:action_items(
          id,
          description,
          assignee_id,
          due_date,
          priority,
          status,
          completed_at,
          created_at,
          assignee:assignee_id(id, name, department, role, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !notulensi) {
      return NextResponse.json(
        { success: false, error: 'Notulensi not found' },
        { status: 404 }
      );
    }

    // Generate HTML content for PDF
    const htmlContent = generateNotulensiHTML(notulensi);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true
    });
    
    await browser.close();

    // Generate filename
    const meetingTitle = notulensi.meeting?.title || 'Notulensi';
    const date = new Date(notulensi.created_at).toISOString().split('T')[0];
    const filename = `Notulensi_${meetingTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`;

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error in GET /api/notulensi/[id]/export:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}

interface NotulensiWithDetails {
  id: string;
  content: string;
  decisions?: string[];
  next_meeting_date?: string;
  created_at: string;
  approved_at?: string;
  meeting?: {
    title?: string;
    date_time?: string;
    duration?: number;
    location?: string;
    meeting_type?: string;
    agenda?: string[];
    creator?: {
      name?: string;
    };
  };
  creator?: {
    name?: string;
  };
  approver?: {
    name?: string;
  };
  action_items?: {
    description: string;
    priority: string;
    status: string;
    due_date?: string;
    assignee?: {
      name?: string;
    };
  }[];
}

function generateNotulensiHTML(notulensi: NotulensiWithDetails): string {
  const meeting = notulensi.meeting;
  const creator = notulensi.creator;
  const approver = notulensi.approver;
  const actionItems = notulensi.action_items || [];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': '#f59e0b',
      'completed': '#10b981',
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#6b7280'
    };
    return statusColors[status as keyof typeof statusColors] || '#6b7280';
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notulensi - ${meeting?.title || 'Meeting'}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .header h1 {
          color: #1f2937;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        
        .meeting-info {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 4px solid #3b82f6;
        }
        
        .meeting-info h2 {
          color: #1f2937;
          margin-bottom: 15px;
          font-size: 20px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 5px;
          font-size: 14px;
        }
        
        .info-value {
          color: #6b7280;
          font-size: 14px;
        }
        
        .content-section {
          margin-bottom: 25px;
        }
        
        .content-section h3 {
          color: #1f2937;
          margin-bottom: 15px;
          font-size: 18px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }
        
        .content {
          background: #fff;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          white-space: pre-wrap;
          line-height: 1.8;
        }
        
        .decisions {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }
        
        .decisions ul {
          margin-left: 20px;
        }
        
        .decisions li {
          margin-bottom: 8px;
          color: #92400e;
        }
        
        .action-items {
          background: #fff;
        }
        
        .action-item {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          border-left: 4px solid #6b7280;
        }
        
        .action-item.high {
          border-left-color: #ef4444;
        }
        
        .action-item.medium {
          border-left-color: #f59e0b;
        }
        
        .action-item.low {
          border-left-color: #10b981;
        }
        
        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .action-description {
          font-weight: 600;
          color: #1f2937;
          flex: 1;
        }
        
        .action-meta {
          display: flex;
          gap: 10px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .badge.pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .badge.completed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .badge.high {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .badge.medium {
          background: #fef3c7;
          color: #92400e;
        }
        
        .badge.low {
          background: #f3f4f6;
          color: #374151;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        .signature-section {
          margin-top: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .signature {
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          margin: 40px 20px 10px 20px;
        }
        
        .signature-label {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .signature-name {
          font-size: 14px;
          color: #6b7280;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>NOTULENSI RAPAT</h1>
        <div class="subtitle">Dokumen Resmi Hasil Rapat</div>
      </div>
      
      <div class="meeting-info">
        <h2>Informasi Rapat</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Judul Rapat</div>
            <div class="info-value">${meeting?.title || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Tanggal & Waktu</div>
            <div class="info-value">${meeting?.date_time ? formatDate(meeting.date_time) : '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Durasi</div>
            <div class="info-value">${meeting?.duration ? formatDuration(meeting.duration) : '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Lokasi</div>
            <div class="info-value">${meeting?.location || 'Virtual'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Jenis Rapat</div>
            <div class="info-value">${meeting?.meeting_type === 'onsite' ? 'Onsite' : meeting?.meeting_type === 'virtual' ? 'Virtual' : 'Hybrid'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Penyelenggara</div>
            <div class="info-value">${meeting?.creator?.name || '-'}</div>
          </div>
        </div>
      </div>
      
      ${meeting?.agenda && meeting.agenda.length > 0 ? `
      <div class="content-section">
        <h3>Agenda Rapat</h3>
        <div class="content">
          <ol>
            ${meeting.agenda.map((item: string) => `<li>${item}</li>`).join('')}
          </ol>
        </div>
      </div>
      ` : ''}
      
      <div class="content-section">
        <h3>Isi Notulensi</h3>
        <div class="content">${notulensi.content}</div>
      </div>
      
      ${notulensi.decisions && notulensi.decisions.length > 0 ? `
      <div class="content-section">
        <h3>Keputusan Rapat</h3>
        <div class="decisions">
          <ul>
            ${notulensi.decisions.map((decision: string) => `<li>${decision}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
      
      ${actionItems.length > 0 ? `
      <div class="content-section">
        <h3>Action Items</h3>
        <div class="action-items">
          ${actionItems.map((item) => `
            <div class="action-item ${item.priority}">
              <div class="action-header">
                <div class="action-description">${item.description}</div>
                <div class="action-meta">
                  <span class="badge ${item.status}">${item.status === 'pending' ? 'Pending' : 'Selesai'}</span>
                  <span class="badge ${item.priority}">${item.priority}</span>
                </div>
              </div>
              ${item.assignee ? `<div style="font-size: 12px; color: #6b7280;">Ditugaskan kepada: ${item.assignee.name}</div>` : ''}
              ${item.due_date ? `<div style="font-size: 12px; color: #6b7280;">Deadline: ${formatDate(item.due_date)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${notulensi.next_meeting_date ? `
      <div class="content-section">
        <h3>Rapat Selanjutnya</h3>
        <div class="content">
          Dijadwalkan pada: ${formatDate(notulensi.next_meeting_date)}
        </div>
      </div>
      ` : ''}
      
      <div class="signature-section">
        <div class="signature">
          <div class="signature-label">Dibuat oleh</div>
          <div class="signature-line"></div>
          <div class="signature-name">${creator?.name || '-'}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
            ${formatDate(notulensi.created_at)}
          </div>
        </div>
        
        <div class="signature">
          <div class="signature-label">${approver ? 'Disetujui oleh' : 'Mengetahui'}</div>
          <div class="signature-line"></div>
          <div class="signature-name">${approver?.name || '(...........................)'}</div>
          ${approver && notulensi.approved_at ? `
          <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
            ${formatDate(notulensi.approved_at)}
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="footer">
        <p>Dokumen ini dibuat secara otomatis oleh sistem Web Toolbox PKC</p>
        <p>Dicetak pada: ${formatDate(new Date().toISOString())}</p>
      </div>
    </body>
    </html>
  `;
}