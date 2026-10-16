import React, { useState } from 'react';
import { 
  DARReport, 
  Employee, 
  DepartmentType, 
  DesignationType 
} from '../../types/crm';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Printer, 
  Download, 
  Eye, 
  Check, 
  AlertCircle,
  Calendar,
  X,
  User,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyActivityReportViewProps {
  darReports: DARReport[];
  employees: Employee[];
  currentEmployee: Employee;
  onSaveDAR: (report: DARReport) => void;
  onApproveDAR?: (reportId: string, gmRemarks: string) => void;
  isModalOpenByDefault?: boolean;
  onCloseModalByDefault?: () => void;
}

export const DailyActivityReportView: React.FC<DailyActivityReportViewProps> = ({
  darReports,
  employees,
  currentEmployee,
  onSaveDAR,
  onApproveDAR,
  isModalOpenByDefault = false,
  onCloseModalByDefault,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(isModalOpenByDefault);
  const [selectedReport, setSelectedReport] = useState<DARReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [gmRemarksText, setGmRemarksText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [formData, setFormData] = useState<Partial<DARReport>>({
    date: todayStr,
    employeeId: currentEmployee.id,
    employeeName: currentEmployee.name,
    employeeCode: currentEmployee.employeeCode,
    department: currentEmployee.department,
    designation: currentEmployee.designation,
    shiftHours: '09:00 AM - 07:30 PM (9.5 hrs)',
    morningPlan: '',
    tasksCompleted: '',
    pendingTasks: '',
    callsTarget: currentEmployee.department === 'Sales' ? 25 : 10,
    callsActual: 0,
    walkinTarget: currentEmployee.department === 'Sales' ? 4 : 5,
    walkinActual: 0,
    testDriveTarget: currentEmployee.department === 'Sales' ? 2 : 0,
    testDriveActual: 0,
    bookingTarget: currentEmployee.department === 'Sales' ? 1 : 0,
    bookingActual: 0,
    deliveryActual: 0,
    serviceRevenueActual: 0,
    accountsCollected: 0,
    customerEscalations: '',
    edpSyncNotes: '',
    status: 'Submitted',
  });

  // Handle employee change in form (e.g. if GM or admin is filing for someone else)
  const handleSelectEmployeeForForm = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    setFormData({
      ...formData,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.employeeCode,
      department: emp.department,
      designation: emp.designation,
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.morningPlan || !formData.tasksCompleted) {
      alert('Please fill in both the Morning Plan and Completed Tasks fields.');
      return;
    }

    const newReport: DARReport = {
      id: formData.id || `dar-${Date.now()}`,
      date: formData.date || todayStr,
      employeeId: formData.employeeId || currentEmployee.id,
      employeeName: formData.employeeName || currentEmployee.name,
      employeeCode: formData.employeeCode || currentEmployee.employeeCode,
      department: formData.department || currentEmployee.department,
      designation: formData.designation || currentEmployee.designation,
      shiftHours: formData.shiftHours || '09:00 AM - 07:30 PM',
      morningPlan: formData.morningPlan || '',
      tasksCompleted: formData.tasksCompleted || '',
      pendingTasks: formData.pendingTasks || 'None',
      callsTarget: Number(formData.callsTarget) || 0,
      callsActual: Number(formData.callsActual) || 0,
      walkinTarget: Number(formData.walkinTarget) || 0,
      walkinActual: Number(formData.walkinActual) || 0,
      testDriveTarget: Number(formData.testDriveTarget) || 0,
      testDriveActual: Number(formData.testDriveActual) || 0,
      bookingTarget: Number(formData.bookingTarget) || 0,
      bookingActual: Number(formData.bookingActual) || 0,
      deliveryActual: Number(formData.deliveryActual) || 0,
      serviceRevenueActual: Number(formData.serviceRevenueActual) || 0,
      accountsCollected: Number(formData.accountsCollected) || 0,
      customerEscalations: formData.customerEscalations || 'None',
      edpSyncNotes: formData.edpSyncNotes || '',
      gmRemarks: formData.gmRemarks || '',
      status: formData.status as 'Draft' | 'Submitted' | 'Approved' | 'Needs Revision',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSaveDAR(newReport);
    setIsFormOpen(false);
    if (onCloseModalByDefault) onCloseModalByDefault();

    if (newReport.bookingActual > 0) {
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  // Filtered reports
  const filteredReports = darReports.filter((rep) => {
    const matchesSearch =
      rep.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.tasksCompleted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.morningPlan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'All' || rep.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || rep.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const exportDARToCSV = () => {
    const headers = [
      'Report ID',
      'Date',
      'Employee Name',
      'Employee Code',
      'Department',
      'Designation',
      'Calls (Target/Actual)',
      'Walkins (Target/Actual)',
      'Test Drives (Target/Actual)',
      'Bookings (Target/Actual)',
      'Deliveries Done',
      'Tasks Completed',
      'Pending Tasks',
      'Status',
      'GM Remarks',
    ];

    const rows = filteredReports.map((r) => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${r.employeeName}"`,
      `"${r.employeeCode}"`,
      `"${r.department}"`,
      `"${r.designation}"`,
      `"${r.callsTarget} / ${r.callsActual}"`,
      `"${r.walkinTarget} / ${r.walkinActual}"`,
      `"${r.testDriveTarget} / ${r.testDriveActual}"`,
      `"${r.bookingTarget} / ${r.bookingActual}"`,
      `"${r.deliveryActual}"`,
      `"${r.tasksCompleted.replace(/"/g, '""')}"`,
      `"${r.pendingTasks.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${(r.gmRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AutoCRM_DAR_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Daily Activity Report (DAR) / Work Report</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized showroom work reporting for Sales, Service, CRE, Reception, EDP, Accounts, and Management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportDARToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print DAR</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                date: todayStr,
                employeeId: currentEmployee.id,
                employeeName: currentEmployee.name,
                employeeCode: currentEmployee.employeeCode,
                department: currentEmployee.department,
                designation: currentEmployee.designation,
                shiftHours: '09:00 AM - 07:30 PM (9.5 hrs)',
                morningPlan: '',
                tasksCompleted: '',
                pendingTasks: '',
                callsTarget: currentEmployee.department === 'Sales' ? 25 : 10,
                callsActual: 0,
                walkinTarget: currentEmployee.department === 'Sales' ? 4 : 5,
                walkinActual: 0,
                testDriveTarget: currentEmployee.department === 'Sales' ? 2 : 0,
                testDriveActual: 0,
                bookingTarget: currentEmployee.department === 'Sales' ? 1 : 0,
                bookingActual: 0,
                deliveryActual: 0,
                serviceRevenueActual: 0,
                accountsCollected: 0,
                customerEscalations: '',
                edpSyncNotes: '',
                status: 'Submitted',
              });
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New DAR Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, tasks, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
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

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Draft">Draft</option>
              <option value="Needs Revision">Needs Revision</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Listing Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Date &amp; Staff</th>
                <th className="px-4 py-3">Dept &amp; Role</th>
                <th className="px-4 py-3">Target vs Actual</th>
                <th className="px-4 py-3">Daily Achievements</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                    No Daily Activity Reports found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-850/60 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{report.employeeName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" /> {report.date}
                        <span>•</span>
                        <span className="font-mono text-slate-400">{report.employeeCode}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {report.department}
                      </span>
                      <div className="text-[11px] text-amber-300 font-medium mt-1">
                        {report.designation}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                        <div>Calls: <strong className="text-white">{report.callsActual}</strong>/{report.callsTarget}</div>
                        <div>Walk-ins: <strong className="text-white">{report.walkinActual}</strong>/{report.walkinTarget}</div>
                        <div>TDs: <strong className="text-purple-400">{report.testDriveActual}</strong>/{report.testDriveTarget}</div>
                        <div>Bookings: <strong className="text-amber-400">{report.bookingActual}</strong>/{report.bookingTarget}</div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="text-slate-200 line-clamp-2">{report.tasksCompleted}</p>
                      {report.gmRemarks && (
                        <p className="text-[10px] text-purple-300 mt-1 italic">
                          GM: &ldquo;{report.gmRemarks}&rdquo;
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        report.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        report.status === 'Submitted' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {report.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Full DAR Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {(currentEmployee.department === 'Management' || currentEmployee.designation.includes('GM')) && report.status !== 'Approved' && (
                          <button
                            onClick={() => {
                              if (onApproveDAR) {
                                onApproveDAR(report.id, 'Approved by GM');
                                confetti({ particleCount: 50 });
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] transition"
                            title="Approve Report"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW DAR REPORT MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Submit Daily Activity Report (DAR)</h3>
                  <p className="text-xs text-slate-400">Comprehensive daily showroom work report</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  if (onCloseModalByDefault) onCloseModalByDefault();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Employee & Date Selector Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Filing Employee
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => handleSelectEmployeeForForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Designation (Editable)
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value as DesignationType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Sales Executive or Sales Consultant"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Target vs Actual Numerical Grid */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-blue-400 block mb-3 uppercase tracking-wider">
                  Target vs Actual Quantitative Performance
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Calls (Target / Actual)</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min="0"
                        value={formData.callsTarget}
                        onChange={(e) => setFormData({ ...formData, callsTarget: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                        placeholder="Tgt"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formData.callsActual}
                        onChange={(e) => setFormData({ ...formData, callsActual: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                        placeholder="Act"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Walk-ins (Target / Actual)</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min="0"
                        value={formData.walkinTarget}
                        onChange={(e) => setFormData({ ...formData, walkinTarget: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formData.walkinActual}
                        onChange={(e) => setFormData({ ...formData, walkinActual: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Test Drives (Target / Actual)</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min="0"
                        value={formData.testDriveTarget}
                        onChange={(e) => setFormData({ ...formData, testDriveTarget: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formData.testDriveActual}
                        onChange={(e) => setFormData({ ...formData, testDriveActual: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-purple-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Bookings (Target / Actual)</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min="0"
                        value={formData.bookingTarget}
                        onChange={(e) => setFormData({ ...formData, bookingTarget: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formData.bookingActual}
                        onChange={(e) => setFormData({ ...formData, bookingActual: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Second row of quantitative metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3 pt-3 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] text-slate-400 block">New Car Deliveries Done</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.deliveryActual}
                      onChange={(e) => setFormData({ ...formData, deliveryActual: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Service Billing / Workshop Revenue (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.serviceRevenueActual}
                      onChange={(e) => setFormData({ ...formData, serviceRevenueActual: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mt-1"
                      placeholder="e.g. 85000"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Collections / Token Received (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.accountsCollected}
                      onChange={(e) => setFormData({ ...formData, accountsCollected: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-semibold mt-1"
                      placeholder="e.g. 51000"
                    />
                  </div>
                </div>
              </div>

              {/* Qualitative Narrative */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Morning Commitment / Key Objective Plan <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.morningPlan}
                  onChange={(e) => setFormData({ ...formData, morningPlan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Outline the customer appointments, test drives, service jobs, or DMS updates planned for the day..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Actual Completed Tasks &amp; Achievements <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.tasksCompleted}
                  onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Detail the calls completed, prospects met, bookings signed, vehicle issues resolved, or accounts reconciled..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Pending Tasks / Tomorrow&apos;s Follow-ups
                  </label>
                  <textarea
                    rows={2}
                    value={formData.pendingTasks}
                    onChange={(e) => setFormData({ ...formData, pendingTasks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="Exchange valuation awaited, finance sanction letter pending, etc."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Customer Escalations / Roadblocks
                  </label>
                  <textarea
                    rows={2}
                    value={formData.customerEscalations}
                    onChange={(e) => setFormData({ ...formData, customerEscalations: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter 'None' or describe any price mismatch, warranty issue, or delayed part..."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Daily Activity Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                  Official Showroom DAR Record
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedReport.employeeName}
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  {selectedReport.designation} • {selectedReport.department}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedReport.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  selectedReport.status === 'Submitted' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {selectedReport.status}
                </span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Date</span>
                  <span className="font-semibold text-white">{selectedReport.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Shift Hours</span>
                  <span className="font-semibold text-white">{selectedReport.shiftHours}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Employee Code</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedReport.employeeCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Submitted At</span>
                  <span className="font-semibold text-slate-300">{selectedReport.submittedAt}</span>
                </div>
              </div>

              {/* Numerical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Calls Handled</span>
                  <span className="text-base font-bold text-white">
                    {selectedReport.callsActual} <span className="text-xs text-slate-500">/ {selectedReport.callsTarget}</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Walk-ins Met</span>
                  <span className="text-base font-bold text-white">
                    {selectedReport.walkinActual} <span className="text-xs text-slate-500">/ {selectedReport.walkinTarget}</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Test Drives Conducted</span>
                  <span className="text-base font-bold text-purple-300">
                    {selectedReport.testDriveActual} <span className="text-xs text-slate-500">/ {selectedReport.testDriveTarget}</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">New Bookings</span>
                  <span className="text-base font-bold text-amber-400">
                    {selectedReport.bookingActual} <span className="text-xs text-slate-500">/ {selectedReport.bookingTarget}</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Morning Objective Plan:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedReport.morningPlan}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Tasks Completed &amp; Closures:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedReport.tasksCompleted}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Pending Follow-ups / Carry Forward:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  {selectedReport.pendingTasks}
                </div>
              </div>

              {selectedReport.customerEscalations && selectedReport.customerEscalations !== 'None' && (
                <div>
                  <span className="font-bold text-rose-400 block mb-1">Customer Escalations:</span>
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200">
                    {selectedReport.customerEscalations}
                  </div>
                </div>
              )}

              {selectedReport.gmRemarks && (
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                    General Manager Remarks
                  </span>
                  <p className="text-slate-100 text-xs mt-1 italic">&ldquo;{selectedReport.gmRemarks}&rdquo;</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
