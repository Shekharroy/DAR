import React, { useState } from 'react';
import { 
  Employee, 
  ShowroomConfig, 
  DARReport, 
  HourlyLog, 
  LeadItem, 
  ServiceJobCard, 
  AccountLedgerItem, 
  EDPTaskItem, 
  AttendanceRecord,
  DesignationType 
} from '../../types/crm';
import { 
  TrendingUp, 
  Users, 
  Car, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  FileText, 
  DollarSign, 
  Server, 
  Calendar, 
  Plus, 
  ChevronRight, 
  AlertTriangle,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoleDashboardProps {
  currentEmployee: Employee;
  config: ShowroomConfig;
  darReports: DARReport[];
  hourlyLogs: HourlyLog[];
  leads: LeadItem[];
  serviceJobs: ServiceJobCard[];
  accounts: AccountLedgerItem[];
  edpTasks: EDPTaskItem[];
  attendance: AttendanceRecord[];
  onNavigateTab: (tab: string) => void;
  onQuickChangeDesignation: (newDesig: DesignationType) => void;
  onApproveDAR?: (reportId: string, gmRemarks: string) => void;
  onOpenNewDARModal: () => void;
  onOpenNewHourlyModal: () => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  currentEmployee,
  config,
  darReports,
  hourlyLogs,
  leads,
  serviceJobs,
  accounts,
  edpTasks,
  attendance,
  onNavigateTab,
  onQuickChangeDesignation,
  onApproveDAR,
  onOpenNewDARModal,
  onOpenNewHourlyModal,
}) => {
  const [gmApprovalRemarks, setGmApprovalRemarks] = useState<{ [id: string]: string }>({});

  const todayStr = new Date().toISOString().split('T')[0];

  // Aggregates for current employee
  const myHourlyLogsToday = hourlyLogs.filter(
    (l) => l.employeeId === currentEmployee.id && l.date === todayStr
  );
  const myDARReportToday = darReports.find(
    (r) => r.employeeId === currentEmployee.id && r.date === todayStr
  );
  const myLeads = leads.filter(
    (l) => l.assignedToEmployeeId === currentEmployee.id
  );
  const myBookingsCount = myLeads.filter((l) => l.status === 'Booked' || l.status === 'Delivered').length;

  // General showroom totals for today
  const totalCallsToday = hourlyLogs.reduce((sum, l) => sum + (l.callsMade || 0), 0);
  const totalWalkinsToday = hourlyLogs.reduce((sum, l) => sum + (l.walkinsAttended || 0), 0);
  const totalTestDrivesToday = hourlyLogs.reduce((sum, l) => sum + (l.testDrivesConducted || 0), 0);
  const totalBookingsToday = hourlyLogs.reduce((sum, l) => sum + (l.bookingsTaken || 0), 0);
  const totalDeliveriesToday = hourlyLogs.reduce((sum, l) => sum + (l.deliveriesDone || 0), 0);
  const totalCollectionsToday = accounts.reduce((sum, a) => sum + (a.todayCollections || 0), 0);

  // Trigger celebration confetti for high achievement
  const celebrateMilestone = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Role Banner with Designation Quick Customizer */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={currentEmployee.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
              alt={currentEmployee.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, {currentEmployee.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {currentEmployee.department}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                <span>Assigned Role:</span>
                <span className="font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  {currentEmployee.designation}
                </span>
                <span className="text-slate-500">•</span>
                <span>Code: {currentEmployee.employeeCode}</span>
              </p>

              {/* Requirement: Easy designation adjustment (e.g. Sales Consultant vs Sales Executive) */}
              {(currentEmployee.department === 'Sales' || currentEmployee.designation.includes('Sales')) && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Quick Designation Adjuster:</span>
                  <button
                    onClick={() => onQuickChangeDesignation('Sales Executive')}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      currentEmployee.designation === 'Sales Executive'
                        ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Set as Sales Executive
                  </button>
                  <button
                    onClick={() => onQuickChangeDesignation('Sales Consultant')}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      currentEmployee.designation === 'Sales Consultant'
                        ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Set as Sales Consultant
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewHourlyModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Log Hourly Slot</span>
            </button>

            <button
              onClick={onOpenNewDARModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Submit Today&apos;s DAR</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Showroom Pulse Bar (All Roles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Calls Made</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalCallsToday}</div>
          <div className="text-[11px] text-blue-400 mt-0.5">Showroom floor total</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Walk-ins</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalWalkinsToday}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Customer visits today</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Test Drives</span>
            <Car className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalTestDrivesToday}</div>
          <div className="text-[11px] text-purple-400 mt-0.5">Conducted today</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bookings</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">{totalBookingsToday}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tokens booked</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Deliveries</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalDeliveriesToday}</div>
          <div className="text-[11px] text-cyan-400 mt-0.5">New cars handed over</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today&apos;s Receipts</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            ₹{(totalCollectionsToday / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-emerald-300 mt-0.5">Bank &amp; cash accounts</div>
        </div>
      </div>

      {/* ROLE SPECIFIC DASHBOARD VIEWS */}

      {/* 1. SALES EXECUTIVE / SALES CONSULTANT DASHBOARD */}
      {(currentEmployee.department === 'Sales' || currentEmployee.designation.includes('Sales')) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Target vs Achievement Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Monthly Sales Target
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                  Target: {currentEmployee.salesTargetMonthly || 10} Units
                </span>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-500 transition-all duration-1000 ease-out"
                      strokeDasharray={`${Math.min(100, Math.round((myBookingsCount / (currentEmployee.salesTargetMonthly || 10)) * 100))}, 100`}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white">{myBookingsCount}</span>
                    <span className="text-[10px] text-slate-400">of {currentEmployee.salesTargetMonthly || 10} Cars</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Incentive Slabs:</span>
                <span className="text-emerald-400 font-bold">₹2,000 / car</span>
              </div>
            </div>

            {/* Today's Hourly Work Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Today&apos;s Hourly Activity Logged
                </h3>
                <span className="text-xs text-slate-400">{myHourlyLogsToday.length} slots logged</span>
              </div>

              {myHourlyLogsToday.length === 0 ? (
                <div className="mt-8 text-center py-6 text-slate-400 text-xs">
                  <p>No hourly logs submitted yet today.</p>
                  <button
                    onClick={onOpenNewHourlyModal}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Current Hour Activity
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1">
                  {myHourlyLogsToday.map((hl) => (
                    <div key={hl.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span className="text-cyan-400 font-mono">{hl.hourSlot}</span>
                        <span>{hl.callsMade} calls • {hl.walkinsAttended} walk-ins</span>
                      </div>
                      <p className="mt-1 text-slate-400 text-[11px] truncate">{hl.notes}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onNavigateTab('hourly')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  View Full 09:00 - 20:00 Timeline <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* DAR Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Daily Activity Report (DAR)
                </h3>
                {myDARReportToday ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    myDARReportToday.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {myDARReportToday.status}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Pending
                  </span>
                )}
              </div>

              {myDARReportToday ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400">Morning Plan:</span>
                    <p className="text-slate-200 mt-0.5 line-clamp-2">{myDARReportToday.morningPlan}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Completed Work:</span>
                    <p className="text-slate-200 mt-0.5 line-clamp-2">{myDARReportToday.tasksCompleted}</p>
                  </div>
                  {myDARReportToday.gmRemarks && (
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                      <span className="text-[10px] text-purple-300 font-bold block">GM Remarks:</span>
                      <p className="text-slate-200 text-xs italic">&ldquo;{myDARReportToday.gmRemarks}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8 text-center py-4 text-xs text-slate-400">
                  <p>Daily report has not been submitted for today yet.</p>
                  <button
                    onClick={onOpenNewDARModal}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Submit Work Report
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onNavigateTab('dar')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  Go to DAR Hub <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Assigned Customer Leads */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Assigned Follow-ups &amp; Test Drive Pipeline
              </h3>
              <button
                onClick={() => onNavigateTab('leads')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                Manage All Leads <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 rounded-l-lg">Customer</th>
                    <th className="px-4 py-2.5">Vehicle Model</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Next Follow-Up</th>
                    <th className="px-4 py-2.5 rounded-r-lg">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {myLeads.map((ld) => (
                    <tr key={ld.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white">
                        {ld.customerName}
                        <div className="text-[10px] text-slate-400 font-normal">{ld.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{ld.vehicleInterested}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ld.status === 'Booked' ? 'bg-emerald-500/20 text-emerald-300' :
                          ld.status === 'Test Drive' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {ld.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-300 font-mono">{ld.nextFollowUp}</td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">{ld.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERAL MANAGER (GM) EXECUTIVE DASHBOARD */}
      {(currentEmployee.department === 'Management' || currentEmployee.designation.includes('GM') || currentEmployee.designation.includes('General Manager')) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Showroom Financial & Delivery Pulse */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Executive Command Center — Dealership Pulse
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Operational Healthy
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Today&apos;s Bookings</span>
                  <span className="text-2xl font-black text-amber-400">{totalBookingsToday} Units</span>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Token Advance: ₹{(accounts[0]?.todayCollections || 0) / 1000}k</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Deliveries Done</span>
                  <span className="text-2xl font-black text-cyan-400">{totalDeliveriesToday} Units</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">PDI cleared by EDP/Tech</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Active Service Jobs</span>
                  <span className="text-2xl font-black text-purple-400">{serviceJobs.length} Vehicles</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Avg Turnaround: 4.2 hrs</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Staff Punched In</span>
                  <span className="text-2xl font-black text-emerald-400">{attendance.length} Staff</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">94% On-Time Ratio</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Daily DAR Approval Status</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {darReports.filter(r => r.status === 'Submitted').length} reports waiting for GM sign-off today.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('dar')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                >
                  Review All DARs
                </button>
              </div>
            </div>

            {/* Quick GM Review Box for Pending Staff Reports */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Quick GM Sign-off &amp; Remarks
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {darReports.slice(0, 3).map((rep) => (
                  <div key={rep.id} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{rep.employeeName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        rep.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      <strong className="text-slate-400">Achieved:</strong> {rep.tasksCompleted}
                    </p>
                    {rep.status !== 'Approved' && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          placeholder="GM remarks (e.g. Great work)..."
                          value={gmApprovalRemarks[rep.id] || ''}
                          onChange={(e) => setGmApprovalRemarks({ ...gmApprovalRemarks, [rep.id]: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => {
                            if (onApproveDAR) {
                              onApproveDAR(rep.id, gmApprovalRemarks[rep.id] || 'Approved by GM');
                              celebrateMilestone();
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SERVICE ADVISOR / WORKSHOP DASHBOARD */}
      {currentEmployee.department === 'Service' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Workshop Job Cards Inward
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{serviceJobs.length}</span>
                <span className="text-xs text-slate-400">Total job cards today</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                4 Periodic Maintenance, 1 Accidental repair in paint booth, 1 EV diagnostic scan.
              </p>
              <button
                onClick={() => onNavigateTab('service')}
                className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
              >
                Open Service Desk
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Ready for Customer Delivery
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">
                  {serviceJobs.filter(j => j.status === 'Ready for Delivery').length}
                </span>
                <span className="text-xs text-slate-400">PDI &amp; wash inspected</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Customer gate passes prepared with warranty booklet stamp.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Customer Satisfaction (CSI)
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-300">4.9 / 5.0</span>
                <span className="text-xs text-emerald-400">★ ★ ★ ★ ★</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Rated highest among region dealers for cleanliness and on-time bay commitment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. RECEPTION / FRONT DESK DASHBOARD */}
      {currentEmployee.department === 'Reception' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Receptionist &amp; Showroom Footfall Hub
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Log fresh walk-in visitors and assign them to available Sales Executives or Consultants.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reception')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md"
            >
              Log New Walk-in Guest
            </button>
          </div>
        </div>
      )}

      {/* 5. EDP & IT ADMIN DASHBOARD */}
      {currentEmployee.department === 'EDP & IT' && config.modulesEnabled.edpSection && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Electronic Data Processing (EDP) &amp; DMS Gateway
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                OEM Dealer Management System sync, Price list updates, Vahan portal, and security backups.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('edp')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
            >
              Customize &amp; Manage EDP Tasks
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {edpTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{task.category}</span>
                  <span className="text-[10px] text-emerald-400">{task.status}</span>
                </div>
                <p className="text-slate-300 mt-1 font-medium">{task.title}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Last run: {task.lastRunTime} • {task.recordsSynced} records
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ACCOUNTS & FINANCE DASHBOARD */}
      {currentEmployee.department === 'Accounts & Finance' && config.modulesEnabled.accountsSection && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Accounts &amp; Banking Ledgers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage accounts, margin money, bank loans, cash counter, and voucher reconciliations.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md"
            >
              Open Accounts Ledger &amp; Add Accounts
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Grid to Key Automotive Showroom Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('hourly')}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition">Hourly Activity</h4>
          <p className="text-xs text-slate-400 mt-0.5">09:00 - 20:00 hourly timeline log</p>
        </button>

        <button
          onClick={() => onNavigateTab('dar')}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">Daily Work Report</h4>
          <p className="text-xs text-slate-400 mt-0.5">DAR submission &amp; GM sign-off</p>
        </button>

        <button
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition">Attendance &amp; Salary</h4>
          <p className="text-xs text-slate-400 mt-0.5">Clock-in &amp; download pay slips</p>
        </button>

        <button
          onClick={() => onNavigateTab('reports')}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">Custom Reports</h4>
          <p className="text-xs text-slate-400 mt-0.5">Export PDF &amp; CSV analytics</p>
        </button>
      </div>
    </div>
  );
};
