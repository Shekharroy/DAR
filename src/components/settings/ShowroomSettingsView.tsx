import React, { useState } from 'react';
import { 
  ShowroomConfig, 
  BrandType 
} from '../../types/crm';
import { BRAND_CATALOGUES } from '../../services/storage';
import { 
  Settings, 
  Check, 
  Building, 
  Car, 
  Sliders, 
  ShieldCheck, 
  DollarSign, 
  Server, 
  FileText, 
  Clock, 
  RotateCcw 
} from 'lucide-react';

interface ShowroomSettingsViewProps {
  config: ShowroomConfig;
  onUpdateConfig: (newConfig: ShowroomConfig) => void;
  onResetAllData: () => void;
}

export const ShowroomSettingsView: React.FC<ShowroomSettingsViewProps> = ({
  config,
  onUpdateConfig,
  onResetAllData,
}) => {
  const [formData, setFormData] = useState<ShowroomConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleModule = (key: keyof ShowroomConfig['modulesEnabled']) => {
    setFormData({
      ...formData,
      modulesEnabled: {
        ...formData.modulesEnabled,
        [key]: !formData.modulesEnabled[key],
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Dealership &amp; CRM Module Customization</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure dealership franchise branding, toggle sections (EDP, Accounts, etc.), and customize showroom operational settings.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dealership Profile & Brand Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            Dealership Identity &amp; Automobile Brand
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Automobile Franchise Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value as BrandType })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                {brandsList.map((b) => (
                  <option key={b} value={b}>
                    {b} Showroom
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Showroom Title</label>
              <input
                type="text"
                value={formData.showroomName}
                onChange={(e) => setFormData({ ...formData, showroomName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch Location / Address</label>
              <input
                type="text"
                value={formData.branchLocation}
                onChange={(e) => setFormData({ ...formData, branchLocation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dealership OEM Code</label>
              <input
                type="text"
                value={formData.dealershipCode}
                onChange={(e) => setFormData({ ...formData, dealershipCode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Showroom Operating Hours</label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Modular Section Customization (User requirement: adjust EDP, accounts, etc.) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Module Customization &amp; Section Toggles
            </h3>
            <span className="text-xs text-slate-400">Enable or remove modules based on your dealership workflow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* EDP Section Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">EDP &amp; DMS Section</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Electronic Data Processing, OEM DMS sync &amp; backups.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleModule('edpSection')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formData.modulesEnabled.edpSection ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    formData.modulesEnabled.edpSection ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Accounts Section Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Accounts &amp; Banking Section</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Manage bank accounts, margin money, and customer escrows.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleModule('accountsSection')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formData.modulesEnabled.accountsSection ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    formData.modulesEnabled.accountsSection ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Hourly Activity Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Hourly Activity Tracking</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  09:00 - 20:00 hourly timeline logging.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleModule('hourlyActivity')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formData.modulesEnabled.hourlyActivity ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    formData.modulesEnabled.hourlyActivity ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Daily Activity Report (DAR) Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Daily Work Report (DAR)</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Formal morning plan and evening achievement report.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleModule('darWorkReport')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formData.modulesEnabled.darWorkReport ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    formData.modulesEnabled.darWorkReport ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset showroom data to default demo state?')) {
                onResetAllData();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Showroom Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
