import React, { useState } from 'react';
import { 
  Employee, 
  ShowroomConfig, 
  BrandType, 
  DesignationType 
} from '../../types/crm';
import { BRAND_CATALOGUES } from '../../services/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Car, 
  Tv, 
  User, 
  Clock, 
  ShieldCheck, 
  Menu, 
  X, 
  LogOut, 
  MapPin, 
  ChevronDown,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

interface HeaderProps {
  config: ShowroomConfig;
  onUpdateConfig: (newConfig: ShowroomConfig) => void;
  employees: Employee[];
  currentEmployee: Employee;
  onSelectEmployee: (employee: Employee) => void;
  onOpenQuickPunchIn: () => void;
  isPunchedInToday: boolean;
  onToggleTVMode: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onQuickChangeDesignation: (newDesignation: DesignationType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  employees,
  currentEmployee,
  onSelectEmployee,
  onOpenQuickPunchIn,
  isPunchedInToday,
  onToggleTVMode,
  activeTab,
  onChangeTab,
  onQuickChangeDesignation,
}) => {
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const brandInfo = BRAND_CATALOGUES[config.brand] || BRAND_CATALOGUES['Tata Motors'];

  const brandsList: BrandType[] = [
    'Tata Motors',
    'Mahindra',
    'Maruti Suzuki',
    'Hyundai',
    'Honda',
    'Skoda',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Nissan',
    'Porsche',
    'Ferrari',
  ];

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

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      {/* Top micro brand ticker bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/60 px-4 py-1 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="flex items-center gap-1 font-semibold text-blue-400">
            <MapPin className="w-3 h-3" /> {config.branchLocation}
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            Code: <strong className="text-slate-300 font-mono">{config.dealershipCode}</strong>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-slate-400">
            Hours: <strong className="text-slate-300">{config.workingHours}</strong>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Showroom CRM Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Designation Switcher for active user */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            <span className="text-[10px] text-slate-400 hidden sm:inline">Designation:</span>
            <select
              value={currentEmployee.designation}
              onChange={(e) => onQuickChangeDesignation(e.target.value as DesignationType)}
              className="bg-transparent text-[11px] font-semibold text-amber-300 focus:outline-none cursor-pointer"
              title="Change employee designation (e.g., Sales Consultant to Sales Executive)"
            >
              {designationsList.map((desig) => (
                <option key={desig} value={desig} className="bg-slate-900 text-slate-100">
                  {desig}
                </option>
              ))}
            </select>
          </div>

          {/* TV Wallboard Quick Button */}
          <button
            onClick={onToggleTVMode}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-500/30 text-[11px] font-semibold transition cursor-pointer"
            title="Launch Fullscreen Showroom TV Wallboard Mode"
          >
            <Tv className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">TV Wallboard</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Dealership Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChangeTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/30 ring-1 ring-white/10 group-hover:ring-blue-400 transition"
                style={{ backgroundColor: brandInfo.logoColor }}
              >
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-blue-400 transition">
                    AutoCRM Pro
                  </span>
                  <span 
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-white"
                    style={{ backgroundColor: brandInfo.logoColor }}
                  >
                    {config.brand}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                  {config.showroomName}
                </span>
              </div>
            </button>

            {/* Brand Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBrandMenu(!showBrandMenu)}
                className="hidden md:flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <span>Change Brand</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showBrandMenu && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-800">
                    Select Dealership Brand
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {brandsList.map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          onUpdateConfig({ ...config, brand: b });
                          setShowBrandMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                          config.brand === b ? 'text-blue-400 font-bold bg-blue-950/30' : 'text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: BRAND_CATALOGUES[b]?.logoColor || '#3b82f6' }}
                          />
                          {b}
                        </span>
                        {config.brand === b && <span className="text-[10px] text-blue-400">Current</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Attendance Punch Button */}
            <button
              onClick={onOpenQuickPunchIn}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 ${
                isPunchedInToday
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
              }`}
              title="Mark Employee Clock-In / Clock-Out"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isPunchedInToday ? 'Punched In (Active)' : 'Punch Attendance'}
              </span>
              <span className="sm:hidden">
                {isPunchedInToday ? 'Punched' : 'Punch'}
              </span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Current Active Employee Avatar & Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
              >
                <div className="relative">
                  <img
                    src={currentEmployee.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentEmployee.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-500/50"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {currentEmployee.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium truncate max-w-[120px]">
                    {currentEmployee.designation}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Employee Selection Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Logged in employee</p>
                    <p className="text-sm font-bold text-white">{currentEmployee.name}</p>
                    <p className="text-xs text-amber-400 font-semibold">{currentEmployee.designation}</p>
                    <p className="text-[11px] text-slate-400">{currentEmployee.department} • Code: {currentEmployee.employeeCode}</p>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                    Switch Employee Role
                  </div>

                  <div className="max-h-60 overflow-y-auto px-1">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          onSelectEmployee(emp);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 hover:bg-slate-800 transition ${
                          emp.id === currentEmployee.id ? 'bg-blue-950/60 text-blue-300 font-semibold border border-blue-800/40' : 'text-slate-300'
                        }`}
                      >
                        <img
                          src={emp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={emp.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div className="flex flex-col truncate">
                          <span className="truncate">{emp.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {emp.designation} ({emp.department})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 mt-2 pt-2 px-3">
                    <button
                      onClick={() => {
                        onChangeTab('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-center py-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Manage Showroom &amp; Roles Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs for Desktop */}
      <div className="hidden lg:block border-t border-slate-800/80 bg-slate-900/60 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Role Dashboard' },
              { id: 'dar', label: 'Daily Work Report (DAR)' },
              { id: 'hourly', label: 'Hourly Activity Report' },
              { id: 'leads', label: 'Sales & Test Drives' },
              { id: 'service', label: 'Service Desk' },
              { id: 'reception', label: 'Reception & Walk-ins' },
              { id: 'reports', label: 'Custom Reports & Export' },
              { id: 'attendance', label: 'Attendance & Salary' },
              // EDP Module can be toggled by user
              ...(config.modulesEnabled.edpSection ? [{ id: 'edp', label: 'EDP / DMS Hub' }] : []),
              // Accounts Module can be customized by user
              ...(config.modulesEnabled.accountsSection ? [{ id: 'accounts', label: 'Accounts & Finance' }] : []),
              { id: 'events', label: 'Events & Marketing' },
              { id: 'employees', label: 'Staff Directory' },
              { id: 'settings', label: 'Showroom Setup' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
          {[
            { id: 'dashboard', label: 'Role Dashboard' },
            { id: 'dar', label: 'Daily Work Report (DAR)' },
            { id: 'hourly', label: 'Hourly Activity Report' },
            { id: 'leads', label: 'Sales & Test Drives' },
            { id: 'service', label: 'Service Desk' },
            { id: 'reception', label: 'Reception & Walk-ins' },
            { id: 'reports', label: 'Custom Reports & Export' },
            { id: 'attendance', label: 'Attendance & Salary Slips' },
            ...(config.modulesEnabled.edpSection ? [{ id: 'edp', label: 'EDP / DMS Hub' }] : []),
            ...(config.modulesEnabled.accountsSection ? [{ id: 'accounts', label: 'Accounts & Finance' }] : []),
            { id: 'events', label: 'Events & Marketing' },
            { id: 'employees', label: 'Staff Directory' },
            { id: 'settings', label: 'Showroom Setup' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onChangeTab(tab.id);
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
