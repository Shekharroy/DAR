export type BrandType = 
  | 'Tata Motors'
  | 'Mahindra'
  | 'Maruti Suzuki'
  | 'Hyundai'
  | 'Honda'
  | 'Skoda'
  | 'BMW'
  | 'Mercedes-Benz'
  | 'Audi'
  | 'Nissan'
  | 'Porsche'
  | 'Ferrari';

export type DepartmentType = 
  | 'Sales'
  | 'Service'
  | 'CRM & CRE'
  | 'Reception'
  | 'Management'
  | 'Marketing & Events'
  | 'EDP & IT'
  | 'Accounts & Finance';

export type DesignationType = 
  | 'Sales Consultant'
  | 'Sales Executive'
  | 'Senior Sales Executive'
  | 'Team Leader - Sales'
  | 'Sales Manager'
  | 'Service Advisor'
  | 'Service Manager'
  | 'Customer Relationship Executive (CRE)'
  | 'Customer Relationship Manager (CRM)'
  | 'Front Desk Receptionist'
  | 'General Manager (GM)'
  | 'Event & Marketing Manager'
  | 'EDP In-Charge / IT Admin'
  | 'Accounts Manager'
  | 'Accounts Executive'
  | 'Cashier';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeCode: string;
  department: DepartmentType;
  designation: DesignationType;
  avatarUrl?: string;
  joiningDate: string;
  baseSalary: number;
  bankAccount: string;
  panNumber: string;
  isActive: boolean;
  salesTargetMonthly?: number; // target vehicle units
}

export interface HourlyLog {
  id: string;
  date: string;
  hourSlot: string; // e.g. "09:00 - 10:00"
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  callsMade: number;
  walkinsAttended: number;
  testDrivesConducted: number;
  bookingsTaken: number;
  deliveriesDone: number;
  serviceJobCardsCreated: number;
  serviceVehiclesDelivered: number;
  accountsCollectionAmount: number;
  edpTasksCompleted: number;
  notes: string;
  timestamp: string;
}

export interface DARReport {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: DepartmentType;
  designation: DesignationType;
  shiftHours: string;
  morningPlan: string;
  tasksCompleted: string;
  pendingTasks: string;
  callsTarget: number;
  callsActual: number;
  walkinTarget: number;
  walkinActual: number;
  testDriveTarget: number;
  testDriveActual: number;
  bookingTarget: number;
  bookingActual: number;
  deliveryActual: number;
  serviceRevenueActual?: number;
  accountsCollected?: number;
  customerEscalations: string;
  edpSyncNotes?: string;
  gmRemarks?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Needs Revision';
  submittedAt: string;
}

export interface LeadItem {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  vehicleInterested: string;
  budgetLakhs: number;
  status: 'Inquiry' | 'Walk-in' | 'Test Drive' | 'Quotation Sent' | 'Negotiation' | 'Booked' | 'Delivered' | 'Lost';
  source: 'Digital Ads' | 'Walk-in' | 'Referral' | 'Event' | 'Phone Call' | 'Newspaper';
  assignedToEmployeeId: string;
  assignedToEmployeeName: string;
  dateAdded: string;
  lastFollowUp: string;
  nextFollowUp: string;
  remarks: string;
  lostReason?: string;
  bookingAmount?: number;
  testDriveVehicleNo?: string;
}

export interface ServiceJobCard {
  id: string;
  jobCardNumber: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  registrationNumber: string;
  serviceType: 'Free Service' | 'Periodic Maintenance' | 'Accidental Repair' | 'Running Repair' | 'Recall';
  serviceAdvisorId: string;
  serviceAdvisorName: string;
  status: 'Vehicle Inward' | 'Under Inspection' | 'Parts Requisition' | 'Work In Progress' | 'Washing & Cleaning' | 'PDI Passed' | 'Ready for Delivery' | 'Delivered';
  estimatedCost: number;
  actualBill: number;
  inwardTime: string;
  promisedDeliveryTime: string;
  csiRating?: number; // 1 to 5
}

export interface AccountLedgerItem {
  id: string;
  accountName: string; // e.g. "HDFC Dealership Escrow", "SBI Auto Finance", "Margin Money Cash Counter"
  accountType: 'Bank Account' | 'Cash Counter' | 'Customer Escrow' | 'RTO Tax Ledger' | 'Spare Parts Account' | 'Accessories Account';
  accountNumber: string;
  bankBranch: string;
  currentBalance: number;
  todayCollections: number;
  todayDisbursements: number;
  status: 'Active' | 'Under Reconciliation' | 'Closed';
  notes: string;
}

export interface EDPTaskItem {
  id: string;
  title: string;
  category: 'DMS Sync' | 'Price List Update' | 'Portal Sync' | 'Hardware & Network' | 'Daily Data Backup' | 'Staff Access Management';
  systemName: string; // e.g. "OEM Dealer Management System", "Vahan RTO Portal", "Insurance Portal"
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On Demand';
  lastRunTime: string;
  status: 'Completed' | 'Pending' | 'In Progress' | 'Failed';
  assignedEdpStaff: string;
  recordsSynced: number;
  remarks: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  totalHoursWorked?: number;
  status: 'Present' | 'Late' | 'Half Day' | 'On Field' | 'Absent' | 'On Leave';
  locationAddress: string;
  notes?: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: DesignationType;
  department: DepartmentType;
  month: string; // e.g. "October 2026"
  daysPresent: number;
  daysInMonth: number;
  basicSalary: number;
  hra: number;
  da: number;
  conveyanceAllowance: number;
  salesIncentive: number;
  performanceBonus: number;
  pfDeduction: number;
  esicDeduction: number;
  professionalTax: number;
  tdsDeduction: number;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: 'Paid' | 'Processing' | 'Generated';
  paidOn?: string;
  transactionRef?: string;
}

export interface ShowroomConfig {
  showroomName: string;
  brand: BrandType;
  branchLocation: string;
  dealershipCode: string;
  gstin: string;
  contactEmail: string;
  contactPhone: string;
  currencySymbol: string;
  workingHours: string;
  // User modular customization toggles
  modulesEnabled: {
    edpSection: boolean;
    accountsSection: boolean;
    hourlyActivity: boolean;
    darWorkReport: boolean;
    serviceDesk: boolean;
    receptionWalkin: boolean;
    payrollAttendance: boolean;
    tvWallboard: boolean;
  };
}
