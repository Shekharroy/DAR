import React, { useState } from 'react';
import { 
  Employee, 
  LeadItem, 
  ShowroomConfig 
} from '../../types/crm';
import { BRAND_CATALOGUES } from '../../services/storage';
import { 
  Users, 
  Plus, 
  Search, 
  Coffee, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Sparkles, 
  Car, 
  PhoneCall, 
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReceptionWalkinViewProps {
  leads: LeadItem[];
  employees: Employee[];
  currentEmployee: Employee;
  config: ShowroomConfig;
  onAddWalkin: (newLead: LeadItem) => void;
}

export const ReceptionWalkinView: React.FC<ReceptionWalkinViewProps> = ({
  leads,
  employees,
  currentEmployee,
  config,
  onAddWalkin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [refreshment, setRefreshment] = useState<'Coffee / Tea' | 'Water' | 'None'>('Coffee / Tea');
  const [testDriveDesired, setTestDriveDesired] = useState(true);

  const brandInfo = BRAND_CATALOGUES[config.brand] || BRAND_CATALOGUES['Tata Motors'];
  const salesStaff = employees.filter(
    (e) => e.department === 'Sales' || e.designation.includes('Sales')
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWalkins = leads.filter(
    (l) => l.source === 'Walk-in' && l.dateAdded === todayStr
  );

  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    const assignedStaff = salesStaff.find((s) => s.id === assignedStaffId) || salesStaff[0] || currentEmployee;

    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      customerName: guestName,
      phone: guestPhone,
      email: '',
      vehicleInterested: vehicleModel || brandInfo.popularModels[0],
      budgetLakhs: 18,
      status: testDriveDesired ? 'Test Drive' : 'Walk-in',
      source: 'Walk-in',
      assignedToEmployeeId: assignedStaff.id,
      assignedToEmployeeName: assignedStaff.name,
      dateAdded: todayStr,
      lastFollowUp: 'Just Arrived',
      nextFollowUp: 'Today On Floor',
      remarks: `Reception Log: Refreshment served (${refreshment}). Test drive desired: ${testDriveDesired ? 'Yes' : 'No'}.`,
    };

    onAddWalkin(newLead);
    setIsModalOpen(false);
    setGuestName('');
    setGuestPhone('');
    confetti({ particleCount: 50, spread: 50 });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Reception Desk &amp; Showroom Footfall Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Greet arriving customers, record walk-in details, offer hospitality refreshments, and allocate sales executives.
          </p>
        </div>

        <button
          onClick={() => {
            setVehicleModel(brandInfo.popularModels[0]);
            setAssignedStaffId(salesStaff[0]?.id || '');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Arriving Guest</span>
        </button>
      </div>

      {/* Reception Live Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Today&apos;s Showroom Walk-ins</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">{todayWalkins.length} Guests</span>
          <span className="text-[10px] text-slate-400">Main showroom entrance</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Available Sales Staff</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{salesStaff.length} On Floor</span>
          <span className="text-[10px] text-emerald-300">Ready for customer introduction</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Test Drive Desired</span>
          <span className="text-2xl font-black text-purple-300 mt-1 block">
            {todayWalkins.filter((w) => w.status === 'Test Drive').length} Requests
          </span>
          <span className="text-[10px] text-slate-400">Demo car keys ready</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Hospitality Lounge</span>
          <span className="text-2xl font-black text-amber-300 mt-1 block">100% Served</span>
          <span className="text-[10px] text-slate-400">Cappuccino &amp; chilled water</span>
        </div>
      </div>

      {/* Available Sales Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          Floor Sales Executives &amp; Consultants On Duty
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {salesStaff.map((staff) => (
            <div
              key={staff.id}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center gap-3"
            >
              <img
                src={staff.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={staff.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div className="truncate flex-1">
                <div className="font-bold text-white text-xs truncate">{staff.name}</div>
                <div className="text-[10px] text-amber-300 font-medium truncate">{staff.designation}</div>
                <div className="text-[10px] text-slate-400">{staff.phone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Walk-in Visitor Register */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Today&apos;s Guest Attendance Register</h3>
          <span className="text-xs text-slate-400">{todayWalkins.length} Visitors logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Visitor Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Vehicle of Interest</th>
                <th className="px-4 py-3">Allocated Sales Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Hospitality &amp; Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {todayWalkins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No walk-in visitors logged yet today. Click &ldquo;Register Arriving Guest&rdquo; to add.
                  </td>
                </tr>
              ) : (
                todayWalkins.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3.5 font-bold text-white">{w.customerName}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{w.phone}</td>
                    <td className="px-4 py-3.5 text-blue-300 font-semibold">{w.vehicleInterested}</td>
                    <td className="px-4 py-3.5 text-amber-300 font-medium">{w.assignedToEmployeeName}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px] truncate max-w-xs">{w.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Register Showroom Walk-in Guest</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterVisitor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Guest Full Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Mr. Alok Saxena"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. +91 98990 12345"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle of Interest</label>
                <select
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {brandInfo.popularModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign to Sales Executive</label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {salesStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hospitality Refreshment</label>
                  <select
                    value={refreshment}
                    onChange={(e) => setRefreshment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Coffee / Tea">Coffee / Tea</option>
                    <option value="Water">Mineral Water</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={testDriveDesired}
                      onChange={(e) => setTestDriveDesired(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Test Drive Desired</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md"
                >
                  Register &amp; Greet Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
