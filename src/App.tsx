import React, { useState, useEffect } from 'react';
import { 
  ShowroomConfig, 
  Employee, 
  DARReport, 
  HourlyLog, 
  LeadItem, 
  ServiceJobCard, 
  AccountLedgerItem, 
  EDPTaskItem, 
  AttendanceRecord, 
  SalarySlip,
  DesignationType 
} from './types/crm';
import { 
  DEFAULT_CONFIG, 
  DEFAULT_EMPLOYEES, 
  DEFAULT_DAR_REPORTS, 
  DEFAULT_HOURLY_LOGS, 
  DEFAULT_LEADS, 
  DEFAULT_SERVICE_JOBS, 
  DEFAULT_ACCOUNTS, 
  DEFAULT_EDP_TASKS, 
  DEFAULT_ATTENDANCE, 
  DEFAULT_SALARY_SLIPS,
  getStoredData,
  setStoredData 
} from './services/storage';

import { Header } from './components/common/Header';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { RoleDashboard } from './components/dashboard/RoleDashboard';
import { DailyActivityReportView } from './components/dar/DailyActivityReportView';
import { HourlyActivityReportView } from './components/hourly/HourlyActivityReportView';
import { CustomReportGenerator } from './components/reports/CustomReportGenerator';
import { AttendanceSalaryModule } from './components/attendance/AttendanceSalaryModule';
import { SalesPipelineView } from './components/sales/SalesPipelineView';
import { ServiceDeskView } from './components/service/ServiceDeskView';
import { ReceptionWalkinView } from './components/reception/ReceptionWalkinView';
import { EDPManagementView } from './components/edp/EDPManagementView';
import { AccountsLedgerView } from './components/accounts/AccountsLedgerView';
import { MarketingEventsView } from './components/marketing/MarketingEventsView';
import { EmployeeDirectoryView } from './components/employees/EmployeeDirectoryView';
import { ShowroomSettingsView } from './components/settings/ShowroomSettingsView';
import { ShowroomTVWallboard } from './components/tv/ShowroomTVWallboard';

import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  Car, 
  Calendar, 
  Menu, 
  TrendingUp, 
  Wrench, 
  Users, 
  DollarSign, 
  Server, 
  Sparkles, 
  Settings, 
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State loaded with fallback to localStorage
  const [config, setConfig] = useState<ShowroomConfig>(() =>
    getStoredData('autocrm_showroom_config', DEFAULT_CONFIG)
  );

  const [employees, setEmployees] = useState<Employee[]>(() =>
    getStoredData('autocrm_employees', DEFAULT_EMPLOYEES)
  );

  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>(() =>
    getStoredData('autocrm_current_user_id', DEFAULT_EMPLOYEES[0].id)
  );

  const [darReports, setDarReports] = useState<DARReport[]>(() =>
    getStoredData('autocrm_dar_reports', DEFAULT_DAR_REPORTS)
  );

  const [hourlyLogs, setHourlyLogs] = useState<HourlyLog[]>(() =>
    getStoredData('autocrm_hourly_logs', DEFAULT_HOURLY_LOGS)
  );

  const [leads, setLeads] = useState<LeadItem[]>(() =>
    getStoredData('autocrm_leads', DEFAULT_LEADS)
  );

  const [serviceJobs, setServiceJobs] = useState<ServiceJobCard[]>(() =>
    getStoredData('autocrm_service_jobs', DEFAULT_SERVICE_JOBS)
  );

  const [accounts, setAccounts] = useState<AccountLedgerItem[]>(() =>
    getStoredData('autocrm_accounts', DEFAULT_ACCOUNTS)
  );

  const [edpTasks, setEdpTasks] = useState<EDPTaskItem[]>(() =>
    getStoredData('autocrm_edp_tasks', DEFAULT_EDP_TASKS)
  );

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    getStoredData('autocrm_attendance', DEFAULT_ATTENDANCE)
  );

  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(() =>
    getStoredData('autocrm_salary_slips', DEFAULT_SALARY_SLIPS)
  );

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isTVMode, setIsTVMode] = useState<boolean>(false);
  const [showMobileMoreDrawer, setShowMobileMoreDrawer] = useState<boolean>(false);
  const [isQuickDARModalOpen, setIsQuickDARModalOpen] = useState<boolean>(false);
  const [isQuickHourlyModalOpen, setIsQuickHourlyModalOpen] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => setStoredData('autocrm_showroom_config', config), [config]);
  useEffect(() => setStoredData('autocrm_employees', employees), [employees]);
  useEffect(() => setStoredData('autocrm_current_user_id', currentEmployeeId), [currentEmployeeId]);
  useEffect(() => setStoredData('autocrm_dar_reports', darReports), [darReports]);
  useEffect(() => setStoredData('autocrm_hourly_logs', hourlyLogs), [hourlyLogs]);
  useEffect(() => setStoredData('autocrm_leads', leads), [leads]);
  useEffect(() => setStoredData('autocrm_service_jobs', serviceJobs), [serviceJobs]);
  useEffect(() => setStoredData('autocrm_accounts', accounts), [accounts]);
  useEffect(() => setStoredData('autocrm_edp_tasks', edpTasks), [edpTasks]);
  useEffect(() => setStoredData('autocrm_attendance', attendance), [attendance]);
  useEffect(() => setStoredData('autocrm_salary_slips', salarySlips), [salarySlips]);

  // Current active logged in employee
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) || employees[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const isPunchedInToday = attendance.some(
    (a) => a.employeeId === currentEmployee.id && a.date === todayStr
  );

  // Handlers
  const handleQuickChangeDesignation = (newDesignation: DesignationType) => {
    const updated = employees.map((emp) =>
      emp.id === currentEmployee.id ? { ...emp, designation: newDesignation } : emp
    );
    setEmployees(updated);
  };

  const handleSaveDAR = (newReport: DARReport) => {
    const exists = darReports.some((r) => r.id === newReport.id);
    if (exists) {
      setDarReports(darReports.map((r) => (r.id === newReport.id ? newReport : r)));
    } else {
      setDarReports([newReport, ...darReports]);
    }
  };

  const handleApproveDAR = (reportId: string, gmRemarks: string) => {
    const updated = darReports.map((r) =>
      r.id === reportId ? { ...r, status: 'Approved' as const, gmRemarks } : r
    );
    setDarReports(updated);
  };

  const handleSaveHourlyLog = (newLog: HourlyLog) => {
    setHourlyLogs([newLog, ...hourlyLogs]);
  };

  const handlePunchAttendance = (newRecord: AttendanceRecord) => {
    setAttendance([newRecord, ...attendance]);
  };

  const handlePunchOutAttendance = (recordId: string, punchOutTime: string) => {
    const updated = attendance.map((a) =>
      a.id === recordId ? { ...a, punchOutTime } : a
    );
    setAttendance(updated);
  };

  const handleResetAllData = () => {
    setConfig(DEFAULT_CONFIG);
    setEmployees(DEFAULT_EMPLOYEES);
    setCurrentEmployeeId(DEFAULT_EMPLOYEES[0].id);
    setDarReports(DEFAULT_DAR_REPORTS);
    setHourlyLogs(DEFAULT_HOURLY_LOGS);
    setLeads(DEFAULT_LEADS);
    setServiceJobs(DEFAULT_SERVICE_JOBS);
    setAccounts(DEFAULT_ACCOUNTS);
    setEdpTasks(DEFAULT_EDP_TASKS);
    setAttendance(DEFAULT_ATTENDANCE);
    setSalarySlips(DEFAULT_SALARY_SLIPS);
    alert('All showroom CRM data has been reset to defaults.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Main Header / Navigation */}
      <div className="no-print">
        <Header
          config={config}
          onUpdateConfig={setConfig}
          employees={employees}
          currentEmployee={currentEmployee}
          onSelectEmployee={(emp) => setCurrentEmployeeId(emp.id)}
          onOpenQuickPunchIn={() => setActiveTab('attendance')}
          isPunchedInToday={isPunchedInToday}
          onToggleTVMode={() => setIsTVMode(true)}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onQuickChangeDesignation={handleQuickChangeDesignation}
        />
      </div>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
        {activeTab === 'dashboard' && (
          <RoleDashboard
            currentEmployee={currentEmployee}
            config={config}
            darReports={darReports}
            hourlyLogs={hourlyLogs}
            leads={leads}
            serviceJobs={serviceJobs}
            accounts={accounts}
            edpTasks={edpTasks}
            attendance={attendance}
            onNavigateTab={setActiveTab}
            onQuickChangeDesignation={handleQuickChangeDesignation}
            onApproveDAR={handleApproveDAR}
            onOpenNewDARModal={() => setIsQuickDARModalOpen(true)}
            onOpenNewHourlyModal={() => setIsQuickHourlyModalOpen(true)}
          />
        )}

        {activeTab === 'dar' && (
          <DailyActivityReportView
            darReports={darReports}
            employees={employees}
            currentEmployee={currentEmployee}
            onSaveDAR={handleSaveDAR}
            onApproveDAR={handleApproveDAR}
            isModalOpenByDefault={isQuickDARModalOpen}
            onCloseModalByDefault={() => setIsQuickDARModalOpen(false)}
          />
        )}

        {activeTab === 'hourly' && (
          <HourlyActivityReportView
            hourlyLogs={hourlyLogs}
            employees={employees}
            currentEmployee={currentEmployee}
            onSaveHourlyLog={handleSaveHourlyLog}
            isModalOpenByDefault={isQuickHourlyModalOpen}
            onCloseModalByDefault={() => setIsQuickHourlyModalOpen(false)}
          />
        )}

        {activeTab === 'leads' && (
          <SalesPipelineView
            leads={leads}
            employees={employees}
            currentEmployee={currentEmployee}
            config={config}
            onUpdateLeads={setLeads}
            onQuickChangeDesignation={handleQuickChangeDesignation}
          />
        )}

        {activeTab === 'service' && (
          <ServiceDeskView
            serviceJobs={serviceJobs}
            employees={employees}
            currentEmployee={currentEmployee}
            config={config}
            onUpdateServiceJobs={setServiceJobs}
          />
        )}

        {activeTab === 'reception' && (
          <ReceptionWalkinView
            leads={leads}
            employees={employees}
            currentEmployee={currentEmployee}
            config={config}
            onAddWalkin={(newLead) => setLeads([newLead, ...leads])}
          />
        )}

        {activeTab === 'reports' && (
          <CustomReportGenerator
            config={config}
            employees={employees}
            darReports={darReports}
            hourlyLogs={hourlyLogs}
            leads={leads}
            serviceJobs={serviceJobs}
            accounts={accounts}
            attendance={attendance}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceSalaryModule
            config={config}
            employees={employees}
            currentEmployee={currentEmployee}
            attendance={attendance}
            salarySlips={salarySlips}
            onPunchAttendance={handlePunchAttendance}
            onPunchOutAttendance={handlePunchOutAttendance}
          />
        )}

        {activeTab === 'edp' && config.modulesEnabled.edpSection && (
          <EDPManagementView
            edpTasks={edpTasks}
            config={config}
            onUpdateTasks={setEdpTasks}
            onUpdateConfig={setConfig}
          />
        )}

        {activeTab === 'accounts' && config.modulesEnabled.accountsSection && (
          <AccountsLedgerView
            accounts={accounts}
            config={config}
            onUpdateAccounts={setAccounts}
            onUpdateConfig={setConfig}
          />
        )}

        {activeTab === 'events' && (
          <MarketingEventsView
            config={config}
            currentEmployee={currentEmployee}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeDirectoryView
            employees={employees}
            config={config}
            onUpdateEmployees={setEmployees}
            onSelectActiveEmployee={(emp) => setCurrentEmployeeId(emp.id)}
            currentEmployee={currentEmployee}
          />
        )}

        {activeTab === 'settings' && (
          <ShowroomSettingsView
            config={config}
            onUpdateConfig={setConfig}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Fullscreen TV Wallboard Presentation Modal */}
      {isTVMode && (
        <ShowroomTVWallboard
          config={config}
          employees={employees}
          darReports={darReports}
          hourlyLogs={hourlyLogs}
          leads={leads}
          serviceJobs={serviceJobs}
          onClose={() => setIsTVMode(false)}
        />
      )}

      {/* MOBILE BOTTOM APP BAR (For Phones & Tablets) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around no-print shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('dar')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'dar' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">DAR</span>
        </button>

        <button
          onClick={() => setActiveTab('hourly')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'hourly' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Hourly</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'leads' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Sales</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'attendance' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Clock/Slip</span>
        </button>

        <button
          onClick={() => setShowMobileMoreDrawer(true)}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer */}
      {showMobileMoreDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 shadow-2xl space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white uppercase tracking-wider">All Showroom Portals</span>
              <button
                onClick={() => setShowMobileMoreDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Custom Reports</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('service');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Service Bay</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reception');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Reception Walk-in</span>
              </button>

              {config.modulesEnabled.accountsSection && (
                <button
                  onClick={() => {
                    setActiveTab('accounts');
                    setShowMobileMoreDrawer(false);
                  }}
                  className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Accounts Ledger</span>
                </button>
              )}

              {config.modulesEnabled.edpSection && (
                <button
                  onClick={() => {
                    setActiveTab('edp');
                    setShowMobileMoreDrawer(false);
                  }}
                  className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>EDP / DMS Hub</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab('events');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Marketing &amp; Events</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('employees');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Staff Directory</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Showroom Setup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
