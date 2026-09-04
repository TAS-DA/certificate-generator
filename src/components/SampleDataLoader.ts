import type { TemplateInfo, SpreadsheetData, CertificateField } from '../types/certificate';

/**
 * Creates the exact Master Certificate Template background graphics.
 * Dimensions: 842.25 pt x 595.5 pt (1684.5 px x 1191 px at 2x resolution).
 * Contains ALL permanent static elements: THE AI SCHOOL logo, ICT ACADEMY logo, red ribbon,
 * gold seal, ID - VICS445, GANTA SRINATH REDDY / FOUNDER & CEO / THE AI SCHOOL,
 * blue round stamp, handwritten signature, borders, and wave patterns.
 */
export function generateSampleTemplateCanvas(): TemplateInfo {
  const width = 1684; // 842.25 * 2
  const height = 1191; // 595.5 * 2

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context failure.');
  }

  // 1. Background & Subtle Wavy Faint Graphics
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Subtle background waves
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(width * 0.4, height * 0.1 + i * 20);
    ctx.bezierCurveTo(width * 0.7, height * 0.05 + i * 15, width * 0.8, height * 0.4 + i * 10, width, height * 0.3 + i * 25);
    ctx.stroke();
  }

  // 2. Top-Right Red Wave Corner Graphic
  ctx.fillStyle = '#D91C24';
  ctx.beginPath();
  ctx.moveTo(width * 0.65, 0);
  ctx.bezierCurveTo(width * 0.8, height * 0.02, width * 0.9, height * 0.08, width, height * 0.16);
  ctx.lineTo(width, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#B91C1C';
  ctx.beginPath();
  ctx.moveTo(width * 0.75, 0);
  ctx.bezierCurveTo(width * 0.85, height * 0.01, width * 0.95, height * 0.04, width, height * 0.09);
  ctx.lineTo(width, 0);
  ctx.closePath();
  ctx.fill();

  // Bottom-Left Red Wave Corner Graphic
  ctx.fillStyle = '#D91C24';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.86);
  ctx.bezierCurveTo(width * 0.1, height * 0.92, width * 0.25, height * 0.98, width * 0.38, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // 3. Top Corner Red Line Accents & Ornaments
  ctx.strokeStyle = '#D91C24';
  ctx.lineWidth = 4;
  
  // Top Left Hook
  ctx.beginPath();
  ctx.moveTo(50, 90);
  ctx.lineTo(50, 50);
  ctx.lineTo(120, 50);
  ctx.stroke();
  ctx.fillStyle = '#D91C24';
  ctx.beginPath();
  ctx.arc(50, 90, 6, 0, Math.PI * 2);
  ctx.fill();

  // Bottom Right Hook
  ctx.beginPath();
  ctx.moveTo(width - 50, height - 90);
  ctx.lineTo(width - 50, height - 50);
  ctx.lineTo(width - 120, height - 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(width - 50, height - 90, 6, 0, Math.PI * 2);
  ctx.fill();

  // 4. Master Logos
  // Top-Left: THE AI SCHOOL Logo
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE', 140, 108);

  ctx.fillStyle = '#D91C24';
  ctx.font = '900 48px Arial, sans-serif';
  ctx.fillText('AI SCHOOL', 188, 115);

  // Top-Right: ICT ACADEMY Logo
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('ICTACADEMY®', width - 260, 115);

  // 5. Main Title: CERTIFICATE
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 96px "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE', width / 2, 270);

  // 6. Red Ribbon Banner: "OF COMPLETION"
  const ribbonY = 325;
  const ribbonW = 900;
  const ribbonH = 100;
  const ribbonX = (width - ribbonW) / 2;

  // Ribbon ends
  ctx.fillStyle = '#991B1B';
  ctx.beginPath();
  ctx.moveTo(ribbonX - 40, ribbonY + 20);
  ctx.lineTo(ribbonX, ribbonY);
  ctx.lineTo(ribbonX, ribbonY + ribbonH);
  ctx.lineTo(ribbonX - 40, ribbonY + ribbonH + 20);
  ctx.lineTo(ribbonX - 20, ribbonY + ribbonH / 2 + 10);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(ribbonX + ribbonW + 40, ribbonY + 20);
  ctx.lineTo(ribbonX + ribbonW, ribbonY);
  ctx.lineTo(ribbonX + ribbonW, ribbonY + ribbonH);
  ctx.lineTo(ribbonX + ribbonW + 40, ribbonY + ribbonH + 20);
  ctx.lineTo(ribbonX + ribbonW + 20, ribbonY + ribbonH / 2 + 10);
  ctx.fill();

  // Main Ribbon Body
  ctx.fillStyle = '#D91C24';
  ctx.fillRect(ribbonX, ribbonY, ribbonW, ribbonH);

  // Ribbon Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('O F   C O M P L E T I O N', width / 2, ribbonY + 68);

  // 7. Subheading: IS PRESENTED TO
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('I S   P R E S E N T E D   T O', width / 2, 480);

  // Horizontal line under recipient name
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.14, 715);
  ctx.lineTo(width * 0.86, 715);
  ctx.stroke();

  // 8. Bottom Section Graphics: Lines, Seal, Stamp, Signature, Static ID & Founder
  
  // Left: Date Line & Static Label
  ctx.beginPath();
  ctx.moveTo(330, 1020);
  ctx.lineTo(640, 1020);
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText('DATE', 485, 1055);

  // Center Gold Seal Graphic
  const sealX = width / 2;
  const sealY = 1030;
  
  ctx.fillStyle = '#D97706';
  for (let a = 0; a < 360; a += 15) {
    const rad = (a * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(sealX + Math.cos(rad) * 75, sealY + Math.sin(rad) * 75, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(sealX, sealY, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(sealX, sealY, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(sealX, sealY, 54, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D97706';
  ctx.font = 'bold 36px serif';
  ctx.fillText('★ ★ ★', sealX, sealY + 12);

  // STATIC CERTIFICATE ID BELOW SEAL (NEVER EDITABLE)
  ctx.fillStyle = '#000000';
  ctx.font = '24px "Times New Roman", Georgia, serif';
  ctx.fillText('ID - VICS445', sealX, 1140);

  // Right Section: Round Blue Stamp & Handwritten Signature
  const stampX = 1380;
  const stampY = 980;

  // Blue Round Stamp
  ctx.strokeStyle = '#1D4ED8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(stampX, stampY, 65, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(stampX, stampY, 56, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#1D4ED8';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('LEARNING PATHS TECHNOLOGIES', stampX, stampY - 35);
  ctx.fillText('HYDERABAD', stampX, stampY + 42);

  // Handwritten Signature Artwork
  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(stampX - 80, stampY - 50);
  ctx.bezierCurveTo(stampX - 40, stampY - 90, stampX + 20, stampY - 10, stampX + 80, stampY - 70);
  ctx.bezierCurveTo(stampX + 100, stampY - 90, stampX + 60, stampY - 30, stampX + 130, stampY - 60);
  ctx.stroke();

  // Right Section: Signatory Underline & STATIC FOUNDER DETAILS (NEVER EDITABLE)
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(1180, 1060);
  ctx.lineTo(1620, 1060);
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 28px "Times New Roman", Georgia, serif';
  ctx.fillText('GANTA SRINATH REDDY', 1400, 1090);

  ctx.fillStyle = '#475569';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('FOUNDER & CEO', 1400, 1120);
  ctx.fillText('THE AI SCHOOL', 1400, 1145);

  const dataUrl = canvas.toDataURL('image/png', 1.0);

  return {
    id: `tpl_master_${Date.now()}`,
    filename: 'Original_Master_Certificate_Template.pdf',
    type: 'pdf',
    width: 842,
    height: 596,
    dataUrl,
    pageCount: 1,
  };
}

/**
 * Excel dataset with sample columns matching the master certificate sentence.
 */
export function getSampleSpreadsheetData(): SpreadsheetData {
  return {
    filename: 'AI_School_Virtual_Internship_Students.xlsx',
    sheetNames: ['Students', 'Certificates'],
    selectedSheet: 'Students',
    headers: ['Name', 'Hours', 'Program', 'StartDate', 'EndDate', 'College', 'Date'],
    rows: [
      {
        'Name': 'Pradeep G',
        'Hours': '120',
        'Program': 'AI Virtual Internship in Cyber Security with AI',
        'StartDate': '10-06-2026',
        'EndDate': '13-07-2026',
        'College': 'Knowledge Institute of Technology',
        'Date': '14-07-2026',
      },
      {
        'Name': 'Rahul Kumar',
        'Hours': '120',
        'Program': 'AI Virtual Internship in Cyber Security with AI',
        'StartDate': '10-06-2026',
        'EndDate': '13-07-2026',
        'College': 'Knowledge Institute of Technology',
        'Date': '14-07-2026',
      },
      {
        'Name': 'Priya Sharma',
        'Hours': '120',
        'Program': 'AI Virtual Internship in Cyber Security with AI',
        'StartDate': '10-06-2026',
        'EndDate': '13-07-2026',
        'College': 'ABC Engineering College',
        'Date': '14-07-2026',
      },
      {
        'Name': 'Venkata Sai Krishna Chaitanya Reddy',
        'Hours': '120',
        'Program': 'AI Virtual Internship in Cyber Security with AI',
        'StartDate': '10-06-2026',
        'EndDate': '13-07-2026',
        'College': 'Global Tech University',
        'Date': '14-07-2026',
      },
      {
        'Name': "José D'Souza",
        'Hours': '120',
        'Program': 'AI Virtual Internship in Cyber Security with AI',
        'StartDate': '10-06-2026',
        'EndDate': '13-07-2026',
        'College': 'St. Xavier Institute',
        'Date': '14-07-2026',
      },
    ],
    totalRows: 5,
  };
}

/**
 * STRICTLY 3 DYNAMIC FIELDS (Recipient Name, Certificate Information, Date).
 * All other graphics, stamps, signatures, seals, IDs, and founder text remain locked in the PDF!
 */
export function getSampleConfiguredFields(): CertificateField[] {
  return [
    // 1. ONLY EDITABLE FIELD 1 — Recipient Name
    {
      id: 'f_recipient_name',
      type: 'dynamic',
      sourceColumn: 'Name',
      xRatio: 120 / 842.25,      // 0.1425
      yRatio: 284 / 595.5,       // 0.4769
      widthRatio: 600 / 842.25,  // 0.7124
      heightRatio: 68 / 595.5,   // 0.1142
      fontFamily: 'GeorgiaPro-Bold',
      fontSizeRatio: 51 / 595.5, // 51 pt
      fontWeight: 'bold',
      fontStyle: 'normal',
      textColor: '#E41A25',      // Master Red
      alignment: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      textTransform: 'none',
      autoFit: true,
      minFontSizeRatio: 28 / 595.5, // 28 pt min
      wrap: false,
      maxLines: 1,
      clearPatch: true,
      patchColor: '#ffffff',
      zIndex: 1,
      visible: true,
    },

    // 2. ONLY EDITABLE FIELD 2 — Certificate Information (Paragraph)
    {
      id: 'f_body_description',
      type: 'dynamic',
      textTemplate: 'This certificate is issued for the successful completion of the {{Hours}}-Hour\n{{Program}}, conducted\nfrom {{StartDate}} to {{EndDate}}, College -\n{{College}}.',
      xRatio: 100 / 842.25,      // 0.1187
      yRatio: 354 / 595.5,       // 0.5945
      widthRatio: 620 / 842.25,  // 0.7361
      heightRatio: 104 / 595.5,  // 0.1746
      fontFamily: 'GeorgiaPro-Regular',
      fontSizeRatio: 19.5 / 595.5, // 19.5 pt
      fontWeight: 'regular',
      fontStyle: 'normal',
      textColor: '#1A1A1A',
      alignment: 'center',
      lineHeight: 1.3,
      letterSpacing: 0,
      textTransform: 'none',
      autoFit: true,
      minFontSizeRatio: 13 / 595.5, // 13 pt min
      wrap: true,
      maxLines: 4,
      preserveLineBreaks: true,
      clearPatch: true,
      patchColor: '#ffffff',
      zIndex: 2,
      visible: true,
    },

    // 3. ONLY EDITABLE FIELD 3 — Date
    {
      id: 'f_issue_date',
      type: 'dynamic',
      sourceColumn: 'Date',
      xRatio: 165 / 842.25,      // 0.1959
      yRatio: 498 / 595.5,       // 0.8363
      widthRatio: 155 / 842.25,  // 0.1840
      heightRatio: 30 / 595.5,   // 0.0504
      fontFamily: 'GeorgiaPro-Regular',
      fontSizeRatio: 20 / 595.5, // 20 pt
      fontWeight: 'regular',
      fontStyle: 'normal',
      textColor: '#000000',
      alignment: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      textTransform: 'none',
      autoFit: true,
      minFontSizeRatio: 12 / 595.5,
      wrap: false,
      maxLines: 1,
      clearPatch: true,
      patchColor: '#ffffff',
      zIndex: 3,
      visible: true,
    },
  ];
}
