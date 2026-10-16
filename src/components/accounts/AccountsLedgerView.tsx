import React, { useState } from 'react';
import { 
  AccountLedgerItem, 
  ShowroomConfig 
} from '../../types/crm';
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building, 
  ShieldCheck, 
  X, 
  Check, 
  Sliders 
} from 'lucide-react';

interface AccountsLedgerViewProps {
  accounts: AccountLedgerItem[];
  config: ShowroomConfig;
  onUpdateAccounts: (accounts: AccountLedgerItem[]) => void;
  onUpdateConfig: (config: ShowroomConfig) => void;
}

export const AccountsLedgerView: React.FC<AccountsLedgerViewProps> = ({
  accounts,
  config,
  onUpdateAccounts,
  onUpdateConfig,
}) => {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountLedgerItem | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  // Form State for Account
  const [accountFormData, setAccountFormData] = useState<Partial<AccountLedgerItem>>({
    accountName: '',
    accountType: 'Bank Account',
    accountNumber: '',
    bankBranch: '',
    currentBalance: 0,
    todayCollections: 0,
    todayDisbursements: 0,
    status: 'Active',
    notes: '',
  });

  // Voucher Form State
  const [voucherData, setVoucherData] = useState({
    type: 'Collection' as 'Collection' | 'Disbursement',
    amount: 50000,
    category: 'Vehicle Booking Token',
    reference: 'HDFC-UPI-982102',
    notes: 'Token money for Tata Safari booking',
  });

  const totalCurrentBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalCollectionsToday = accounts.reduce((sum, a) => sum + (a.todayCollections || 0), 0);
  const totalDisbursementsToday = accounts.reduce((sum, a) => sum + (a.todayDisbursements || 0), 0);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setAccountFormData({
      accountName: '',
      accountType: 'Bank Account',
      accountNumber: '',
      bankBranch: '',
      currentBalance: 0,
      todayCollections: 0,
      todayDisbursements: 0,
      status: 'Active',
      notes: '',
    });
    setIsAddAccountModalOpen(true);
  };

  const handleOpenEdit = (acc: AccountLedgerItem) => {
    setEditingAccount(acc);
    setAccountFormData({ ...acc });
    setIsAddAccountModalOpen(true);
  };

  // Requirement: "The account section should allow users to add or remove accounts as needed."
  const handleDeleteAccount = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    if (confirm(`Are you sure you want to remove account "${acc?.accountName}" from the showroom ledger?`)) {
      const updated = accounts.filter((a) => a.id !== accId);
      onUpdateAccounts(updated);
    }
  };

  const handleSubmitAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.accountName) return;

    if (editingAccount) {
      const updated = accounts.map((a) =>
        a.id === editingAccount.id
          ? ({ ...a, ...accountFormData } as AccountLedgerItem)
          : a
      );
      onUpdateAccounts(updated);
    } else {
      const newAcc: AccountLedgerItem = {
        id: `acc-${Date.now()}`,
        accountName: accountFormData.accountName || '',
        accountType: (accountFormData.accountType as any) || 'Bank Account',
        accountNumber: accountFormData.accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
        bankBranch: accountFormData.bankBranch || 'Dealership Main Branch',
        currentBalance: Number(accountFormData.currentBalance) || 0,
        todayCollections: Number(accountFormData.todayCollections) || 0,
        todayDisbursements: Number(accountFormData.todayDisbursements) || 0,
        status: (accountFormData.status as any) || 'Active',
        notes: accountFormData.notes || '',
      };
      onUpdateAccounts([...accounts, newAcc]);
    }
    setIsAddAccountModalOpen(false);
  };

  const handlePostVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = accounts.map((acc) => {
      if (acc.id === selectedAccountId) {
        if (voucherData.type === 'Collection') {
          return {
            ...acc,
            currentBalance: acc.currentBalance + voucherData.amount,
            todayCollections: acc.todayCollections + voucherData.amount,
          };
        } else {
          return {
            ...acc,
            currentBalance: acc.currentBalance - voucherData.amount,
            todayDisbursements: acc.todayDisbursements + voucherData.amount,
          };
        }
      }
      return acc;
    });

    onUpdateAccounts(updated);
    setIsVoucherModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Accounts &amp; Dealership Banking Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer escrow accounts, margin money, loan disbursement receipts, and cash counters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Record Voucher / Collection</span>
          </button>

          {/* User requirement: "The account section should allow users to add or remove accounts as needed." */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Account</span>
          </button>
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-xs text-slate-400 block">Total Liquidity in Ledgers</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
            ₹{(totalCurrentBalance / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Across {accounts.length} configured accounts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-xs text-slate-400 block">Today&apos;s Inward Collections</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
            ₹{(totalCollectionsToday / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[11px] text-emerald-300 mt-1 block">Tokens, Loan sanctions &amp; Workshop cash</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-xs text-slate-400 block">Today&apos;s Disbursements</span>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 block">
            ₹{(totalDisbursementsToday / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">RTO road taxes, test-drive fuel &amp; vouchers</span>
        </div>
      </div>

      {/* Accounts Listing Table with Add/Remove Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            Configured Dealership Accounts ({accounts.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click &ldquo;Add New Account&rdquo; or delete any unused account
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Account Name &amp; Type</th>
                <th className="px-4 py-3">Account No. &amp; Branch</th>
                <th className="px-4 py-3">Current Balance</th>
                <th className="px-4 py-3">Today&apos;s Inflow</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Purpose / Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-850/50">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-xs">{acc.accountName}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-300">
                      {acc.accountType}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-mono text-slate-200">{acc.accountNumber}</div>
                    <div className="text-[10px] text-slate-400">{acc.bankBranch}</div>
                  </td>

                  <td className="px-4 py-3.5 font-bold text-white text-sm">
                    ₹{acc.currentBalance.toLocaleString('en-IN')}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="text-emerald-400 font-semibold block">
                      +₹{acc.todayCollections.toLocaleString('en-IN')}
                    </span>
                    {acc.todayDisbursements > 0 && (
                      <span className="text-rose-400 text-[10px] block">
                        -₹{acc.todayDisbursements.toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                      {acc.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                    {acc.notes}
                  </td>

                  {/* Actions: Edit & Remove Account */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Account Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                        title="Remove / Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT ACCOUNT MODAL */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingAccount ? 'Edit Account Ledger' : 'Add New Dealership Account'}
              </h3>
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountFormData.accountName}
                  onChange={(e) => setAccountFormData({ ...accountFormData, accountName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. HDFC Auto Loan Escrow or Spare Parts Cash Till"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Type</label>
                  <select
                    value={accountFormData.accountType}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Bank Account">Bank Account</option>
                    <option value="Customer Escrow">Customer Escrow</option>
                    <option value="Cash Counter">Cash Counter</option>
                    <option value="RTO Tax Ledger">RTO Tax Ledger</option>
                    <option value="Spare Parts Account">Spare Parts Account</option>
                    <option value="Accessories Account">Accessories Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Number / ID</label>
                  <input
                    type="text"
                    value={accountFormData.accountNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="e.g. 50200039281"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank Branch</label>
                  <input
                    type="text"
                    value={accountFormData.bankBranch}
                    onChange={(e) => setAccountFormData({ ...accountFormData, bankBranch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. Sector 18 Commercial Hub"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    value={accountFormData.currentBalance}
                    onChange={(e) => setAccountFormData({ ...accountFormData, currentBalance: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Notes &amp; Purpose</label>
                <textarea
                  rows={2}
                  value={accountFormData.notes}
                  onChange={(e) => setAccountFormData({ ...accountFormData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  placeholder="Primary ledger for customer bookings or petty cashier expenses..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
                >
                  {editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD VOUCHER MODAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Record Collection / Voucher</h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Target Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Bal: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Voucher Type</label>
                  <select
                    value={voucherData.type}
                    onChange={(e) => setVoucherData({ ...voucherData, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="Collection">Collection (+ Receipt)</option>
                    <option value="Disbursement">Disbursement (- Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={voucherData.amount}
                    onChange={(e) => setVoucherData({ ...voucherData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category &amp; Reference</label>
                <input
                  type="text"
                  value={voucherData.reference}
                  onChange={(e) => setVoucherData({ ...voucherData, reference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Bank Ref UTR / Cash Voucher No."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
                >
                  Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
