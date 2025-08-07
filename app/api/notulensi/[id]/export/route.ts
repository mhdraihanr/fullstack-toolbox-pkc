import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/notulensi/[id]/export - Export notulensi to PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch notulensi with all related data
    const { data: notulensi, error } = await supabase
      .from("notulensi")
      .select(
        `
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
      `
      )
      .eq("id", id)
      .single();

    if (error || !notulensi) {
      return NextResponse.json(
        { success: false, error: "Notulensi not found" },
        { status: 404 }
      );
    }

    // Generate HTML content for PDF
    const htmlContent = generateNotulensiHTML(notulensi);

    // Generate filename
    const meetingTitle = notulensi.meeting?.title || "Notulensi";
    const date = new Date(notulensi.created_at).toISOString().split("T")[0];
    const filename = `Notulensi_${meetingTitle.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${date}.pdf`;

    // For Vercel deployment, we'll return HTML that can be converted to PDF on the client side
    // This avoids the serverless limitations with Puppeteer
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="${filename.replace(
          ".pdf",
          ".html"
        )}"`,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/notulensi/[id]/export:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export PDF" },
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
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`;
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notulensi - ${meeting?.title || "Meeting"}</title>
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
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
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
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .info-value {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .content-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
          padding: 0 5px;
        }
        
        .content-section h3 {
          color: #2563eb;
          margin-bottom: 18px;
          margin-top: 0;
          font-size: 18px;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        
        .content {
          background: #fff;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          white-space: pre-wrap;
          line-height: 1.8;
        }
        
        .signature-section {
          margin-top: 40px;
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
        
        .footer {
          margin-top: 50px;
          padding-top: 25px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          page-break-inside: avoid;
        }
        
        /* Print styles for better PDF output */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          #pdf-content {
            margin: 0;
            padding: 20mm;
            box-shadow: none;
            max-width: none;
          }
          
          .section, .content-section {
            page-break-inside: avoid;
          }
          
          .signature-section {
            page-break-inside: avoid;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          .info-grid {
            page-break-inside: avoid;
          }
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    </head>
    <body>
      <div class="container" id="pdf-content">
        <div class="header">
          <h1>NOTULENSI RAPAT</h1>
          <div class="subtitle">Dokumen Resmi Hasil Rapat</div>
        </div>
        
        <div class="meeting-info">
          <h2>Informasi Rapat</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Judul Rapat</div>
              <div class="info-value">${meeting?.title || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tanggal & Waktu</div>
              <div class="info-value">${
                meeting?.date_time ? formatDate(meeting.date_time) : "-"
              }</div>
            </div>
            <div class="info-item">
              <div class="info-label">Durasi</div>
              <div class="info-value">${
                meeting?.duration ? formatDuration(meeting.duration) : "-"
              }</div>
            </div>
            <div class="info-item">
              <div class="info-label">Lokasi</div>
              <div class="info-value">${meeting?.location || "Virtual"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Jenis Rapat</div>
              <div class="info-value">${
                meeting?.meeting_type === "onsite"
                  ? "Onsite"
                  : meeting?.meeting_type === "virtual"
                  ? "Virtual"
                  : "Hybrid"
              }</div>
            </div>
            <div class="info-item">
              <div class="info-label">Penyelenggara</div>
              <div class="info-value">${meeting?.creator?.name || "-"}</div>
            </div>
          </div>
        </div>
        
        ${
          meeting?.agenda && meeting.agenda.length > 0
            ? `
        <div class="content-section">
          <h3>Agenda Rapat</h3>
          <div class="content">
            <ol>
              ${meeting.agenda
                .map((item: string) => `<li>${item}</li>`)
                .join("")}
            </ol>
          </div>
        </div>
        `
            : ""
        }
        
        <div class="content-section">
          <h3>Isi Notulensi</h3>
          <div class="content">${notulensi.content}</div>
        </div>
        
        ${
          notulensi.decisions && notulensi.decisions.length > 0
            ? `
        <div class="content-section">
          <h3>Keputusan Rapat</h3>
          <div class="content">
            <ul>
              ${notulensi.decisions
                .map((decision: string) => `<li>${decision}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
        `
            : ""
        }
        
        ${
          actionItems.length > 0
            ? `
        <div class="content-section">
          <h3>Action Items</h3>
          <div class="content">
            ${actionItems
              .map(
                (item) => `
              <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #3b82f6; background: #f9fafb;">
                <div style="font-weight: 600; margin-bottom: 5px;">${
                  item.description
                }</div>
                <div style="font-size: 12px; color: #6b7280;">
                  Status: ${
                    item.status === "pending" ? "Pending" : "Selesai"
                  } | 
                  Prioritas: ${item.priority}
                  ${
                    item.assignee
                      ? ` | Ditugaskan kepada: ${item.assignee.name}`
                      : ""
                  }
                  ${
                    item.due_date
                      ? ` | Deadline: ${formatDate(item.due_date)}`
                      : ""
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }
        
        ${
          notulensi.next_meeting_date
            ? `
        <div class="content-section">
          <h3>Rapat Selanjutnya</h3>
          <div class="content">
            Dijadwalkan pada: ${formatDate(notulensi.next_meeting_date)}
          </div>
        </div>
        `
            : ""
        }
        
        <div class="signature-section">
          <div class="signature">
            <div class="signature-label">Dibuat oleh</div>
            <div class="signature-line"></div>
            <div class="signature-name">${creator?.name || "-"}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
              ${formatDate(notulensi.created_at)}
            </div>
          </div>
          
          <div class="signature">
            <div class="signature-label">${
              approver ? "Disetujui oleh" : "Mengetahui"
            }</div>
            <div class="signature-line"></div>
            <div class="signature-name">${
              approver?.name || "(...........................)"
            }</div>
            ${
              approver && notulensi.approved_at
                ? `
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
              ${formatDate(notulensi.approved_at)}
            </div>
            `
                : ""
            }
          </div>
        </div>
        
        <div class="footer">
          <p>Dokumen ini dibuat secara otomatis oleh sistem Web Toolbox PKC</p>
          <p>Dicetak pada: ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
        <button onclick="downloadPDF()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin-right: 10px;">Download PDF</button>
        <button onclick="window.print()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">Print</button>
      </div>
      
      <script>
        async function downloadPDF() {
          const { jsPDF } = window.jspdf;
          const element = document.getElementById('pdf-content');
          
          try {
            // Hide buttons before capturing
            const buttonContainer = element.nextElementSibling;
            if (buttonContainer) {
              buttonContainer.style.display = 'none';
            }
            
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: element.scrollWidth,
              height: element.scrollHeight,
              scrollX: 0,
              scrollY: 0
            });
            
            // Show buttons again
            if (buttonContainer) {
              buttonContainer.style.display = 'block';
            }
            
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // A4 dimensions in mm with proper margins
            const pdfWidth = 210;
            const pdfHeight = 297;
            const margin = 15; // 15mm margin on all sides
            const contentWidth = pdfWidth - (margin * 2);
            const contentHeight = pdfHeight - (margin * 2);
            
            // Calculate image dimensions to fit within content area
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * contentWidth) / canvas.width;
            
            let yPosition = margin;
            let remainingHeight = imgHeight;
            
            // Add first page
            if (imgHeight <= contentHeight) {
              // Image fits on one page
              pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            } else {
              // Image needs multiple pages
              let sourceY = 0;
              const sourceHeight = canvas.height;
              const pageContentHeight = contentHeight;
              const sourcePageHeight = (pageContentHeight * canvas.width) / contentWidth;
              
              while (remainingHeight > 0) {
                const currentPageHeight = Math.min(pageContentHeight, remainingHeight);
                const currentSourceHeight = Math.min(sourcePageHeight, sourceHeight - sourceY);
                
                // Create a temporary canvas for this page
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = currentSourceHeight;
                const pageCtx = pageCanvas.getContext('2d');
                
                pageCtx.drawImage(
                  canvas,
                  0, sourceY, canvas.width, currentSourceHeight,
                  0, 0, canvas.width, currentSourceHeight
                );
                
                const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, currentPageHeight);
                
                remainingHeight -= currentPageHeight;
                sourceY += currentSourceHeight;
                
                if (remainingHeight > 0) {
                  pdf.addPage();
                }
              }
            }
            
            const filename = '${(meeting?.title || "notulensi").replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}_${new Date().toISOString().split("T")[0]}.pdf';
            pdf.save(filename);
          } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
          }
        }
      </script>
    </body>
    </html>
  `;
}
