import React, { useState } from 'react';
import { 
  Employee, 
  ShowroomConfig 
} from '../../types/crm';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Users, 
  CheckCircle, 
  Award, 
  X 
} from 'lucide-react';

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'Mall Showcase' | 'Corporate Test Drive Camp' | 'Auto Expo Booth' | 'Digital Performance Ads' | 'VIP Customer Gala';
  location: string;
  startDate: string;
  endDate: string;
  budgetAllocated: number;
  leadsGenerated: number;
  testDrivesConducted: number;
  bookingsAchieved: number;
  status: 'Active' | 'Upcoming' | 'Completed';
  roiPercentage: number;
}

const DEFAULT_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'cmp-1',
    name: 'City Mall Weekend EV & Dark Edition Showcase',
    type: 'Mall Showcase',
    location: 'Grand Atrium, Pacific Mall Hub',
    startDate: '2026-10-18',
    endDate: '2026-10-20',
    budgetAllocated: 150000,
    leadsGenerated: 68,
    testDrivesConducted: 24,
    bookingsAchieved: 5,
    status: 'Active',
    roiPercentage: 340,
  },
  {
    id: 'cmp-2',
    name: 'Tech Park Corporate Fleet & Test Drive Roadshow',
    type: 'Corporate Test Drive Camp',
    location: 'Cyber Park Block B, Tower 2',
    startDate: '2026-10-24',
    endDate: '2026-10-25',
    budgetAllocated: 80000,
    leadsGenerated: 42,
    testDrivesConducted: 18,
    bookingsAchieved: 3,
    status: 'Upcoming',
    roiPercentage: 280,
  },
  {
    id: 'cmp-3',
    name: 'Festive Season Digital Search & Meta Lead Generation',
    type: 'Digital Performance Ads',
    location: 'Targeted Metro Pin Codes (30km Radius)',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    budgetAllocated: 200000,
    leadsGenerated: 195,
    testDrivesConducted: 52,
    bookingsAchieved: 14,
    status: 'Active',
    roiPercentage: 490,
  },
];

interface MarketingEventsViewProps {
  config: ShowroomConfig;
  currentEmployee: Employee;
}

export const MarketingEventsView: React.FC<MarketingEventsViewProps> = ({
  config,
  currentEmployee,
}) => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(DEFAULT_CAMPAIGNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
    name: '',
    type: 'Mall Showcase',
    location: '',
    startDate: '2026-10-22',
    endDate: '2026-10-24',
    budgetAllocated: 100000,
    leadsGenerated: 0,
    testDrivesConducted: 0,
    bookingsAchieved: 0,
    status: 'Upcoming',
  });

  const totalLeadsFromEvents = campaigns.reduce((sum, c) => sum + c.leadsGenerated, 0);
  const totalBookingsFromEvents = campaigns.reduce((sum, c) => sum + c.bookingsAchieved, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.budgetAllocated, 0);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCampaign: MarketingCampaign = {
      id: `cmp-${Date.now()}`,
      name: formData.name || '',
      type: (formData.type as any) || 'Mall Showcase',
      location: formData.location || config.branchLocation,
      startDate: formData.startDate || '2026-10-22',
      endDate: formData.endDate || '2026-10-24',
      budgetAllocated: Number(formData.budgetAllocated) || 50000,
      leadsGenerated: Number(formData.leadsGenerated) || 0,
      testDrivesConducted: Number(formData.testDrivesConducted) || 0,
      bookingsAchieved: Number(formData.bookingsAchieved) || 0,
      status: (formData.status as any) || 'Active',
      roiPercentage: 250,
    };

    setCampaigns([newCampaign, ...campaigns]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Event &amp; Marketing Campaign Management</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track mall displays, roadshows, digital lead generation budgets, and test drive camp conversions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Event / Campaign</span>
        </button>
      </div>

      {/* Aggregate ROI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Total Campaign Leads</span>
          <span className="text-2xl font-bold text-white mt-1 block">{totalLeadsFromEvents} Leads</span>
          <span className="text-[10px] text-emerald-400">High intent prospects</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Event Bookings</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">{totalBookingsFromEvents} Cars</span>
          <span className="text-[10px] text-slate-400">Conversions achieved</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Marketing Spend</span>
          <span className="text-2xl font-bold text-cyan-400 mt-1 block">₹{(totalSpend / 100000).toFixed(1)}L</span>
          <span className="text-[10px] text-slate-400">Allocated budget</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Average Campaign ROI</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">370%</span>
          <span className="text-[10px] text-emerald-300">Revenue to cost ratio</span>
        </div>
      </div>

      {/* Campaigns Listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {camp.type}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  camp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {camp.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-white mt-1">{camp.name}</h4>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{camp.location}</span>
              </p>

              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Budget:</span>
                  <span className="font-semibold text-white">₹{camp.budgetAllocated.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Leads Generated:</span>
                  <span className="font-semibold text-cyan-300">{camp.leadsGenerated} Prospects</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Test Drives Done:</span>
                  <span className="font-semibold text-purple-300">{camp.testDrivesConducted} TDs</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Bookings Signed:</span>
                  <span className="font-bold text-amber-400">★ {camp.bookingsAchieved} Bookings</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                {camp.startDate} to {camp.endDate}
              </span>
              <span className="text-emerald-400 font-bold text-xs bg-emerald-950/60 px-2 py-0.5 rounded">
                ROI: {camp.roiPercentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NEW CAMPAIGN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Create Marketing Campaign</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Weekend Auto Expo Mall Booth"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Campaign Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Mall Showcase">Mall Showcase Display</option>
                  <option value="Corporate Test Drive Camp">Corporate Test Drive Camp</option>
                  <option value="Auto Expo Booth">Auto Expo Booth</option>
                  <option value="Digital Performance Ads">Digital Performance Ads</option>
                  <option value="VIP Customer Gala">VIP Customer Gala</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Venue / Target Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. DLF Mall of India, Ground Floor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budgetAllocated}
                    onChange={(e) => setFormData({ ...formData, budgetAllocated: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
