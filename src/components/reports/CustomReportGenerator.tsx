import React, { useState } from 'react';
import { 
  DARReport, 
  HourlyLog, 
  LeadItem, 
  ServiceJobCard, 
  AccountLedgerItem, 
  AttendanceRecord,
  Employee, 
  ShowroomConfig 
} from '../../types/crm';
import { 
  FileText, 
  Filter, 
  Download, 
  Printer, 
  Calendar, 
  User, 
  Building, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Table
} from 'lucide-react';

interface CustomReportGeneratorProps {
  config: ShowroomConfig;
  employees: Employee[];
  darReports: DARReport[];
  hourlyLogs: HourlyLog[];
  leads: LeadItem[];
  serviceJobs: ServiceJobCard[];
  accounts: AccountLedgerItem[];
  attendance: AttendanceRecord[];
}

export const CustomReportGenerator: React.FC<CustomReportGeneratorProps> = ({
  config,
  employees,
  darReports,
  hourlyLogs,
  leads,
  serviceJobs,
  accounts,
  attendance,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters
  const [dateRangePreset, setDateRangePreset] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('month');
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState(todayStr);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [activityType, setActivityType] = useState<
    'dar' | 'hourly' | 'leads' | 'service' | 'complaints' | 'accounts' | 'attendance'
  >('dar');

  // Filter evaluation helper
  const isDateInRange = (dateStr: string) => {
    if (dateRangePreset === 'today') return dateStr === todayStr;
    if (dateRangePreset === 'custom') {
      return (!fromDate || dateStr >= fromDate) && (!toDate || dateStr <= toDate);
    }
    // month or week:
    return dateStr >= '2026-10-01' && dateStr <= todayStr;
  };

  // Generate dataset based on activity type & filters
  const getFilteredData = () => {
    if (activityType === 'dar') {
      return darReports.filter((r) => {
        const matchesDate = isDateInRange(r.date);
        const matchesDept = selectedDepartment === 'All' || r.department === selectedDepartment;
        const matchesStaff = selectedEmployeeId === 'All' || r.employeeId === selectedEmployeeId;
        return matchesDate && matchesDept && matchesStaff;
      });
    }

    if (activityType === 'hourly') {
      return hourlyLogs.filter((l) => {
        const matchesDate = isDateInRange(l.date);
        const matchesDept = selectedDepartment === 'All' || l.department === selectedDepartment;
        const matchesStaff = selectedEmployeeId === 'All' || l.employeeId === selectedEmployeeId;
        return matchesDate && matchesDept && matchesStaff;
      });
    }

    if (activityType === 'leads') {
      return leads.filter((ld) => {
        const matchesDate = isDateInRange(ld.dateAdded);
        const matchesStaff = selectedEmployeeId === 'All' || ld.assignedToEmployeeId === selectedEmployeeId;
        return matchesDate && matchesStaff;
      });
    }

    if (activityType === 'service') {
      return serviceJobs.filter((sj) => {
        const matchesStaff = selectedEmployeeId === 'All' || sj.serviceAdvisorId === selectedEmployeeId;
        return matchesStaff;
      });
    }

    if (activityType === 'complaints') {
      return darReports.filter((r) => {
        const hasComplaint = r.customerEscalations && r.customerEscalations !== 'None' && r.customerEscalations.trim().length > 0;
        const matchesDate = isDateInRange(r.date);
        const matchesDept = selectedDepartment === 'All' || r.department === selectedDepartment;
        return hasComplaint && matchesDate && matchesDept;
      });
    }

    if (activityType === 'accounts') {
      return accounts;
    }

    if (activityType === 'attendance') {
      return attendance.filter((a) => {
        const matchesDate = isDateInRange(a.date);
        const matchesStaff = selectedEmployeeId === 'All' || a.employeeId === selectedEmployeeId;
        return matchesDate && matchesStaff;
      });
    }

    return [];
  };

  const filteredDataset = getFilteredData();

  // Export to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const reportTitle = `AutoCRM_${activityType.toUpperCase()}_Report_${todayStr}`;

    if (activityType === 'dar') {
      headers = ['ID', 'Date', 'Employee', 'Code', 'Department', 'Designation', 'Calls', 'Walkins', 'Test Drives', 'Bookings', 'Deliveries', 'Status', 'Tasks Completed'];
      rows = (filteredDataset as DARReport[]).map((r) => [
        `"${r.id}"`,
        `"${r.date}"`,
        `"${r.employeeName}"`,
        `"${r.employeeCode}"`,
        `"${r.department}"`,
        `"${r.designation}"`,
        `"${r.callsActual}"`,
        `"${r.walkinActual}"`,
        `"${r.testDriveActual}"`,
        `"${r.bookingActual}"`,
        `"${r.deliveryActual}"`,
        `"${r.status}"`,
        `"${r.tasksCompleted.replace(/"/g, '""')}"`,
      ]);
    } else if (activityType === 'hourly') {
      headers = ['Hour Slot', 'Date', 'Employee', 'Department', 'Calls', 'Walk-ins', 'Test Drives', 'Bookings', 'Deliveries', 'Notes'];
      rows = (filteredDataset as HourlyLog[]).map((l) => [
        `"${l.hourSlot}"`,
        `"${l.date}"`,
        `"${l.employeeName}"`,
        `"${l.department}"`,
        `"${l.callsMade}"`,
        `"${l.walkinsAttended}"`,
        `"${l.testDrivesConducted}"`,
        `"${l.bookingsTaken}"`,
        `"${l.deliveriesDone}"`,
        `"${l.notes.replace(/"/g, '""')}"`,
      ]);
    } else if (activityType === 'leads') {
      headers = ['Customer Name', 'Phone', 'Vehicle Model', 'Budget (Lakhs)', 'Status', 'Source', 'Assigned Executive', 'Added Date', 'Remarks'];
      rows = (filteredDataset as LeadItem[]).map((ld) => [
        `"${ld.customerName}"`,
        `"${ld.phone}"`,
        `"${ld.vehicleInterested}"`,
        `"${ld.budgetLakhs}"`,
        `"${ld.status}"`,
        `"${ld.source}"`,
        `"${ld.assignedToEmployeeName}"`,
        `"${ld.dateAdded}"`,
        `"${ld.remarks.replace(/"/g, '""')}"`,
      ]);
    } else if (activityType === 'service') {
      headers = ['Job Card No', 'Customer Name', 'Vehicle Model', 'Reg No', 'Service Type', 'Advisor', 'Status', 'Est Cost (₹)', 'Actual Bill (₹)', 'CSI'];
      rows = (filteredDataset as ServiceJobCard[]).map((sj) => [
        `"${sj.jobCardNumber}"`,
        `"${sj.customerName}"`,
        `"${sj.vehicleModel}"`,
        `"${sj.registrationNumber}"`,
        `"${sj.serviceType}"`,
        `"${sj.serviceAdvisorName}"`,
        `"${sj.status}"`,
        `"${sj.estimatedCost}"`,
        `"${sj.actualBill}"`,
        `"${sj.csiRating || 5}"`,
      ]);
    } else {
      headers = ['Record ID', 'Employee Name', 'Date', 'Status', 'Summary'];
      rows = filteredDataset.map((item: any, idx: number) => [
        `"${item.id || idx}"`,
        `"${item.employeeName || item.customerName || item.accountName || ''}"`,
        `"${item.date || todayStr}"`,
        `"${item.status || 'Active'}"`,
        `"${(item.tasksCompleted || item.notes || item.remarks || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg no-print">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Custom Automotive CRM Report Builder</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate, filter, print, and export executive analytics across DAR, Hourly pulse, Leads, Service, and Accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 no-print">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            Report Parameters &amp; Segmentation
          </span>
          <span className="text-xs text-slate-400">
            Matching Records: <strong className="text-white font-bold">{filteredDataset.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Activity Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="dar">Daily Activity Reports (DAR)</option>
              <option value="hourly">Hourly Activity Breakdown</option>
              <option value="leads">Leads Generated &amp; Closures</option>
              <option value="service">Service Bay &amp; Repair Orders</option>
              <option value="complaints">Customer Complaints &amp; Escalations</option>
              <option value="accounts">Accounts &amp; Collections</option>
              <option value="attendance">Staff Attendance Log</option>
            </select>
          </div>

          {/* 2. Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="Service">Service</option>
              <option value="CRM & CRE">CRM &amp; CRE</option>
              <option value="Reception">Reception</option>
              <option value="EDP & IT">EDP &amp; IT</option>
              <option value="Accounts & Finance">Accounts &amp; Finance</option>
              <option value="Marketing & Events">Marketing &amp; Events</option>
              <option value="Management">Management</option>
            </select>
          </div>

          {/* 3. Employee Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Employee Filter
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Range Preset */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Date Range
            </label>
            <select
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Current Month (Oct 2026)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {dateRangePreset === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs max-w-md">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* PRINT-ONLY HEADER (VISIBLE WHEN PRINTING) */}
      <div className="hidden print-only mb-6 border-b-2 border-black pb-4 text-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wide">{config.showroomName}</h1>
            <p className="text-xs">{config.branchLocation} | Dealership Code: {config.dealershipCode}</p>
            <p className="text-xs">GSTIN: {config.gstin} | Contact: {config.contactPhone}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider bg-gray-200 px-3 py-1 rounded">
              {config.brand} Franchise Report
            </span>
            <p className="text-xs mt-1">Generated: {new Date().toLocaleString()}</p>
            <p className="text-xs font-semibold">Report: {activityType.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* RESULTING REPORT DATA TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Generated Report Output</h3>
          </div>
          <span className="text-xs text-slate-400">
            {filteredDataset.length} rows loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          {/* Dynamic Table Rendering by Activity Type */}
          {activityType === 'dar' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Calls (Tgt/Act)</th>
                  <th className="px-4 py-3">Walk-ins</th>
                  <th className="px-4 py-3">TDs</th>
                  <th className="px-4 py-3">Bookings</th>
                  <th className="px-4 py-3">Tasks Completed</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(filteredDataset as DARReport[]).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-mono text-slate-300">{r.date}</td>
                    <td className="px-4 py-3 font-bold text-white">{r.employeeName}</td>
                    <td className="px-4 py-3 text-amber-300">{r.designation}</td>
                    <td className="px-4 py-3">{r.callsTarget} / {r.callsActual}</td>
                    <td className="px-4 py-3">{r.walkinActual}</td>
                    <td className="px-4 py-3 text-purple-300 font-bold">{r.testDriveActual}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{r.bookingActual}</td>
                    <td className="px-4 py-3 max-w-xs text-slate-200 truncate">{r.tasksCompleted}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activityType === 'hourly' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Hour Slot</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Dept</th>
                  <th className="px-4 py-3">Calls</th>
                  <th className="px-4 py-3">Walk-ins</th>
                  <th className="px-4 py-3">TDs</th>
                  <th className="px-4 py-3">Bookings</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(filteredDataset as HourlyLog[]).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-mono text-cyan-300 font-bold">{l.hourSlot}</td>
                    <td className="px-4 py-3 text-slate-300">{l.date}</td>
                    <td className="px-4 py-3 font-semibold text-white">{l.employeeName}</td>
                    <td className="px-4 py-3 text-slate-400">{l.department}</td>
                    <td className="px-4 py-3">{l.callsMade}</td>
                    <td className="px-4 py-3">{l.walkinsAttended}</td>
                    <td className="px-4 py-3 text-purple-300">{l.testDrivesConducted}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{l.bookingsTaken}</td>
                    <td className="px-4 py-3 max-w-sm text-slate-200 truncate">{l.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activityType === 'leads' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Vehicle Interested</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(filteredDataset as LeadItem[]).map((ld) => (
                  <tr key={ld.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-bold text-white">{ld.customerName}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{ld.phone}</td>
                    <td className="px-4 py-3 text-slate-200">{ld.vehicleInterested}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">₹{ld.budgetLakhs}L</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                        {ld.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{ld.source}</td>
                    <td className="px-4 py-3 text-slate-300">{ld.assignedToEmployeeName}</td>
                    <td className="px-4 py-3 text-amber-300">{ld.nextFollowUp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activityType === 'service' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Job Card</th>
                  <th className="px-4 py-3">Customer &amp; Vehicle</th>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Service Type</th>
                  <th className="px-4 py-3">Advisor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actual Bill (₹)</th>
                  <th className="px-4 py-3">CSI Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(filteredDataset as ServiceJobCard[]).map((sj) => (
                  <tr key={sj.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-300">{sj.jobCardNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{sj.customerName}</div>
                      <div className="text-[10px] text-slate-400">{sj.vehicleModel}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{sj.registrationNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{sj.serviceType}</td>
                    <td className="px-4 py-3 text-slate-300">{sj.serviceAdvisorName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        {sj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">₹{sj.actualBill.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-amber-400">★ {sj.csiRating || 5}.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activityType === 'complaints' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Customer Escalation / Roadblock</th>
                  <th className="px-4 py-3">GM Remarks / Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(filteredDataset as DARReport[]).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-mono text-slate-300">{r.date}</td>
                    <td className="px-4 py-3 font-bold text-white">{r.employeeName}</td>
                    <td className="px-4 py-3 text-slate-400">{r.department}</td>
                    <td className="px-4 py-3 text-rose-300 font-medium">{r.customerEscalations}</td>
                    <td className="px-4 py-3 text-slate-300 italic">{r.gmRemarks || 'Resolution in progress'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
