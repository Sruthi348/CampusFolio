import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Building2,
  Layers,
  Plus,
  Archive,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  Loader2
} from 'lucide-react';

export function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add department form state
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });
  const [deptSaving, setDeptSaving] = useState(false);

  // Add batch form state
  const [newBatch, setNewBatch] = useState({ name: '', graduationYear: 2026, departmentId: '' });
  const [batchSaving, setBatchSaving] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
        if (res.data.departments?.length > 0 && !newBatch.departmentId) {
          setNewBatch(prev => ({ ...prev, departmentId: res.data.departments[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDept = async (e) => {
    e.preventDefault();
    setDeptSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/admin/departments', newDept);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Department ${res.data.department.name} created successfully!` });
        setNewDept({ name: '', code: '', description: '' });
        await fetchDepartments();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create department.' });
    } finally {
      setDeptSaving(false);
    }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    setBatchSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/admin/batches', newBatch);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Batch ${res.data.batch.name} created successfully!` });
        setNewBatch(prev => ({ ...prev, name: '' }));
        await fetchDepartments();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create batch.' });
    } finally {
      setBatchSaving(false);
    }
  };

  const handleBatchStatusUpdate = async (batchId, targetStatus) => {
    const actionLabel = targetStatus === 'ALUMNI' ? 'graduate' : 'archive';
    if (!window.confirm(`Are you sure you want to ${actionLabel} all students in this batch?`)) return;

    try {
      const res = await api.post(`/admin/batches/${batchId}/archive-or-graduate`, { targetStatus });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        await fetchDepartments();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Batch action failed.' });
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Academic Departments & Batches
        </h1>
        <p className="text-sm text-[#526175] mt-1">
          Configure academic divisions, graduation cohorts, and execute batch-wide student promotions.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
              : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Creation Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Create Department Card */}
        <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 shadow-xs">
          <h2 className="font-bold text-sm text-[#0F172A] mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#142B4A]" />
            Add Academic Department
          </h2>

          <form onSubmit={handleAddDept} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                placeholder="e.g. Department of Artificial Intelligence"
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Code / Abbreviation *
              </label>
              <input
                type="text"
                required
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                placeholder="e.g. AI or DS"
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={newDept.description}
                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                placeholder="Brief summary of department curricula..."
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg p-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={deptSaving}
              className="w-full py-2 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {deptSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create Department
            </button>
          </form>
        </div>

        {/* Create Batch Card */}
        <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 shadow-xs">
          <h2 className="font-bold text-sm text-[#0F172A] mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#142B4A]" />
            Add Batch / Class Cohort
          </h2>

          <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Department *
              </label>
              <select
                value={newBatch.departmentId}
                onChange={(e) => setNewBatch({ ...newBatch, departmentId: e.target.value })}
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Batch Name *
              </label>
              <input
                type="text"
                required
                value={newBatch.name}
                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                placeholder="e.g. 2025 - 2027"
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Graduation Year *
              </label>
              <input
                type="number"
                required
                min={2000}
                max={2099}
                value={newBatch.graduationYear}
                onChange={(e) => setNewBatch({ ...newBatch, graduationYear: e.target.value })}
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={batchSaving}
              className="w-full py-2 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {batchSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create Batch
            </button>
          </form>
        </div>
      </div>

      {/* Departments & Batches List */}
      <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 shadow-xs space-y-6">
        <h2 className="font-bold text-base text-[#0F172A]">Configured Departments & Batches</h2>

        <div className="space-y-6">
          {departments.map((dept) => (
            <div key={dept.id} className="p-5 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] bg-[#E9EFF6] px-2 py-0.5 rounded border border-[#B9C9DD]">
                    {dept.code}
                  </span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1">{dept.name}</h3>
                  <p className="text-xs text-[#526175]">{dept.description}</p>
                </div>

                <div className="text-xs font-semibold text-[#526175]">
                  {dept._count?.students || 0} Total Students
                </div>
              </div>

              {/* Batches within dept */}
              <div className="pt-3 border-t border-[#DCE3EC]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526175] block mb-2">
                  Cohorts / Batches:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {dept.batches?.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-3.5 rounded-lg border border-[#DCE3EC] flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#0F172A]">{b.name}</div>
                        <div className="text-xs text-[#526175]">
                          Class of {b.graduationYear} • {b._count?.students || 0} Students
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#DCE3EC] flex items-center gap-1.5">
                        <button
                          onClick={() => handleBatchStatusUpdate(b.id, 'ALUMNI')}
                          className="px-2 py-1 text-xs font-semibold bg-[#FEF7EA] text-[#9A5B0B] border border-[#FDE68A] rounded hover:bg-[#FDE68A] transition-colors cursor-pointer"
                          title="Promote entire batch to Alumni"
                        >
                          Graduate Batch
                        </button>
                        <button
                          onClick={() => handleBatchStatusUpdate(b.id, 'ARCHIVED')}
                          className="px-2 py-1 text-xs font-semibold bg-[#F4F6F9] text-[#526175] border border-[#DCE3EC] rounded hover:bg-[#E9EFF6] transition-colors cursor-pointer"
                          title="Archive entire batch"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
