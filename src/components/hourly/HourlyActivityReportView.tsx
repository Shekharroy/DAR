import React, { useState } from 'react';
import { 
  HourlyLog, 
  Employee, 
  DepartmentType 
} from '../../types/crm';
import { DEFAULT_HOURLY_SLOTS } from '../../services/storage';
import { 
  Clock, 
  Plus, 
  PhoneCall, 
  Users, 
  Car, 
  Award, 
  Wrench, 
  DollarSign, 
  FileText, 
  Calendar, 
  Check, 
  Filter, 
  Download,
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HourlyActivityReportViewProps {
  hourlyLogs: HourlyLog[];
  employees: Employee[];
  currentEmployee: Employee;
  onSaveHourlyLog: (log: HourlyLog) => void;
  isModalOpenByDefault?: boolean;
  onCloseModalByDefault?: () => void;
}

export const HourlyActivityReportView: React.FC<HourlyActivityReportViewProps> = ({
  hourlyLogs,
  employees,
  currentEmployee,
  onSaveHourlyLog,
  isModalOpenByDefault = false,
  onCloseModalByDefault,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('All');
  const [isLogModalOpen, setIsLogModalOpen] = useState(isModalOpenByDefault);

  // New Hourly Log Form State
  const [logFormData, setLogFormData] = useState<Partial<HourlyLog>>({
    date: todayStr,
    hourSlot: DEFAULT_HOURLY_SLOTS[2], // e.g. 11:00 - 12:00
    employeeId: currentEmployee.id,
    employeeName: currentEmployee.name,
    department: currentEmployee.department,
    callsMade: currentEmployee.department === 'Sales' ? 6 : 2,
    walkinsAttended: 1,
    testDrivesConducted: 0,
    bookingsTaken: 0,
    deliveriesDone: 0,
    serviceJobCardsCreated: 0,
    serviceVehiclesDelivered: 0,
    accountsCollectionAmount: 0,
    edpTasksCompleted: 0,
    notes: '',
  });

  const handleSelectStaffInForm = (staffId: string) => {
    const emp = employees.find((e) => e.id === staffId);
    if (!emp) return;
    setLogFormData({
      ...logFormData,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logFormData.notes) {
      alert('Please enter a brief activity summary for this hour.');
      return;
    }

    const newLog: HourlyLog = {
      id: logFormData.id || `hl-${Date.now()}`,
      date: logFormData.date || todayStr,
      hourSlot: logFormData.hourSlot || '11:00 - 12:00',
      employeeId: logFormData.employeeId || currentEmployee.id,
      employeeName: logFormData.employeeName || currentEmployee.name,
      department: (logFormData.department as DepartmentType) || currentEmployee.department,
      callsMade: Number(logFormData.callsMade) || 0,
      walkinsAttended: Number(logFormData.walkinsAttended) || 0,
      testDrivesConducted: Number(logFormData.testDrivesConducted) || 0,
      bookingsTaken: Number(logFormData.bookingsTaken) || 0,
      deliveriesDone: Number(logFormData.deliveriesDone) || 0,
      serviceJobCardsCreated: Number(logFormData.serviceJobCardsCreated) || 0,
      serviceVehiclesDelivered: Number(logFormData.serviceVehiclesDelivered) || 0,
      accountsCollectionAmount: Number(logFormData.accountsCollectionAmount) || 0,
      edpTasksCompleted: Number(logFormData.edpTasksCompleted) || 0,
      notes: logFormData.notes || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSaveHourlyLog(newLog);
    setIsLogModalOpen(false);
    if (onCloseModalByDefault) onCloseModalByDefault();

    if (newLog.bookingsTaken > 0) {
      confetti({ particleCount: 75, spread: 70 });
    }
  };

  // Filter logs for selected date & employee
  const currentLogs = hourlyLogs.filter((l) => {
    const matchesDate = l.date === selectedDate;
    const matchesStaff = selectedStaffFilter === 'All' || l.employeeId === selectedStaffFilter;
    return matchesDate && matchesStaff;
  });

  // Calculate hourly slot aggregations across all staff for today
  const slotAggregates = DEFAULT_HOURLY_SLOTS.map((slot) => {
    const logsInSlot = hourlyLogs.filter(
      (l) => l.date === selectedDate && l.hourSlot === slot
    );
    const totalCalls = logsInSlot.reduce((sum, l) => sum + l.callsMade, 0);
    const totalWalkins = logsInSlot.reduce((sum, l) => sum + l.walkinsAttended, 0);
    const totalTDs = logsInSlot.reduce((sum, l) => sum + l.testDrivesConducted, 0);
    const totalBookings = logsInSlot.reduce((sum, l) => sum + l.bookingsTaken, 0);

    return {
      slot,
      logsCount: logsInSlot.length,
      totalCalls,
      totalWalkins,
      totalTDs,
      totalBookings,
    };
  });

  const exportHourlyToCSV = () => {
    const headers = [
      'Hour Slot',
      'Date',
      'Employee Name',
      'Department',
      'Calls Made',
      'Walk-ins Attended',
      'Test Drives Conducted',
      'Bookings Taken',
      'Deliveries Done',
      'Accounts Collection',
      'Notes & Tasks',
      'Logged At',
    ];

    const rows = currentLogs.map((l) => [
      `"${l.hourSlot}"`,
      `"${l.date}"`,
      `"${l.employeeName}"`,
      `"${l.department}"`,
      `"${l.callsMade}"`,
      `"${l.walkinsAttended}"`,
      `"${l.testDrivesConducted}"`,
      `"${l.bookingsTaken}"`,
      `"${l.deliveriesDone}"`,
      `"${l.accountsCollectionAmount}"`,
      `"${l.notes.replace(/"/g, '""')}"`,
      `"${l.timestamp}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hourly_Activity_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Showroom Hourly Activity Report</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time hourly logging from 09:00 AM to 08:00 PM for all showroom floor personnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportHourlyToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setLogFormData({
                date: selectedDate,
                hourSlot: DEFAULT_HOURLY_SLOTS[2],
                employeeId: currentEmployee.id,
                employeeName: currentEmployee.name,
                department: currentEmployee.department,
                callsMade: currentEmployee.department === 'Sales' ? 6 : 2,
                walkinsAttended: 1,
                testDrivesConducted: 0,
                bookingsTaken: 0,
                deliveriesDone: 0,
                serviceJobCardsCreated: 0,
                serviceVehiclesDelivered: 0,
                accountsCollectionAmount: 0,
                edpTasksCompleted: 0,
                notes: '',
              });
              setIsLogModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Hourly Activity</span>
          </button>
        </div>
      </div>

      {/* Date & Staff Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Report Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Staff Member:</span>
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Showroom Staff</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.designation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hourly Slot Pulse Bar (Visual Timeline Overview) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Daily Hourly Distribution Heat-Map (09:00 - 20:00)
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Peak Walk-in Rush: 11:00-13:00 &amp; 17:00-19:00
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
          {slotAggregates.map((slot) => {
            const hasActivity = slot.logsCount > 0;
            return (
              <div
                key={slot.slot}
                onClick={() => {
                  setLogFormData({
                    ...logFormData,
                    hourSlot: slot.slot,
                    date: selectedDate,
                  });
                  setIsLogModalOpen(true);
                }}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer hover:border-blue-500/80 ${
                  hasActivity
                    ? 'bg-slate-850 border-blue-500/30 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                }`}
              >
                <span className="text-[10px] font-mono text-cyan-300 font-semibold block truncate">
                  {slot.slot}
                </span>

                <div className="mt-1.5 flex flex-col items-center">
                  <span className={`text-sm font-bold ${slot.totalBookings > 0 ? 'text-amber-400' : 'text-white'}`}>
                    {slot.totalCalls + slot.totalWalkins + slot.totalTDs}
                  </span>
                  <span className="text-[9px] text-slate-400">actions</span>
                </div>

                {slot.totalBookings > 0 && (
                  <span className="mt-1 inline-block text-[9px] font-bold text-amber-300 bg-amber-950/60 px-1 rounded">
                    ★ {slot.totalBookings} Bkg
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Activity Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Detailed Hourly Submissions</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              {currentLogs.length} Entries
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Hour Slot</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Calls &amp; Walk-ins</th>
                <th className="px-4 py-3">Test Drives / Bookings</th>
                <th className="px-4 py-3">Service / Accounts</th>
                <th className="px-4 py-3">Activity Description</th>
                <th className="px-4 py-3 text-right">Time Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                    No hourly logs submitted for this date and filter. Click &ldquo;Log Hourly Activity&rdquo; to add one.
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-cyan-300 text-xs px-2 py-1 rounded bg-cyan-950/40 border border-cyan-800/40">
                        {log.hourSlot}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{log.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{log.department}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-300 font-semibold">{log.callsMade} Calls</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-300 font-semibold">{log.walkinsAttended} Walk-ins</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {log.testDrivesConducted > 0 && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold">
                            {log.testDrivesConducted} Test Drives
                          </span>
                        )}
                        {log.bookingsTaken > 0 && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                            ★ {log.bookingsTaken} Booking!
                          </span>
                        )}
                        {log.deliveriesDone > 0 && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                            {log.deliveriesDone} Delivered
                          </span>
                        )}
                        {log.testDrivesConducted === 0 && log.bookingsTaken === 0 && log.deliveriesDone === 0 && (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {log.serviceJobCardsCreated > 0 && (
                        <div className="text-amber-300 font-semibold">{log.serviceJobCardsCreated} Job Cards</div>
                      )}
                      {log.accountsCollectionAmount > 0 && (
                        <div className="text-emerald-400 font-semibold">₹{log.accountsCollectionAmount.toLocaleString('en-IN')}</div>
                      )}
                      {log.serviceJobCardsCreated === 0 && log.accountsCollectionAmount === 0 && (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 max-w-sm">
                      <p className="text-slate-200 line-clamp-2">{log.notes}</p>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-400">
                      {log.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW HOURLY ACTIVITY MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Log Hourly Activity</h3>
                  <p className="text-xs text-slate-400">Record current showroom activity slot</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsLogModalOpen(false);
                  if (onCloseModalByDefault) onCloseModalByDefault();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Staff Member</label>
                  <select
                    value={logFormData.employeeId}
                    onChange={(e) => handleSelectStaffInForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Hour Slot</label>
                  <select
                    value={logFormData.hourSlot}
                    onChange={(e) => setLogFormData({ ...logFormData, hourSlot: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-semibold"
                  >
                    {DEFAULT_HOURLY_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={logFormData.date}
                    onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Action Metrics for this hour */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-2 tracking-wider">
                  Hourly Action Metrics
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Outbound / Inbound Calls</label>
                    <input
                      type="number"
                      min="0"
                      value={logFormData.callsMade}
                      onChange={(e) => setLogFormData({ ...logFormData, callsMade: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Walk-ins Attended</label>
                    <input
                      type="number"
                      min="0"
                      value={logFormData.walkinsAttended}
                      onChange={(e) => setLogFormData({ ...logFormData, walkinsAttended: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Test Drives Conducted</label>
                    <input
                      type="number"
                      min="0"
                      value={logFormData.testDrivesConducted}
                      onChange={(e) => setLogFormData({ ...logFormData, testDrivesConducted: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-purple-300 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Vehicle Bookings Taken</label>
                    <input
                      type="number"
                      min="0"
                      value={logFormData.bookingsTaken}
                      onChange={(e) => setLogFormData({ ...logFormData, bookingsTaken: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold mt-1"
                    />
                  </div>
                </div>

                {/* Second row: deliveries, collections, service */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mt-3 pt-3 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Vehicle Deliveries Done</label>
                    <input
                      type="number"
                      min="0"
                      value={logFormData.deliveriesDone}
                      onChange={(e) => setLogFormData({ ...logFormData, deliveriesDone: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Service Job Cards</label>
                    <input
                      type="number"
                      min="0"
                      value={logFormData.serviceJobCardsCreated}
                      onChange={(e) => setLogFormData({ ...logFormData, serviceJobCardsCreated: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Collections (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={logFormData.accountsCollectionAmount}
                      onChange={(e) => setLogFormData({ ...logFormData, accountsCollectionAmount: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-semibold mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Hour Work Notes &amp; Highlights <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={logFormData.notes}
                  onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Conducted test drive for Safari Dark Edition with Dr. Mittal; issued proforma quotation for Punch EV; customer promised booking tomorrow..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Hourly Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
