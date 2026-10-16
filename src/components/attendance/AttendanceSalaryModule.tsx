import React, { useState } from 'react';
import { 
  Employee, 
  AttendanceRecord, 
  SalarySlip, 
  ShowroomConfig 
} from '../../types/crm';
import { 
  Clock, 
  Calendar, 
  FileText, 
  Printer, 
  Download, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  User, 
  Building,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';
import { 
  downloadSalarySlipPDF, 
  printSalarySlipDirect, 
  downloadSalarySlipCSV 
} from '../../services/salarySlipGenerator';

interface AttendanceSalaryModuleProps {
  config: ShowroomConfig;
  employees: Employee[];
  currentEmployee: Employee;
  attendance: AttendanceRecord[];
  salarySlips: SalarySlip[];
  onPunchAttendance: (record: AttendanceRecord) => void;
  onPunchOutAttendance: (recordId: string, punchOutTime: string) => void;
}

export const AttendanceSalaryModule: React.FC<AttendanceSalaryModuleProps> = ({
  config,
  employees,
  currentEmployee,
  attendance,
  salarySlips,
  onPunchAttendance,
  onPunchOutAttendance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'salary'>('attendance');
  const [selectedStaffId, setSelectedStaffId] = useState(currentEmployee.id);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's attendance record for current logged-in user
  const myRecordToday = attendance.find(
    (a) => a.employeeId === currentEmployee.id && a.date === todayStr
  );

  const isPunchedIn = !!myRecordToday;
  const isPunchedOut = !!myRecordToday?.punchOutTime;

  // Selected employee for salary slip view
  const targetEmployee = employees.find((e) => e.id === selectedStaffId) || currentEmployee;

  // Find salary slip for target employee and selected month
  const currentSalarySlip = salarySlips.find(
    (s) => s.employeeId === targetEmployee.id && s.month === selectedMonth
  ) || salarySlips.find((s) => s.employeeId === targetEmployee.id) || salarySlips[0];

  // Clock In Action
  const handleClockIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      date: todayStr,
      punchInTime: timeStr,
      status: isLate ? 'Late' : 'Present',
      locationAddress: `${config.showroomName} (GPS Lat: 28.5355, Long: 77.3910)`,
      notes: isLate ? 'Slight traffic delay near highway' : 'On-time morning lineup attendance',
    };

    onPunchAttendance(newRecord);
    confetti({ particleCount: 40, spread: 50 });
  };

  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Clock Out Action
  const handleClockOut = () => {
    if (!myRecordToday) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onPunchOutAttendance(myRecordToday.id, timeStr);
  };

  const handlePrintSalarySlip = () => {
    if (!currentSalarySlip) {
      showToast('No Salary Slip', 'error', 'No salary slip record found for this period.');
      return;
    }
    try {
      showToast('Printing Salary Slip', 'info', `Opening print preview for ${currentSalarySlip.employeeName}...`);
      printSalarySlipDirect(currentSalarySlip, config, targetEmployee);
    } catch (e: any) {
      showToast('Print Error', 'error', e.message);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentSalarySlip) {
      showToast('No Salary Slip', 'error', 'No salary slip record found for this period.');
      return;
    }
    setIsExporting(true);
    try {
      const res = downloadSalarySlipPDF(currentSalarySlip, config, targetEmployee);
      showToast('Salary Slip Downloaded', 'success', `Saved ${res.filename} to your device!`);
      confetti({ particleCount: 40, spread: 60 });
    } catch (e: any) {
      showToast('Download Error', 'error', e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!currentSalarySlip) {
      showToast('No Salary Slip', 'error', 'No salary slip record found for this period.');
      return;
    }
    try {
      downloadSalarySlipCSV(currentSalarySlip, config, targetEmployee);
      showToast('CSV Downloaded', 'success', `Exported salary ledger for ${currentSalarySlip.month}.`);
    } catch (e: any) {
      showToast('Export Error', 'error', e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg no-print">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Employee Self-Service (ESS) Portal</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Daily showroom clock-in attendance &amp; official monthly salary slips with tax breakdowns.
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'attendance'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Attendance &amp; Clock-in
          </button>

          <button
            onClick={() => setActiveSubTab('salary')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'salary'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Salary Slips &amp; Payroll
          </button>
        </div>
      </div>

      {/* 1. ATTENDANCE SUB-TAB */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          {/* Punch Clock Station Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-purple-400 block mb-1">
                  Today&apos;s Showroom Attendance Hub
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {currentEmployee.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span className="text-amber-300 font-semibold">{currentEmployee.designation}</span>
                  <span>•</span>
                  <span>Code: {currentEmployee.employeeCode}</span>
                  <span>•</span>
                  <span>Shift: {config.workingHours}</span>
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Verified Geofence: <strong>{config.branchLocation}</strong></span>
                </div>
              </div>

              {/* Punch Button & Live Status */}
              <div className="flex flex-col items-center sm:items-end gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Today&apos;s Status:</span>
                  {isPunchedIn ? (
                    <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      Punched In at {myRecordToday?.punchInTime}
                    </span>
                  ) : (
                    <span className="text-base font-bold text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Not Punched In Yet
                    </span>
                  )}
                  {isPunchedOut && (
                    <span className="text-xs text-slate-300 block mt-0.5">
                      Punched Out at {myRecordToday?.punchOutTime}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isPunchedIn ? (
                    <button
                      onClick={handleClockIn}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-5 h-5" />
                      <span>Clock In / Punch Attendance</span>
                    </button>
                  ) : !isPunchedOut ? (
                    <button
                      onClick={handleClockOut}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-sm font-bold text-white shadow-xl shadow-amber-600/30 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-5 h-5" />
                      <span>Clock Out for the Day</span>
                    </button>
                  ) : (
                    <div className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                      ✓ Daily Attendance Cycle Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Attendance Aggregates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 block">Days Present</span>
              <span className="text-2xl font-bold text-white mt-1 block">26 Days</span>
              <span className="text-[10px] text-emerald-400">100% attendance recorded</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 block">Late Punch-ins</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">1 Day</span>
              <span className="text-[10px] text-slate-400">Grace period applied</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 block">Avg Daily Hours</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1 block">9.4 hrs</span>
              <span className="text-[10px] text-cyan-300">Showroom floor time</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 block">Leaves Remaining</span>
              <span className="text-2xl font-bold text-purple-400 mt-1 block">14 Days</span>
              <span className="text-[10px] text-slate-400">Casual &amp; earned leaves</span>
            </div>
          </div>

          {/* Showroom Attendance History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Staff Daily Clock-in Log ({todayStr})
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {attendance.length} Staff Checked-In
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Clock In</th>
                    <th className="px-4 py-3">Clock Out</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Punch Location</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {attendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3.5 font-bold text-white">{rec.employeeName}</td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">{rec.punchInTime}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">{rec.punchOutTime || 'Active Shift'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300' :
                          rec.status === 'Late' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px] truncate max-w-xs">{rec.locationAddress}</td>
                      <td className="px-4 py-3.5 text-slate-300 text-[11px]">{rec.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. SALARY SLIPS & PAYROLL SUB-TAB */}
      {activeSubTab === 'salary' && (
        <div className="space-y-6">
          {/* Controls: Select Employee & Month */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Employee:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Pay Period:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="July 2026">July 2026</option>
                </select>
              </div>
            </div>

            {/* Action Buttons: Download PDF, Print, and CSV */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="Download Official PDF Salary Slip to Device"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating PDF...' : 'Download PDF Slip'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintSalarySlip}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
                title="Print Official Salary Slip (A4 / Letter)"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                title="Export Payroll Breakdown to CSV Spreadsheet"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">CSV</span>
              </button>
            </div>
          </div>

          {/* OFFICIAL SALARY SLIP VIEW (PRINTABLE FORMAT) */}
          {currentSalarySlip && (
            <div id="salary-slip-printable" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 print-break-inside-avoid relative overflow-hidden">
              {/* Slip Header */}
              <div className="border-b-2 border-slate-800 pb-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                      {config.showroomName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {config.brand} Franchise
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {config.branchLocation} • GSTIN: {config.gstin}
                  </p>
                  <p className="text-xs text-slate-400">
                    Dealership Code: <strong className="font-mono text-slate-300">{config.dealershipCode}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                    Payslip for {currentSalarySlip.month}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Status: <strong className="text-emerald-400 font-bold">{currentSalarySlip.paymentStatus}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Txn: {currentSalarySlip.transactionRef || 'NEFT-9028192837'}
                  </p>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs mb-6">
                <div>
                  <span className="text-[10px] text-slate-400 block">Employee Name</span>
                  <span className="font-bold text-white">{currentSalarySlip.employeeName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Employee ID</span>
                  <span className="font-mono font-semibold text-cyan-300">{currentSalarySlip.employeeCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Designation</span>
                  <span className="font-semibold text-amber-300">{currentSalarySlip.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-200">{currentSalarySlip.department}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">PAN Number</span>
                  <span className="font-mono text-slate-300">{targetEmployee.panNumber || 'ABCDE1234F'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Bank Account No.</span>
                  <span className="font-mono text-slate-300">{targetEmployee.bankAccount || 'HDFC00192837'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Days Present</span>
                  <span className="font-bold text-white">{currentSalarySlip.daysPresent} / {currentSalarySlip.daysInMonth}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Paid Date</span>
                  <span className="text-slate-300">{currentSalarySlip.paidOn || '2026-10-01'}</span>
                </div>
              </div>

              {/* Earnings & Deductions Dual Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Earnings Box */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 font-bold text-emerald-400 flex justify-between">
                    <span>Earnings Head</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-800/80 p-2 space-y-1">
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Basic Salary</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.basicSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.hra.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Dearness Allowance (DA)</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.da.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Conveyance &amp; Fuel Allowance</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.conveyanceAllowance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-amber-300 font-semibold bg-amber-950/20 rounded">
                      <span>Sales Commission / Car Delivery Incentive</span>
                      <span>₹{currentSalarySlip.salesIncentive.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Showroom Performance Bonus</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.performanceBonus.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 font-bold text-white flex justify-between">
                    <span>Total Gross Earnings</span>
                    <span className="text-emerald-400">₹{currentSalarySlip.grossEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Deductions Box */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 font-bold text-rose-400 flex justify-between">
                    <span>Deductions Head</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-800/80 p-2 space-y-1">
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Provident Fund (PF - Employee)</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.pfDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Employee State Insurance (ESIC)</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.esicDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Professional Tax (PT)</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.professionalTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 text-slate-300">
                      <span>Tax Deducted at Source (TDS)</span>
                      <span className="font-semibold text-white">₹{currentSalarySlip.tdsDeduction.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 font-bold text-white flex justify-between">
                    <span>Total Deductions</span>
                    <span className="text-rose-400">₹{currentSalarySlip.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Net Payable Banner */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/60 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block">
                    Net Take-Home Salary
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    ₹{currentSalarySlip.netSalary.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <p>Direct Deposit Credited to Bank Account</p>
                  <p className="text-[11px] text-emerald-300 font-medium">Authorized by Dealership Accounts &amp; GM</p>
                </div>
              </div>

              {/* Signatures Row */}
              <div className="mt-12 pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-500">
                <div>
                  <div className="h-10"></div>
                  <p className="border-t border-slate-700 pt-1 font-semibold text-slate-400">Employee Signature</p>
                </div>
                <div className="text-right">
                  <div className="h-10"></div>
                  <p className="border-t border-slate-700 pt-1 font-semibold text-slate-400">Authorised Signatory / GM</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
