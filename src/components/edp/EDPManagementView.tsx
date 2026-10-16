import React, { useState } from 'react';
import { 
  EDPTaskItem, 
  ShowroomConfig 
} from '../../types/crm';
import { 
  Server, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Settings, 
  Database, 
  Sliders, 
  X, 
  Check 
} from 'lucide-react';

interface EDPManagementViewProps {
  edpTasks: EDPTaskItem[];
  config: ShowroomConfig;
  onUpdateTasks: (tasks: EDPTaskItem[]) => void;
  onUpdateConfig: (config: ShowroomConfig) => void;
}

export const EDPManagementView: React.FC<EDPManagementViewProps> = ({
  edpTasks,
  config,
  onUpdateTasks,
  onUpdateConfig,
}) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EDPTaskItem | null>(null);
  const [isSectionConfigOpen, setIsSectionConfigOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<EDPTaskItem>>({
    title: '',
    category: 'DMS Sync',
    systemName: 'OEM Dealer Management System',
    frequency: 'Daily',
    status: 'Completed',
    assignedEdpStaff: 'Deepak Rao',
    recordsSynced: 10,
    remarks: '',
  });

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      category: 'DMS Sync',
      systemName: 'OEM Dealer Management System',
      frequency: 'Daily',
      status: 'Completed',
      assignedEdpStaff: 'Deepak Rao',
      recordsSynced: 10,
      remarks: '',
    });
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: EDPTaskItem) => {
    setEditingTask(task);
    setFormData({ ...task });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this EDP task? This will remove it from the system.')) {
      const updated = edpTasks.filter((t) => t.id !== taskId);
      onUpdateTasks(updated);
    }
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingTask) {
      // Update existing
      const updated = edpTasks.map((t) =>
        t.id === editingTask.id
          ? ({
              ...t,
              ...formData,
              lastRunTime: 'Just now',
            } as EDPTaskItem)
          : t
      );
      onUpdateTasks(updated);
    } else {
      // Create new
      const newTask: EDPTaskItem = {
        id: `edp-${Date.now()}`,
        title: formData.title || '',
        category: (formData.category as any) || 'DMS Sync',
        systemName: formData.systemName || 'OEM DMS',
        frequency: (formData.frequency as any) || 'Daily',
        lastRunTime: 'Just now',
        status: (formData.status as any) || 'Completed',
        assignedEdpStaff: formData.assignedEdpStaff || 'EDP Staff',
        recordsSynced: Number(formData.recordsSynced) || 0,
        remarks: formData.remarks || '',
      };
      onUpdateTasks([newTask, ...edpTasks]);
    }

    setIsTaskModalOpen(false);
  };

  // User requirement: ability to remove, adjust, or disable EDP section
  const handleToggleEDPSection = () => {
    const newState = !config.modulesEnabled.edpSection;
    onUpdateConfig({
      ...config,
      modulesEnabled: {
        ...config.modulesEnabled,
        edpSection: newState,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">EDP (Electronic Data Processing) &amp; DMS Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage OEM DMS integrations, price lists, insurance synchronization, and daily backup operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Customizer Settings Button */}
          <button
            onClick={() => setIsSectionConfigOpen(!isSectionConfigOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            title="Adjust or Hide EDP Section"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Customize EDP Section</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add EDP Task</span>
          </button>
        </div>
      </div>

      {/* EDP Section Customizer Dropdown Box (Fulfills: "Users should be able to adjust the EDP section based on their needs, such as editing, removing, or deleting it.") */}
      {isSectionConfigOpen && (
        <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Sliders className="w-4 h-4" />
              <span>EDP Section Preferences &amp; Removal Options</span>
            </div>
            <button
              onClick={() => setIsSectionConfigOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Need to customize or remove the EDP module from your showroom workflow? You can toggle its visibility on the main navigation, edit tasks, or clear unneeded entries.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleToggleEDPSection}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                config.modulesEnabled.edpSection
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {config.modulesEnabled.edpSection ? 'Disable / Remove EDP Section from Navigation' : 'Enable EDP Section'}
            </button>

            <button
              onClick={() => {
                if (confirm('Delete all EDP tasks and start fresh?')) {
                  onUpdateTasks([]);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
            >
              Clear All Tasks
            </button>
          </div>
        </div>
      )}

      {/* EDP Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {edpTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-900 rounded-2xl border border-slate-800">
            No EDP tasks currently configured. Click &ldquo;Add EDP Task&rdquo; to create a new task.
          </div>
        ) : (
          edpTasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                    {task.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    task.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                    task.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1">{task.title}</h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">{task.systemName}</p>
                <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  {task.remarks}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  <span>Synced: <strong className="text-white font-mono">{task.recordsSynced}</strong></span>
                  <span className="mx-1">•</span>
                  <span>{task.frequency}</span>
                </div>

                {/* Edit & Delete Task Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Edit EDP Task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                    title="Delete EDP Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Add / Edit Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit EDP / DMS Task' : 'Add New EDP Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Daily OEM DMS Vehicle Inward Sync"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="DMS Sync">DMS Sync</option>
                    <option value="Price List Update">Price List Update</option>
                    <option value="Portal Sync">Portal Sync</option>
                    <option value="Daily Data Backup">Daily Data Backup</option>
                    <option value="Staff Access Management">Staff Access Management</option>
                    <option value="Hardware & Network">Hardware &amp; Network</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target System / Portal Name</label>
                <input
                  type="text"
                  value={formData.systemName}
                  onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Tata Motors DMS, Vahan Portal, NAS Backup"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="On Demand">On Demand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Records Synced</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.recordsSynced}
                    onChange={(e) => setFormData({ ...formData, recordsSynced: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks &amp; Sync Log</label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  placeholder="Details of VINs updated, price slabs configured, or backup verify notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
