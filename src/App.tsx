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

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider, useToast } from './context/ToastContext';
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
import { DealershipAIAssistant } from './components/assistant/DealershipAIAssistant';
import { PushNotificationManager } from './components/common/PushNotificationManager';
import { NotificationService } from './services/notifications';

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
  X,
  Bot,
  Plus,
  Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';

function AppContent() {
  const { showToast } = useToast();

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
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [showMobileMoreDrawer, setShowMobileMoreDrawer] = useState<boolean>(false);
  const [isQuickDARModalOpen, setIsQuickDARModalOpen] = useState<boolean>(false);
  const [isQuickHourlyModalOpen, setIsQuickHourlyModalOpen] = useState<boolean>(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState<boolean>(false);

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

  // Handle service worker notifications click routing
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleMsg = (event: MessageEvent) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          setActiveTab('dar');
          showToast('DAR Report Opened', 'info', 'Navigated to Daily Activity Report from push notification.');
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMsg);
      return () => navigator.serviceWorker.removeEventListener('message', handleMsg);
    }
  }, [showToast]);

  // Current active logged in employee
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) || employees[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const isPunchedInToday = attendance.some(
    (a) => a.employeeId === currentEmployee.id && a.date === todayStr
  );

  // Haptic feedback helper for mobile touch
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore if not permitted
      }
    }
  };

  const handleTabChange = (tab: string) => {
    triggerHaptic();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers with error handling & toasts
  const handleQuickChangeDesignation = (newDesignation: DesignationType) => {
    try {
      const updated = employees.map((emp) =>
        emp.id === currentEmployee.id ? { ...emp, designation: newDesignation } : emp
      );
      setEmployees(updated);
      showToast('Designation Updated', 'success', `Active title changed to "${newDesignation}".`);
    } catch (e: any) {
      showToast('Update Failed', 'error', e.message);
    }
  };

  const handleSaveDAR = (newReport: DARReport) => {
    try {
      const exists = darReports.some((r) => r.id === newReport.id);
      if (exists) {
        setDarReports(darReports.map((r) => (r.id === newReport.id ? newReport : r)));
        showToast('DAR Updated', 'success', `Daily report for ${newReport.date} saved.`);
      } else {
        setDarReports([newReport, ...darReports]);
        showToast('DAR Submitted', 'success', 'Daily activity work report submitted for GM approval.');
      }
    } catch (e: any) {
      showToast('DAR Error', 'error', e.message);
    }
  };

  const handleApproveDAR = async (reportId: string, gmRemarks: string) => {
    try {
      const targetReport = darReports.find((r) => r.id === reportId);
      const updated = darReports.map((r) =>
        r.id === reportId ? { ...r, status: 'Approved' as const, gmRemarks } : r
      );
      setDarReports(updated);
      showToast('DAR Approved', 'success', 'Report approved with GM remarks.');

      // Dispatch push notification to staff member via service worker push
      if (targetReport) {
        await NotificationService.sendDARApprovalAlert({
          employeeId: targetReport.employeeId,
          employeeName: targetReport.employeeName,
          reportId: targetReport.id,
          status: 'Approved',
          gmRemarks,
          senderName: currentEmployee.name,
          title: `DAR Approved: ${targetReport.date}`,
          body: `Great work! Your Daily Activity Report has been APPROVED by GM ${currentEmployee.name}. Remarks: "${gmRemarks || 'Target exceeded!'}"`,
        });
      }
    } catch (e: any) {
      showToast('Approval Error', 'error', e.message);
    }
  };

  const handleSaveHourlyLog = (newLog: HourlyLog) => {
    try {
      setHourlyLogs([newLog, ...hourlyLogs]);
      showToast('Hourly Slot Logged', 'success', `Activity for ${newLog.hourSlot} saved.`);
    } catch (e: any) {
      showToast('Hourly Error', 'error', e.message);
    }
  };

  const handlePunchAttendance = (newRecord: AttendanceRecord) => {
    try {
      setAttendance([newRecord, ...attendance]);
      showToast(
        newRecord.status === 'Late' ? 'Late Clock-In Recorded' : 'Clock-In Successful',
        newRecord.status === 'Late' ? 'warning' : 'success',
        `Punched in at ${newRecord.punchInTime} on showroom floor.`
      );
    } catch (e: any) {
      showToast('Clock-In Failed', 'error', e.message);
    }
  };

  const handlePunchOutAttendance = (recordId: string, punchOutTime: string) => {
    try {
      const updated = attendance.map((a) =>
        a.id === recordId ? { ...a, punchOutTime } : a
      );
      setAttendance(updated);
      showToast('Clock-Out Completed', 'info', `Shift completed at ${punchOutTime}. Have a great evening!`);
    } catch (e: any) {
      showToast('Clock-Out Failed', 'error', e.message);
    }
  };

  const handleResetAllData = () => {
    try {
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
      showToast('Reset Complete', 'info', 'All showroom CRM datasets have been restored to defaults.');
    } catch (e: any) {
      showToast('Reset Error', 'error', e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Main Header / Navigation */}
      <div className="no-print">
        <Header
          config={config}
          onUpdateConfig={setConfig}
          employees={employees}
          currentEmployee={currentEmployee}
          onSelectEmployee={(emp) => {
            setCurrentEmployeeId(emp.id);
            showToast('Role Switched', 'info', `Now viewing as ${emp.name} (${emp.designation})`);
          }}
          onOpenQuickPunchIn={() => handleTabChange('attendance')}
          isPunchedInToday={isPunchedInToday}
          onToggleTVMode={() => setIsTVMode(true)}
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          onQuickChangeDesignation={handleQuickChangeDesignation}
          onOpenAssistant={() => setIsAIAssistantOpen(true)}
          onOpenNotifications={() => setIsPushModalOpen(true)}
          pendingNotificationCount={darReports.filter((r) => r.status === 'Submitted').length}
        />
      </div>

      {/* Main View Area with Mobile Bottom Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-28 lg:pb-8">
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
            onNavigateTab={handleTabChange}
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
            onAddWalkin={(newLead) => {
              setLeads([newLead, ...leads]);
              showToast('Visitor Logged', 'success', `Walk-in guest ${newLead.customerName} assigned.`);
            }}
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

      {/* Floating AI Copilot & Quick Log Button (Mobile App Experience) */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2.5 items-end no-print">
        <button
          onClick={() => {
            triggerHaptic();
            setIsAIAssistantOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all active:scale-90 border border-white/20 cursor-pointer"
          title="Open AI Copilot"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>

      {/* Gemini AI Dealership Assistant Dialog */}
      <DealershipAIAssistant
        config={config}
        currentEmployee={currentEmployee}
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

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

      {/* Push Notification & DAR Staff Alert Manager Modal */}
      <PushNotificationManager
        currentEmployee={currentEmployee}
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        pendingDARReports={darReports.filter((r) => r.status === 'Submitted')}
      />

      {/* NATIVE MOBILE APP BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 mobile-nav-bar flex items-center justify-around no-print shadow-2xl">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-blue-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* PROMINENT "DAR" TAB FOR MOBILE HOME SCREEN USERS */}
        <button
          onClick={() => handleTabChange('dar')}
          className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'dar'
              ? 'text-blue-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileText className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded bg-blue-600 text-[8px] font-black text-white">
              DAR
            </span>
          </div>
          <span className="text-[10px] mt-0.5 font-bold">DAR Report</span>
        </button>

        <button
          onClick={() => handleTabChange('hourly')}
          className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'hourly'
              ? 'text-cyan-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Hourly</span>
        </button>

        <button
          onClick={() => handleTabChange('leads')}
          className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'leads'
              ? 'text-purple-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Sales</span>
        </button>

        <button
          onClick={() => handleTabChange('attendance')}
          className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'text-emerald-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Clock/Pay</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setShowMobileMoreDrawer(true);
          }}
          className="flex flex-col items-center py-2 px-3 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer Sheet */}
      {showMobileMoreDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-xs">
                  DAR
                </span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Showroom Navigation Portals
                </span>
              </div>
              <button
                onClick={() => setShowMobileMoreDrawer(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => {
                  handleTabChange('reports');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Custom Reports</span>
              </button>

              <button
                onClick={() => {
                  handleTabChange('service');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Service Bay RO</span>
              </button>

              <button
                onClick={() => {
                  handleTabChange('reception');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Reception Walk-in</span>
              </button>

              {config.modulesEnabled.accountsSection && (
                <button
                  onClick={() => {
                    handleTabChange('accounts');
                    setShowMobileMoreDrawer(false);
                  }}
                  className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Accounts Ledger</span>
                </button>
              )}

              {config.modulesEnabled.edpSection && (
                <button
                  onClick={() => {
                    handleTabChange('edp');
                    setShowMobileMoreDrawer(false);
                  }}
                  className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>EDP / DMS Hub</span>
                </button>
              )}

              <button
                onClick={() => {
                  handleTabChange('events');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Marketing &amp; Events</span>
              </button>

              <button
                onClick={() => {
                  handleTabChange('employees');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Staff Directory</span>
              </button>

              <button
                onClick={() => {
                  handleTabChange('settings');
                  setShowMobileMoreDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Showroom Setup</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileMoreDrawer(false);
                  setIsPushModalOpen(true);
                }}
                className="p-3.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 text-left border border-blue-500/40 flex items-center gap-2 text-blue-200 col-span-2"
              >
                <Bell className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">Push Notifications &amp; DAR Approval Alerts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
