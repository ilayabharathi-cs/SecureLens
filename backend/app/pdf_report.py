import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Custom canvas to support 'Page X of Y' page numbering and styled headers/footers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_decorations(self, page_count):
        self.saveState()
        
        # Don't draw headers/footers on the cover section of page 1 if we have a big landing
        if self._pageNumber == 1:
            # Draw decorative top border
            self.setFillColor(colors.HexColor("#0f172a")) # Slate 900 background
            self.rect(0, 0, 612, 792, fill=True, stroke=False)
            
            # Accent cyber grids or diagonal lines
            self.setStrokeColor(colors.HexColor("#06b6d4")) # Neon Cyan
            self.setLineWidth(2)
            self.line(36, 750, 576, 750)
            self.line(36, 42, 576, 42)
            
            # Cyberpunk grid accent lines
            self.setStrokeColor(colors.HexColor("#1e293b")) # Slate 800
            self.setLineWidth(0.5)
            for x in range(36, 577, 30):
                self.line(x, 42, x, 750)
            for y in range(42, 751, 30):
                self.line(36, y, 576, y)
                
            self.restoreState()
            return
            
        # For pages 2+
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#06b6d4")) # Neon Cyan
        
        # Header banner line
        self.setStrokeColor(colors.HexColor("#3b82f6")) # Neon Blue
        self.setLineWidth(1)
        self.line(36, 746, 576, 746)
        
        # Header text
        self.drawString(36, 752, "SECURELENS VULNERABILITY ASSESSMENT REPORT")
        
        # Footer line
        self.setStrokeColor(colors.HexColor("#a855f7")) # Neon Purple
        self.line(36, 54, 576, 54)
        
        # Footer text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b")) # Slate 500
        self.drawString(36, 42, "CONFIDENTIAL // DEFENSIVE USE ONLY")
        self.drawRightString(576, 42, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def generate_pdf(scan_data: dict) -> bytes:
    """
    Assembles a beautiful, styled ReportLab PDF using document flowables.
    """
    buffer = io.BytesIO()
    
    # Setup document. Margin is 36pt (0.5 inch) to maximize printable space
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=34,
        leading=40,
        textColor=colors.HexColor("#06b6d4"), # Cyan
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#94a3b8"), # Slate 400
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#3b82f6"), # Neon Blue
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#f8fafc") if doc.pagesize == letter else colors.HexColor("#0f172a"), # adjusted for print, let's keep text readable
    )
    
    # Standard printable text style (dark text on white pages is best for print readability)
    # We will use light theme colors inside flowables, since we print on white canvas.
    # Note: On page 1 we draw a dark slate rectangle as a background. So page 1 text will be light/cyan.
    # Page 2+ will be light background (white paper), so we will use dark slate/black colors for text.
    cover_body_style = ParagraphStyle(
        'CoverBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#cbd5e1"), # Light slate
        spaceAfter=8
    )
    
    print_body_style = ParagraphStyle(
        'PrintBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e293b"), # Dark slate
        spaceAfter=8
    )

    print_code_style = ParagraphStyle(
        'PrintCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=5,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    story = []
    
    # ------------------ PAGE 1: COVER / HERO PAGE ------------------
    story.append(Spacer(1, 100))
    story.append(Paragraph("SECURELENS", title_style))
    story.append(Paragraph("VULNERABILITY ASSESSMENT REPORT", subtitle_style))
    
    # Target Info Table
    info_data = [
        [Paragraph("<b>Target URL:</b>", cover_body_style), Paragraph(scan_data["url"], cover_body_style)],
        [Paragraph("<b>Domain:</b>", cover_body_style), Paragraph(scan_data["hostname"], cover_body_style)],
        [Paragraph("<b>Scan Date:</b>", cover_body_style), Paragraph(scan_data["scan_date"], cover_body_style)],
        [Paragraph("<b>Overall Score:</b>", cover_body_style), Paragraph(f"<b>{scan_data['score']}/100</b> ({scan_data['risk_level']} Risk)", cover_body_style)]
    ]
    t_info = Table(info_data, colWidths=[100, 400])
    t_info.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_info)
    
    story.append(Spacer(1, 120))
    
    # Disclaimer Box on Cover Page
    disclaimer_text = (
        "<b>LEGAL & SAFETY NOTICE:</b> SecureLens is configured for defensive analysis and educational "
        "security audits only. All checks performed (HTTP header analysis, SSL certificate handshake, and "
        "socket-based open port audits) are passive and non-intrusive. No exploit attempts or offensive operations "
        "were executed during this scan."
    )
    t_disclaimer = Table([[Paragraph(disclaimer_text, cover_body_style)]], colWidths=[500])
    t_disclaimer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#1e293b")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#3b82f6")),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_disclaimer)
    
    story.append(PageBreak()) # Force to page 2 (which will be printable white background)
    
    # ------------------ PAGE 2: DETAILED ANALYSIS ------------------
    story.append(Paragraph("Executive Summary", h1_style))
    exec_summary_text = (
        f"A web security scan was performed on <b>{scan_data['hostname']}</b>. The site scored "
        f"<b>{scan_data['score']}/100</b>, indicating a <b>{scan_data['risk_level']} Risk</b> status. "
        f"The assessment checked security headers configurations, audited SSL/TLS certificate health, "
        f"performed connection scans on 6 common ports, and fingerprinted underlying system technologies. "
        f"A total of <b>{len(scan_data['findings'])} vulnerability items</b> were identified that require remediation."
    )
    story.append(Paragraph(exec_summary_text, print_body_style))
    story.append(Spacer(1, 15))
    
    # Findings Summary Dashboard
    summary_data = [
        [
            Paragraph("<b>Risk Score</b>", print_body_style), 
            Paragraph("<b>Risk Level</b>", print_body_style), 
            Paragraph("<b>Total Issues</b>", print_body_style)
        ],
        [
            Paragraph(f"<font size=16 color='#06b6d4'><b>{scan_data['score']} / 100</b></font>", print_body_style),
            Paragraph(f"<font size=14 color='#3b82f6'><b>{scan_data['risk_level']}</b></font>", print_body_style),
            Paragraph(f"<font size=14 color='#ef4444'><b>{len(scan_data['findings'])}</b></font>", print_body_style)
        ]
    ]
    t_summary = Table(summary_data, colWidths=[180, 180, 180])
    t_summary.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 20))
    
    # Ports & SSL Checks
    story.append(Paragraph("System Infrastructure & SSL Status", h1_style))
    
    # SSL Sub-table
    ssl_status_desc = "Valid" if scan_data["ssl"]["valid"] else "Invalid/Untrusted"
    if scan_data["ssl"]["error"]:
        ssl_status_desc += f" ({scan_data['ssl']['error']})"
        
    ssl_grid_data = [
        [Paragraph("<b>SSL Status:</b>", print_body_style), Paragraph(ssl_status_desc, print_body_style)],
        [Paragraph("<b>TLS Version:</b>", print_body_style), Paragraph(scan_data["ssl"]["tls_version"], print_body_style)],
        [Paragraph("<b>Certificate Issuer:</b>", print_body_style), Paragraph(scan_data["ssl"]["issuer"], print_body_style)],
        [Paragraph("<b>Expiry Date:</b>", print_body_style), Paragraph(scan_data["ssl"]["expiry_date"] or "N/A", print_body_style)],
        [Paragraph("<b>Days Remaining:</b>", print_body_style), Paragraph(f"{scan_data['ssl']['days_left']} days", print_body_style)],
    ]
    t_ssl_grid = Table(ssl_grid_data, colWidths=[150, 390])
    t_ssl_grid.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
    ]))
    story.append(t_ssl_grid)
    story.append(Spacer(1, 15))
    
    # Open Ports Sub-table
    story.append(Paragraph("<b>Exposed Infrastructure Ports:</b>", print_body_style))
    ports_grid_header = [Paragraph("Port", table_header_style), Paragraph("Service", table_header_style), Paragraph("Status", table_header_style)]
    ports_grid_rows = [ports_grid_header]
    for p in scan_data["ports"]:
        port_color = "#ef4444" if p["status"] == "Open" and p["port"] not in [80, 443] else ("#10b981" if p["status"] == "Open" else "#64748b")
        ports_grid_rows.append([
            Paragraph(str(p["port"]), print_body_style),
            Paragraph(p["service"], print_body_style),
            Paragraph(f"<font color='{port_color}'><b>{p['status']}</b></font>", print_body_style)
        ])
    t_ports = Table(ports_grid_rows, colWidths=[120, 210, 210])
    t_ports.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#3b82f6")), # Blue header
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_ports)
    story.append(Spacer(1, 20))
    
    # Security Headers Table
    story.append(Paragraph("Security Headers Audit", h1_style))
    headers_grid_header = [
        Paragraph("Header Name", table_header_style), 
        Paragraph("Status", table_header_style), 
        Paragraph("Risk", table_header_style)
    ]
    headers_grid_rows = [headers_grid_header]
    for h_name, h_audit in scan_data["headers"].items():
        status_color = "#10b981" if h_audit["status"] == "Present" else "#ef4444"
        risk_color = "#ef4444" if h_audit["risk"] == "High" else ("#f59e0b" if h_audit["risk"] == "Medium" else ("#64748b" if h_audit["status"] == "Present" else "#3b82f6"))
        
        headers_grid_rows.append([
            Paragraph(h_name, print_body_style),
            Paragraph(f"<font color='{status_color}'><b>{h_audit['status']}</b></font>", print_body_style),
            Paragraph(f"<font color='{risk_color}'><b>{h_audit['risk']}</b></font>" if h_audit["status"] == "Missing" else "None", print_body_style)
        ])
    t_headers = Table(headers_grid_rows, colWidths=[240, 150, 150])
    t_headers.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#06b6d4")), # Cyan header
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_headers)
    
    # ------------------ PAGE 3+: RECOMMENDATIONS ------------------
    if scan_data["findings"]:
        story.append(PageBreak())
        story.append(Paragraph("Remediation Recommendations", h1_style))
        story.append(Paragraph("Below are actionable items to patch identified security vulnerabilities.", print_body_style))
        story.append(Spacer(1, 10))
        
        for idx, finding in enumerate(scan_data["findings"], 1):
            severity_color = "#ef4444" if finding["severity"] in ["High", "Critical"] else "#f59e0b"
            
            finding_html = (
                f"<b>{idx}. {finding['title']}</b> - <font color='{severity_color}'><b>[{finding['severity']} Severity]</b></font><br/>"
                f"<b>Category:</b> {finding['category']}<br/>"
                f"<b>Details:</b> {finding['description']}<br/>"
                f"<b>Remediation:</b> {finding['recommendation']}"
            )
            p_finding = Paragraph(finding_html, print_body_style)
            
            # Pack into a container to avoid splitting findings across pages
            t_finding = Table([[p_finding]], colWidths=[540])
            t_finding.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
                ('LINELEFT', (0,0), (-1,-1), 4, colors.HexColor(severity_color)),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('LEFTPADDING', (0,0), (-1,-1), 12),
                ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ]))
            story.append(t_finding)
            story.append(Spacer(1, 12))

    # Build the PDF using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
