import React, { useState, useEffect } from 'react';
import { 
  ShowroomConfig, 
  Employee, 
  DARReport, 
  HourlyLog, 
  LeadItem, 
  ServiceJobCard 
} from '../../types/crm';
import { BRAND_CATALOGUES } from '../../services/storage';
import { 
  Tv, 
  X, 
  Car, 
  Users, 
  Award, 
  Clock, 
  TrendingUp, 
  Wrench, 
  DollarSign, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShowroomTVWallboardProps {
  config: ShowroomConfig;
  employees: Employee[];
  darReports: DARReport[];
  hourlyLogs: HourlyLog[];
  leads: LeadItem[];
  serviceJobs: ServiceJobCard[];
  onClose: () => void;
}

export const ShowroomTVWallboard: React.FC<ShowroomTVWallboardProps> = ({
  config,
  employees,
  darReports,
  hourlyLogs,
  leads,
  serviceJobs,
  onClose,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const brandInfo = BRAND_CATALOGUES[config.brand] || BRAND_CATALOGUES['Tata Motors'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const totalCalls = hourlyLogs.reduce((sum, l) => sum + l.callsMade, 0);
  const totalWalkins = hourlyLogs.reduce((sum, l) => sum + l.walkinsAttended, 0);
  const totalTDs = hourlyLogs.reduce((sum, l) => sum + l.testDrivesConducted, 0);
  const totalBookings = hourlyLogs.reduce((sum, l) => sum + l.bookingsTaken, 0);
  const totalDeliveries = hourlyLogs.reduce((sum, l) => sum + l.deliveriesDone, 0);

  // Sales executive leaderboard
  const salesLeaderboard = employees
    .filter((e) => e.department === 'Sales' || e.designation.includes('Sales'))
    .map((staff) => {
      const bookedCount = leads.filter(
        (l) => l.assignedToEmployeeId === staff.id && (l.status === 'Booked' || l.status === 'Delivered')
      ).length;
      return {
        ...staff,
        unitsAchieved: bookedCount,
        progressPct: Math.min(100, Math.round((bookedCount / (staff.salesTargetMonthly || 10)) * 100)),
      };
    })
    .sort((a, b) => b.unitsAchieved - a.unitsAchieved);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 sm:p-8 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top TV Command Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/10"
            style={{ backgroundColor: brandInfo.logoColor }}
          >
            <Car className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{config.showroomName}</span>
              <span
                className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded text-white"
                style={{ backgroundColor: brandInfo.logoColor }}
              >
                {config.brand} Showroom
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Live Showroom Wallboard Display • {config.branchLocation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-mono text-2xl sm:text-3xl font-black text-cyan-400 block tracking-wider">
              {currentTime}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <button
            onClick={() => {
              confetti({ particleCount: 100, spread: 80 });
            }}
            className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition"
            title="Celebrate Milestone"
          >
            <Sparkles className="w-6 h-6" />
          </button>

          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Exit TV Mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main TV Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Big KPIs */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Calls</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-black text-white">{totalCalls}</span>
              </div>
              <span className="text-xs text-blue-400">Outbound inquiries</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Walk-in Guests</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-black text-emerald-400">{totalWalkins}</span>
              </div>
              <span className="text-xs text-emerald-300">Showroom floor footfall</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Test Drives</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-black text-purple-300">{totalTDs}</span>
              </div>
              <span className="text-xs text-purple-300">Fleet demo sessions</span>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-xl flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Bookings Signed</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-black text-amber-400">★ {totalBookings}</span>
              </div>
              <span className="text-xs text-amber-200">Tokens deposited</span>
            </div>
          </div>

          {/* New Deliveries Scheduled Today Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Vehicle Deliveries Ceremony
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                {totalDeliveries} Completed Today
              </span>
            </div>

            <div className="space-y-3">
              {leads
                .filter((l) => l.status === 'Booked' || l.status === 'Delivered')
                .slice(0, 3)
                .map((lead) => (
                  <div key={lead.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{lead.customerName}</div>
                      <div className="text-xs text-cyan-300 font-semibold">{lead.vehicleInterested}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Advisor: {lead.assignedToEmployeeName}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Center Column: Top Sales Champions Leaderboard */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Monthly Sales Champions Leaderboard
            </h3>
            <span className="text-xs text-slate-400">Target vs Actual</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {salesLeaderboard.map((staff, idx) => (
              <div
                key={staff.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center gap-4"
              >
                <div className="font-black text-xl text-slate-500 w-6 text-center">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>

                <img
                  src={staff.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={staff.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-700"
                />

                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm truncate">{staff.name}</span>
                    <span className="text-amber-400 font-black text-sm">{staff.unitsAchieved} Cars</span>
                  </div>
                  <div className="text-xs text-slate-400">{staff.designation}</div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-amber-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${staff.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Hourly Dealership Pulse */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Live Showroom Hourly Stream
            </h3>
            <span className="text-xs font-mono text-cyan-300 font-bold">09:00 - 20:00</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {hourlyLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="font-mono text-cyan-400">{log.hourSlot}</span>
                  <span className="text-slate-300">{log.employeeName}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>{log.callsMade} Calls</span>
                  <span>•</span>
                  <span>{log.walkinsAttended} Walk-ins</span>
                  {log.testDrivesConducted > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-purple-300 font-semibold">{log.testDrivesConducted} TDs</span>
                    </>
                  )}
                  {log.bookingsTaken > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">★ Booking!</span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-slate-300 text-[11px] truncate">{log.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Live Ticker */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">Live Dealership Ticker:</span>
          <span className="text-slate-300 truncate">
            &ldquo;Target for today: 28 Test Drives, 4 Bookings. Keep customer satisfaction high across all sales and service touchpoints!&rdquo;
          </span>
        </div>
        <div className="hidden sm:block text-[11px] font-mono text-slate-500">
          AutoCRM Pro v2.4 • Dealership Display System
        </div>
      </div>
    </div>
  );
};
