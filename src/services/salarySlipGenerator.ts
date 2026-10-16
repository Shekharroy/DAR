import { jsPDF } from 'jspdf';
import { SalarySlip, ShowroomConfig, Employee } from '../types/crm';

/**
 * Generates an official, high-resolution PDF Salary Slip and triggers direct download
 */
export function downloadSalarySlipPDF(
  slip: SalarySlip,
  config: ShowroomConfig,
  employee: Employee
) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 16;

    // --- 1. HEADER BANNER ---
    // Top border accent line
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(margin, y, pageWidth - margin * 2, 3, 'F');
    y += 8;

    // Company / Showroom Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(config.showroomName.toUpperCase(), margin, y);

    // Franchise Badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    const franchiseText = `[ ${config.brand.toUpperCase()} AUTHORIZED DEALERSHIP ]`;
    doc.text(franchiseText, pageWidth - margin, y, { align: 'right' });
    y += 5;

    // Dealership address & details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(`${config.branchLocation}  |  GSTIN: ${config.gstin || '07AABCT2389K1Z5'}`, margin, y);
    doc.text(`Dealership Code: ${config.dealershipCode || 'TATA-DL-908'}`, pageWidth - margin, y, { align: 'right' });
    y += 7;

    // Horizontal divider
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // --- 2. TITLE BAR ---
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.roundedRect(margin, y, pageWidth - margin * 2, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`SALARY SLIP FOR THE MONTH OF ${slip.month.toUpperCase()}`, margin + 4, y + 6);

    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text(`Status: ${slip.paymentStatus.toUpperCase()}  (Direct Bank NEFT)`, pageWidth - margin - 4, y + 6, { align: 'right' });
    y += 13;

    // --- 3. EMPLOYEE DETAILS GRID ---
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - margin * 2, 28, 'FD');

    const col1 = margin + 4;
    const col2 = margin + 50;
    const col3 = margin + 95;
    const col4 = margin + 140;

    let rowY = y + 5;
    // Row 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Employee Name:', col1, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(slip.employeeName, col2, rowY);

    doc.setTextColor(100, 116, 139);
    doc.text('Employee ID / Code:', col3, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(slip.employeeCode, col4, rowY);

    // Row 2
    rowY += 6;
    doc.setTextColor(100, 116, 139);
    doc.text('Designation:', col1, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(slip.designation, col2, rowY);

    doc.setTextColor(100, 116, 139);
    doc.text('Department:', col3, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(slip.department, col4, rowY);

    // Row 3
    rowY += 6;
    doc.setTextColor(100, 116, 139);
    doc.text('Bank Account No.:', col1, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(employee.bankAccount || 'HDFC00192837', col2, rowY);

    doc.setTextColor(100, 116, 139);
    doc.text('PAN Number:', col3, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(employee.panNumber || 'ABCDE1234F', col4, rowY);

    // Row 4
    rowY += 6;
    doc.setTextColor(100, 116, 139);
    doc.text('Attendance / Days:', col1, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(`${slip.daysPresent} Present / ${slip.daysInMonth} Total Days`, col2, rowY);

    doc.setTextColor(100, 116, 139);
    doc.text('Disbursement Date:', col3, rowY);
    doc.setTextColor(15, 23, 42);
    doc.text(slip.paidOn || '01-10-2026', col4, rowY);

    y += 33;

    // --- 4. EARNINGS & DEDUCTIONS TABLES ---
    const tableWidth = (pageWidth - margin * 2 - 6) / 2;
    const tableLeft = margin;
    const tableRight = margin + tableWidth + 6;

    // Table Headers
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(tableLeft, y, tableWidth, 7, 'F');
    doc.rect(tableRight, y, tableWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('EARNINGS HEAD', tableLeft + 4, y + 5);
    doc.text('AMOUNT (INR)', tableLeft + tableWidth - 4, y + 5, { align: 'right' });

    doc.text('DEDUCTIONS HEAD', tableRight + 4, y + 5);
    doc.text('AMOUNT (INR)', tableRight + tableWidth - 4, y + 5, { align: 'right' });

    y += 7;

    const earningsItems = [
      { label: 'Basic Salary', val: slip.basicSalary },
      { label: 'House Rent Allowance (HRA)', val: slip.hra },
      { label: 'Dearness Allowance (DA)', val: slip.da },
      { label: 'Conveyance & Fuel Allowance', val: slip.conveyanceAllowance },
      { label: 'Sales Commission / Car Incentive', val: slip.salesIncentive },
      { label: 'Showroom Performance Bonus', val: slip.performanceBonus },
    ];

    const deductionsItems = [
      { label: 'Provident Fund (PF - Employee)', val: slip.pfDeduction },
      { label: 'Employee State Insurance (ESIC)', val: slip.esicDeduction },
      { label: 'Professional Tax (PT)', val: slip.professionalTax },
      { label: 'Tax Deducted at Source (TDS)', val: slip.tdsDeduction },
      { label: 'Other Statutory Deductions', val: 0 },
      { label: 'Staff Welfare Fund', val: 0 },
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    const rowHeight = 6.2;
    for (let i = 0; i < 6; i++) {
      const isEven = i % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(tableLeft, y, tableWidth, rowHeight, 'F');
      doc.rect(tableRight, y, tableWidth, rowHeight, 'F');

      // Borders
      doc.setDrawColor(226, 232, 240);
      doc.rect(tableLeft, y, tableWidth, rowHeight, 'S');
      doc.rect(tableRight, y, tableWidth, rowHeight, 'S');

      // Earnings text
      doc.setTextColor(30, 41, 59);
      doc.text(earningsItems[i].label, tableLeft + 4, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${earningsItems[i].val.toLocaleString('en-IN')}`, tableLeft + tableWidth - 4, y + 4.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      // Deductions text
      doc.text(deductionsItems[i].label, tableRight + 4, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${deductionsItems[i].val.toLocaleString('en-IN')}`, tableRight + tableWidth - 4, y + 4.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      y += rowHeight;
    }

    // Totals Row
    doc.setFillColor(241, 245, 249);
    doc.rect(tableLeft, y, tableWidth, 8, 'FD');
    doc.rect(tableRight, y, tableWidth, 8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL GROSS EARNINGS:', tableLeft + 4, y + 5.5);
    doc.setTextColor(5, 150, 105);
    doc.text(`Rs. ${slip.grossEarnings.toLocaleString('en-IN')}`, tableLeft + tableWidth - 4, y + 5.5, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL DEDUCTIONS:', tableRight + 4, y + 5.5);
    doc.setTextColor(225, 29, 72);
    doc.text(`Rs. ${slip.totalDeductions.toLocaleString('en-IN')}`, tableRight + tableWidth - 4, y + 5.5, { align: 'right' });

    y += 12;

    // --- 5. NET TAKE-HOME SALARY BOX ---
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(16, 185, 129); // Emerald 500
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(6, 78, 59); // Emerald 900
    doc.text('NET SALARY PAYABLE (IN FIGURES):', margin + 6, y + 7);
    doc.setFontSize(15);
    doc.setTextColor(5, 150, 105);
    doc.text(`Rs. ${slip.netSalary.toLocaleString('en-IN')}/-`, margin + 6, y + 13.5);

    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text('Payment Mode: Bank Account Direct Credit (NEFT/RTGS)', pageWidth - margin - 6, y + 7, { align: 'right' });
    doc.text(`Transaction Reference: ${slip.transactionRef || 'NEFT-AUTO-9281736'}`, pageWidth - margin - 6, y + 12, { align: 'right' });

    y += 22;

    // --- 6. SIGNATURES & STAMP ---
    doc.setDrawColor(203, 213, 225);
    doc.line(margin + 5, y + 14, margin + 55, y + 14);
    doc.line(pageWidth - margin - 55, y + 14, pageWidth - margin - 5, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Employee Signature', margin + 30, y + 18, { align: 'center' });
    doc.text('Authorized Signatory / GM', pageWidth - margin - 30, y + 18, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a system-generated salary slip authenticated by AutoCRM ERP.', margin + 30, y + 23);

    // Save PDF
    const filename = `Salary_Slip_${slip.employeeCode}_${slip.month.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    return { success: true, filename };
  } catch (err: any) {
    console.error('Failed to generate PDF salary slip:', err);
    throw new Error(err.message || 'PDF generation failed.');
  }
}

/**
 * Clean Print handler for Salary Slip (isolates the payslip, avoiding iframe or sidebar cutoffs)
 */
export function printSalarySlipDirect(
  slip: SalarySlip,
  config: ShowroomConfig,
  employee: Employee
) {
  try {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Slip - ${slip.employeeName} - ${slip.month}</title>
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
          body { margin: 0; padding: 24px; color: #0f172a; background: #fff; }
          .slip-card { max-width: 800px; margin: 0 auto; border: 2px solid #cbd5e1; border-radius: 12px; padding: 24px; }
          .header-line { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a; }
          .badge { display: inline-block; background: #2563eb; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 8px; }
          .subtext { font-size: 12px; color: #475569; margin: 4px 0 0 0; }
          .status-badge { background: #ecfdf5; color: #059669; border: 1px solid #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .emp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
          .emp-grid .label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
          .emp-grid .val { font-weight: 700; color: #0f172a; }
          .tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 12px; }
          .table-box { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
          .table-box-header { background: #0f172a; color: #fff; font-weight: bold; padding: 8px 12px; display: flex; justify-content: space-between; }
          .table-row { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #f1f5f9; }
          .table-row:nth-child(even) { background: #f8fafc; }
          .table-total { background: #e2e8f0; font-weight: bold; padding: 8px 12px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; }
          .net-box { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
          .net-amount { font-size: 24px; font-weight: 900; color: #059669; }
          .sig-row { display: flex; justify-content: space-between; padding-top: 40px; }
          .sig-col { text-align: center; border-top: 1px solid #64748b; width: 180px; padding-top: 6px; font-size: 11px; font-weight: bold; color: #475569; }
          @media print {
            body { padding: 0; }
            .slip-card { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="slip-card">
          <div class="header-line">
            <div>
              <h1 class="title">${config.showroomName} <span class="badge">${config.brand} Franchise</span></h1>
              <p class="subtext">${config.branchLocation} | Dealership Code: <strong>${config.dealershipCode}</strong> | GSTIN: ${config.gstin}</p>
            </div>
            <div style="text-align: right;">
              <span class="status-badge">PAYSLIP: ${slip.month.toUpperCase()} - ${slip.paymentStatus.toUpperCase()}</span>
              <p class="subtext" style="margin-top: 6px;">Txn: ${slip.transactionRef || 'NEFT-92817293'}</p>
            </div>
          </div>

          <div class="emp-grid">
            <div>
              <div class="label">Employee Name</div>
              <div class="val">${slip.employeeName}</div>
            </div>
            <div>
              <div class="label">Employee Code</div>
              <div class="val">${slip.employeeCode}</div>
            </div>
            <div>
              <div class="label">Designation</div>
              <div class="val">${slip.designation}</div>
            </div>
            <div>
              <div class="label">Department</div>
              <div class="val">${slip.department}</div>
            </div>
            <div>
              <div class="label">Bank Account</div>
              <div class="val">${employee.bankAccount || 'HDFC00192837'}</div>
            </div>
            <div>
              <div class="label">PAN Number</div>
              <div class="val">${employee.panNumber || 'ABCDE1234F'}</div>
            </div>
            <div>
              <div class="label">Days Present</div>
              <div class="val">${slip.daysPresent} / ${slip.daysInMonth} Days</div>
            </div>
            <div>
              <div class="label">Payment Date</div>
              <div class="val">${slip.paidOn || '01-10-2026'}</div>
            </div>
          </div>

          <div class="tables-row">
            <div class="table-box">
              <div class="table-box-header"><span>EARNINGS HEAD</span><span>AMOUNT (₹)</span></div>
              <div class="table-row"><span>Basic Salary</span><strong>₹${slip.basicSalary.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>House Rent Allowance (HRA)</span><strong>₹${slip.hra.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>Dearness Allowance (DA)</span><strong>₹${slip.da.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>Conveyance Allowance</span><strong>₹${slip.conveyanceAllowance.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>Sales & Delivery Incentive</span><strong>₹${slip.salesIncentive.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>Performance Bonus</span><strong>₹${slip.performanceBonus.toLocaleString('en-IN')}</strong></div>
              <div class="table-total"><span>Total Gross Earnings</span><strong style="color: #059669;">₹${slip.grossEarnings.toLocaleString('en-IN')}</strong></div>
            </div>

            <div class="table-box">
              <div class="table-box-header"><span>DEDUCTIONS HEAD</span><span>AMOUNT (₹)</span></div>
              <div class="table-row"><span>Provident Fund (PF)</span><strong>₹${slip.pfDeduction.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>ESIC</span><strong>₹${slip.esicDeduction.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>Professional Tax (PT)</span><strong>₹${slip.professionalTax.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>TDS (Income Tax)</span><strong>₹${slip.tdsDeduction.toLocaleString('en-IN')}</strong></div>
              <div class="table-row"><span>Staff Welfare</span><strong>₹0</strong></div>
              <div class="table-row"><span>Other Deductions</span><strong>₹0</strong></div>
              <div class="table-total"><span>Total Deductions</span><strong style="color: #e11d48;">₹${slip.totalDeductions.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          <div class="net-box">
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #065f46; text-transform: uppercase;">Net Take-Home Salary (In Figures)</div>
              <div class="net-amount">₹${slip.netSalary.toLocaleString('en-IN')}/-</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #047857;">
              <strong>Direct Deposit via NEFT/RTGS</strong><br />
              Authorized by Dealership Accounts &amp; GM
            </div>
          </div>

          <div class="sig-row">
            <div class="sig-col">Employee Signature</div>
            <div class="sig-col">Authorised Signatory / GM</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a hidden iframe to print cleanly without affecting parent page or iframe constraints
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 350);
    } else {
      window.print();
    }
  } catch (err) {
    console.error('Error during print:', err);
    window.print();
  }
}

/**
 * Downloads a CSV breakdown of the salary slip
 */
export function downloadSalarySlipCSV(
  slip: SalarySlip,
  config: ShowroomConfig,
  employee: Employee
) {
  const rows = [
    ['COMPANY', config.showroomName],
    ['BRAND FRANCHISE', config.brand],
    ['BRANCH LOCATION', config.branchLocation],
    ['GSTIN', config.gstin],
    ['DEALERSHIP CODE', config.dealershipCode],
    [''],
    ['SALARY SLIP FOR', slip.month],
    ['PAYMENT STATUS', slip.paymentStatus],
    ['TRANSACTION REF', slip.transactionRef || 'NEFT-9028192837'],
    ['PAID ON', slip.paidOn || '2026-10-01'],
    [''],
    ['EMPLOYEE CODE', slip.employeeCode],
    ['EMPLOYEE NAME', slip.employeeName],
    ['DESIGNATION', slip.designation],
    ['DEPARTMENT', slip.department],
    ['PAN NUMBER', employee.panNumber || 'ABCDE1234F'],
    ['BANK ACCOUNT', employee.bankAccount || 'HDFC00192837'],
    ['DAYS PRESENT', `${slip.daysPresent} of ${slip.daysInMonth}`],
    [''],
    ['EARNINGS HEAD', 'AMOUNT (INR)'],
    ['Basic Salary', slip.basicSalary],
    ['House Rent Allowance (HRA)', slip.hra],
    ['Dearness Allowance (DA)', slip.da],
    ['Conveyance Allowance', slip.conveyanceAllowance],
    ['Sales Commission / Incentive', slip.salesIncentive],
    ['Performance Bonus', slip.performanceBonus],
    ['TOTAL GROSS EARNINGS', slip.grossEarnings],
    [''],
    ['DEDUCTIONS HEAD', 'AMOUNT (INR)'],
    ['Provident Fund (PF)', slip.pfDeduction],
    ['Employee State Insurance (ESIC)', slip.esicDeduction],
    ['Professional Tax (PT)', slip.professionalTax],
    ['Tax Deducted at Source (TDS)', slip.tdsDeduction],
    ['TOTAL DEDUCTIONS', slip.totalDeductions],
    [''],
    ['NET TAKE-HOME SALARY', slip.netSalary],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Salary_Slip_${slip.employeeCode}_${slip.month.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
