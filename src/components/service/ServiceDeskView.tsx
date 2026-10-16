import React, { useState } from 'react';
import { 
  ServiceJobCard, 
  Employee, 
  ShowroomConfig 
} from '../../types/crm';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Car, 
  Award, 
  X, 
  Check 
} from 'lucide-react';

interface ServiceDeskViewProps {
  serviceJobs: ServiceJobCard[];
  employees: Employee[];
  currentEmployee: Employee;
  config: ShowroomConfig;
  onUpdateServiceJobs: (jobs: ServiceJobCard[]) => void;
}

export const ServiceDeskView: React.FC<ServiceDeskViewProps> = ({
  serviceJobs,
  employees,
  currentEmployee,
  config,
  onUpdateServiceJobs,
}) => {
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState<Partial<ServiceJobCard>>({
    customerName: '',
    customerPhone: '',
    vehicleModel: 'Harrier XZA+',
    registrationNumber: 'DL 01 AB 1234',
    serviceType: 'Periodic Maintenance',
    serviceAdvisorId: currentEmployee.id,
    serviceAdvisorName: currentEmployee.name,
    status: 'Vehicle Inward',
    estimatedCost: 8500,
    actualBill: 0,
    inwardTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    promisedDeliveryTime: '06:00 PM',
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.registrationNumber) return;

    const advisor = employees.find((e) => e.id === formData.serviceAdvisorId) || currentEmployee;

    const newJob: ServiceJobCard = {
      id: `jc-${Date.now()}`,
      jobCardNumber: `JC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: formData.customerName || '',
      customerPhone: formData.customerPhone || '',
      vehicleModel: formData.vehicleModel || 'Showroom Vehicle',
      registrationNumber: formData.registrationNumber || '',
      serviceType: (formData.serviceType as any) || 'Periodic Maintenance',
      serviceAdvisorId: advisor.id,
      serviceAdvisorName: advisor.name,
      status: (formData.status as any) || 'Vehicle Inward',
      estimatedCost: Number(formData.estimatedCost) || 5000,
      actualBill: Number(formData.actualBill) || 0,
      inwardTime: formData.inwardTime || '10:00 AM',
      promisedDeliveryTime: formData.promisedDeliveryTime || '06:00 PM',
      csiRating: 5,
    };

    onUpdateServiceJobs([newJob, ...serviceJobs]);
    setIsNewJobModalOpen(false);
  };

  const handleUpdateStatus = (jobId: string, newStatus: ServiceJobCard['status']) => {
    const updated = serviceJobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          actualBill: newStatus === 'Ready for Delivery' && j.actualBill === 0 ? j.estimatedCost : j.actualBill,
        };
      }
      return j;
    });
    onUpdateServiceJobs(updated);
  };

  const filteredJobs = serviceJobs.filter((j) => {
    const matchesSearch =
      j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Workshop &amp; Service Bay Management</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Service advisor job cards, repair orders, parts requisition, and CSI customer delivery status.
          </p>
        </div>

        <button
          onClick={() => setIsNewJobModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-lg shadow-amber-600/30 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Job Card (RO)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Total Inward Vehicles</span>
          <span className="text-2xl font-bold text-white mt-1 block">{serviceJobs.length}</span>
          <span className="text-[10px] text-slate-400">Workshop floor capacity: 24 bays</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Work In Progress</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            {serviceJobs.filter((j) => j.status === 'Work In Progress' || j.status === 'Under Inspection').length}
          </span>
          <span className="text-[10px] text-amber-300">Active mechanical bays</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Ready for Delivery</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {serviceJobs.filter((j) => j.status === 'Ready for Delivery').length}
          </span>
          <span className="text-[10px] text-emerald-300">Washed &amp; PDI signed off</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Avg CSI Score</span>
          <span className="text-2xl font-bold text-purple-300 mt-1 block">4.9 ★</span>
          <span className="text-[10px] text-slate-400">Target: 4.8+</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search job card, customer, vehicle number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Bay Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Bay Statuses</option>
            <option value="Vehicle Inward">Vehicle Inward</option>
            <option value="Under Inspection">Under Inspection</option>
            <option value="Work In Progress">Work In Progress</option>
            <option value="Washing & Cleaning">Washing &amp; Cleaning</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Service Job Cards Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Job Card No.</th>
                <th className="px-4 py-3">Customer &amp; Phone</th>
                <th className="px-4 py-3">Vehicle &amp; Reg No.</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3">Service Advisor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Delivery Commitment</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-850/50">
                  <td className="px-4 py-3.5 font-mono font-bold text-amber-400">{job.jobCardNumber}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{job.customerName}</div>
                    <div className="text-[10px] text-slate-400">{job.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-200 font-semibold">{job.vehicleModel}</div>
                    <div className="font-mono text-[10px] text-cyan-300">{job.registrationNumber}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{job.serviceType}</td>
                  <td className="px-4 py-3.5 text-slate-300">{job.serviceAdvisorName}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      job.status === 'Ready for Delivery' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      job.status === 'Work In Progress' ? 'bg-amber-500/20 text-amber-300' :
                      job.status === 'Delivered' ? 'bg-slate-800 text-slate-400' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{job.promisedDeliveryTime}</td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {job.status !== 'Delivered' && (
                      <button
                        onClick={() => {
                          const nextStatus =
                            job.status === 'Vehicle Inward' ? 'Work In Progress' :
                            job.status === 'Work In Progress' ? 'Washing & Cleaning' :
                            job.status === 'Washing & Cleaning' ? 'Ready for Delivery' : 'Delivered';
                          handleUpdateStatus(job.id, nextStatus as any);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                      >
                        Advance Status →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW JOB CARD MODAL */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Create Service Job Card (Repair Order)</h3>
              <button
                onClick={() => setIsNewJobModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. Ramesh Verma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. +91 98222 11223"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. Nexon EV Empowered"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="e.g. DL 3C CC 8899"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Periodic Maintenance">Periodic Maintenance</option>
                    <option value="Free Service">Free Service (1st / 2nd / 3rd)</option>
                    <option value="Running Repair">Running Repair</option>
                    <option value="Accidental Repair">Accidental / Bodyshop Repair</option>
                    <option value="Recall">OEM Recall Campaign</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Promised Delivery Time</label>
                  <input
                    type="text"
                    value={formData.promisedDeliveryTime}
                    onChange={(e) => setFormData({ ...formData, promisedDeliveryTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="e.g. 05:30 PM"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md"
                >
                  Generate Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
