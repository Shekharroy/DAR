import React, { useState } from 'react';
import { 
  Employee, 
  DepartmentType, 
  DesignationType, 
  ShowroomConfig 
} from '../../types/crm';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Building, 
  Award, 
  Check, 
  X,
  CreditCard
} from 'lucide-react';

interface EmployeeDirectoryViewProps {
  employees: Employee[];
  config: ShowroomConfig;
  onUpdateEmployees: (employees: Employee[]) => void;
  onSelectActiveEmployee: (employee: Employee) => void;
  currentEmployee: Employee;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({
  employees,
  config,
  onUpdateEmployees,
  onSelectActiveEmployee,
  currentEmployee,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const designationsList: DesignationType[] = [
    'Sales Consultant',
    'Sales Executive',
    'Senior Sales Executive',
    'Team Leader - Sales',
    'Sales Manager',
    'Service Advisor',
    'Service Manager',
    'Customer Relationship Executive (CRE)',
    'Customer Relationship Manager (CRM)',
    'Front Desk Receptionist',
    'General Manager (GM)',
    'Event & Marketing Manager',
    'EDP In-Charge / IT Admin',
    'Accounts Manager',
    'Accounts Executive',
    'Cashier',
  ];

  const departmentsList: DepartmentType[] = [
    'Sales',
    'Service',
    'CRM & CRE',
    'Reception',
    'EDP & IT',
    'Accounts & Finance',
    'Marketing & Events',
    'Management',
  ];

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    employeeCode: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
    department: 'Sales',
    designation: 'Sales Executive',
    baseSalary: 40000,
    bankAccount: 'HDFC0019283',
    panNumber: 'ABCDE1234F',
    joiningDate: new Date().toISOString().split('T')[0],
    isActive: true,
    salesTargetMonthly: 10,
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeCode: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Sales',
      designation: 'Sales Executive',
      baseSalary: 40000,
      bankAccount: 'HDFC0019283',
      panNumber: 'ABCDE1234F',
      joiningDate: new Date().toISOString().split('T')[0],
      isActive: true,
      salesTargetMonthly: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  // Requirement: "If a sales consultant's name is listed but a sales executive is required, the user should be able to change the designation."
  const handleQuickChangeDesignation = (empId: string, newDesignation: DesignationType) => {
    const updated = employees.map((emp) =>
      emp.id === empId ? { ...emp, designation: newDesignation } : emp
    );
    onUpdateEmployees(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingEmp) {
      const updated = employees.map((emp) =>
        emp.id === editingEmp.id ? ({ ...emp, ...formData } as Employee) : emp
      );
      onUpdateEmployees(updated);
    } else {
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        employeeCode: formData.employeeCode || `AUTO-${Math.floor(100 + Math.random() * 900)}`,
        department: (formData.department as DepartmentType) || 'Sales',
        designation: (formData.designation as DesignationType) || 'Sales Executive',
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
        baseSalary: Number(formData.baseSalary) || 35000,
        bankAccount: formData.bankAccount || '',
        panNumber: formData.panNumber || '',
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        isActive: true,
        salesTargetMonthly: Number(formData.salesTargetMonthly) || 10,
      };
      onUpdateEmployees([...employees, newEmployee]);
    }
    setIsModalOpen(false);
  };

  const filteredStaff = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Showroom Personnel &amp; Designation Directory</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Register employees, change designations (Sales Consultant ⇄ Sales Executive), and manage roles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Employee</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, designation, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Showroom Departments</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((emp) => (
          <div
            key={emp.id}
            className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
              emp.id === currentEmployee.id
                ? 'bg-slate-900 border-blue-500/60 ring-1 ring-blue-500/30 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={emp.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                      {emp.id === currentEmployee.id && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-cyan-300">{emp.employeeCode}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Edit Staff Member"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Requirement: User should be able to change designation (e.g. Sales Consultant to Sales Executive) */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Designation (Editable Live):
                  </label>
                  <select
                    value={emp.designation}
                    onChange={(e) => handleQuickChangeDesignation(emp.id, e.target.value as DesignationType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                    title="Change designation for this showroom staff member"
                  >
                    {designationsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                  <span>Department:</span>
                  <span className="text-slate-200 font-semibold">{emp.department}</span>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Base Salary:</span>
                  <span className="text-emerald-400 font-semibold">₹{emp.baseSalary.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{emp.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectActiveEmployee(emp)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <span>Switch App to this User</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REGISTER / EDIT EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingEmp ? 'Edit Employee Details' : 'Register New Showroom Employee'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {departmentsList.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
                  >
                    {designationsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Car Sales Target</label>
                  <input
                    type="number"
                    value={formData.salesTargetMonthly}
                    onChange={(e) => setFormData({ ...formData, salesTargetMonthly: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md"
                >
                  {editingEmp ? 'Save Changes' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
