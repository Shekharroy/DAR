import React, { useState } from 'react';
import { 
  LeadItem, 
  Employee, 
  ShowroomConfig, 
  BrandType,
  DesignationType 
} from '../../types/crm';
import { BRAND_CATALOGUES } from '../../services/storage';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  PhoneCall, 
  Calendar, 
  DollarSign, 
  Award, 
  ChevronRight, 
  X, 
  Check, 
  Clock, 
  User, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SalesPipelineViewProps {
  leads: LeadItem[];
  employees: Employee[];
  currentEmployee: Employee;
  config: ShowroomConfig;
  onUpdateLeads: (leads: LeadItem[]) => void;
  onQuickChangeDesignation: (newDesig: DesignationType) => void;
}

export const SalesPipelineView: React.FC<SalesPipelineViewProps> = ({
  leads,
  employees,
  currentEmployee,
  config,
  onUpdateLeads,
  onQuickChangeDesignation,
}) => {
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  const brandInfo = BRAND_CATALOGUES[config.brand] || BRAND_CATALOGUES['Tata Motors'];

  // Form State
  const [formData, setFormData] = useState<Partial<LeadItem>>({
    customerName: '',
    phone: '',
    email: '',
    vehicleInterested: brandInfo.popularModels[0] || 'SUV Model',
    budgetLakhs: 20,
    status: 'Inquiry',
    source: 'Walk-in',
    assignedToEmployeeId: currentEmployee.id,
    assignedToEmployeeName: currentEmployee.name,
    nextFollowUp: 'Tomorrow, 11:00 AM',
    remarks: '',
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) return;

    const assignedEmp = employees.find((e) => e.id === formData.assignedToEmployeeId) || currentEmployee;

    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      customerName: formData.customerName || '',
      phone: formData.phone || '',
      email: formData.email || '',
      vehicleInterested: formData.vehicleInterested || brandInfo.popularModels[0],
      budgetLakhs: Number(formData.budgetLakhs) || 15,
      status: (formData.status as any) || 'Inquiry',
      source: (formData.source as any) || 'Walk-in',
      assignedToEmployeeId: assignedEmp.id,
      assignedToEmployeeName: assignedEmp.name,
      dateAdded: new Date().toISOString().split('T')[0],
      lastFollowUp: 'Today',
      nextFollowUp: formData.nextFollowUp || 'Tomorrow, 11:00 AM',
      remarks: formData.remarks || '',
      bookingAmount: formData.status === 'Booked' ? Number(formData.bookingAmount) || 25000 : undefined,
    };

    onUpdateLeads([newLead, ...leads]);
    setIsAddLeadModalOpen(false);

    if (newLead.status === 'Booked') {
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleUpdateStatus = (leadId: string, newStatus: LeadItem['status']) => {
    const updated = leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          status: newStatus,
          lastFollowUp: 'Today',
        };
      }
      return l;
    });
    onUpdateLeads(updated);

    if (newStatus === 'Booked') {
      confetti({ particleCount: 90, spread: 70 });
    }
  };

  const filteredLeads = leads.filter((ld) => {
    const matchesSearch =
      ld.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ld.phone.includes(searchQuery) ||
      ld.vehicleInterested.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ld.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Sales &amp; Test Drive Pipeline</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end showroom sales funnel from walk-in inquiry to test drive, booking, and delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Designation Switcher for Sales staff */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Your Title:</span>
            <span className="font-semibold text-amber-300">{currentEmployee.designation}</span>
            <button
              onClick={() => {
                const newTitle = currentEmployee.designation === 'Sales Consultant' ? 'Sales Executive' : 'Sales Consultant';
                onQuickChangeDesignation(newTitle);
              }}
              className="ml-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              Switch
            </button>
          </div>

          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, phone, car model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Stages</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Test Drive">Test Drive</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Booked">Booked</option>
            <option value="Delivered">Delivered</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Pipeline Grid by Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Inquiry', 'Test Drive', 'Negotiation', 'Booked'].map((stage) => {
          const leadsInStage = filteredLeads.filter((l) => l.status === stage);
          return (
            <div key={stage} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {stage}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {leadsInStage.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {leadsInStage.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-xs">
                    No leads in {stage}
                  </div>
                ) : (
                  leadsInStage.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 hover:border-blue-500/50 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{lead.customerName}</span>
                        <span className="text-emerald-400 font-bold text-xs">₹{lead.budgetLakhs}L</span>
                      </div>

                      <div className="text-[11px] text-blue-400 font-semibold mt-1">
                        {lead.vehicleInterested}
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-slate-500" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{lead.assignedToEmployeeName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Next: {lead.nextFollowUp}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                        {lead.remarks}
                      </p>

                      {/* Quick stage advancement buttons */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        {stage === 'Inquiry' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'Test Drive')}
                            className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-[10px] font-semibold transition"
                          >
                            Schedule TD →
                          </button>
                        )}
                        {stage === 'Test Drive' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'Negotiation')}
                            className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-200 text-[10px] font-semibold transition"
                          >
                            Send Quote →
                          </button>
                        )}
                        {stage === 'Negotiation' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'Booked')}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition shadow-sm"
                          >
                            Close Booking ★
                          </button>
                        )}
                        {stage === 'Booked' && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Token: ₹{lead.bookingAmount ? lead.bookingAmount.toLocaleString() : '51,000'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW LEAD MODAL */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Add Showroom Customer Lead</h3>
              <button
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. Dr. R. K. Mittal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. +91 98111 22334"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Interested</label>
                  <select
                    value={formData.vehicleInterested}
                    onChange={(e) => setFormData({ ...formData, vehicleInterested: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {brandInfo.popularModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Budget (₹ Lakhs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.budgetLakhs}
                    onChange={(e) => setFormData({ ...formData, budgetLakhs: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inquiry Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Walk-in">Showroom Walk-in</option>
                    <option value="Digital Ads">Digital (Meta / Google Ads)</option>
                    <option value="Phone Call">Inbound Phone Call</option>
                    <option value="Event">Mall Display / Expo Event</option>
                    <option value="Referral">Existing Customer Referral</option>
                    <option value="Newspaper">Newspaper Print Ad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Test Drive">Test Drive</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Booked">Booked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign to Sales Executive</label>
                <select
                  value={formData.assignedToEmployeeId}
                  onChange={(e) => setFormData({ ...formData, assignedToEmployeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {employees
                    .filter((e) => e.department === 'Sales' || e.designation.includes('Sales'))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks &amp; Key Requirements</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  placeholder="Customer looking for exchange, test drive needed on Saturday..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
