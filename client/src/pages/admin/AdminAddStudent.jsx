import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  UserPlus,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Download,
  Loader2,
  ArrowRight
} from 'lucide-react';

export function AdminAddStudent() {
  const navigate = useNavigate();

  // Departments and Batches metadata
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);

  // Single student form
  const [singleData, setSingleData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    departmentId: '',
    batchId: '',
    initialPassword: 'College@123'
  });
  const [singleSaving, setSingleSaving] = useState(false);
  const [singleMessage, setSingleMessage] = useState({ type: '', text: '' });

  // CSV Import state
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    api.get('/public/meta').then(res => {
      if (res.data.success) {
        setDepartments(res.data.departments || []);
        setBatches(res.data.batches || []);
        if (res.data.departments?.length > 0) {
          setSingleData(prev => ({
            ...prev,
            departmentId: res.data.departments[0].id
          }));
        }
      }
    });
  }, []);

  // Update batch default when department changes
  useEffect(() => {
    if (singleData.departmentId && batches.length > 0) {
      const filtered = batches.filter(b => b.departmentId === singleData.departmentId);
      if (filtered.length > 0) {
        setSingleData(prev => ({ ...prev, batchId: filtered[0].id }));
      }
    }
  }, [singleData.departmentId, batches]);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setSingleSaving(true);
    setSingleMessage({ type: '', text: '' });

    try {
      const res = await api.post('/admin/students', singleData);
      if (res.data.success) {
        setSingleMessage({
          type: 'success',
          text: `Student ${res.data.student.fullName} provisioned successfully!`
        });
        setSingleData({
          fullName: '',
          email: '',
          rollNumber: '',
          departmentId: departments[0]?.id || '',
          batchId: '',
          initialPassword: 'College@123'
        });
      }
    } catch (err) {
      setSingleMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create student account.'
      });
    } finally {
      setSingleSaving(false);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setImportError('Please choose a .csv file to import.');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/admin/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setImportResult(res.data);
      }
    } catch (err) {
      setImportError(err.response?.data?.message || 'CSV batch import failed.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      "name,email,rollNumber,departmentCode,batchName,password\n" +
      "Kavya Ramesh,kavya.ramesh@college.edu,MCA202422,MCA,2024 - 2026,College@123\n" +
      "Vikram Iyer,vikram.iyer@college.edu,CSE202477,CSE,2022 - 2026,College@123\n" +
      "Sneha Rao,sneha.rao@college.edu,IT202255,IT,2020 - 2024,College@123";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_students_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBatches = batches.filter(b => b.departmentId === singleData.departmentId);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Student Provisioning & Batch Onboarding
        </h1>
        <p className="text-sm text-[#526175] mt-1">
          Add students individually or import entire cohorts using institutional CSV spreadsheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Module 1: Single Student Provisioning */}
        <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#DCE3EC] mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#E9EFF6] text-[#142B4A] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0F172A]">Add Single Student</h2>
              <p className="text-xs text-[#526175]">Creates user credentials & initializes student portfolio</p>
            </div>
          </div>

          {singleMessage.text && (
            <div
              className={`mb-4 p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                singleMessage.type === 'success'
                  ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                  : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
              }`}
            >
              {singleMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
              )}
              <span>{singleMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={singleData.fullName}
                onChange={(e) => setSingleData({ ...singleData, fullName: e.target.value })}
                placeholder="e.g. Keerthana A R"
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Institutional College Email *
              </label>
              <input
                type="email"
                required
                value={singleData.email}
                onChange={(e) => setSingleData({ ...singleData, email: e.target.value })}
                placeholder="e.g. keerthana.ar@college.edu"
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                University Roll Number *
              </label>
              <input
                type="text"
                required
                value={singleData.rollNumber}
                onChange={(e) => setSingleData({ ...singleData, rollNumber: e.target.value })}
                placeholder="e.g. MCA202401"
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Department *
                </label>
                <select
                  value={singleData.departmentId}
                  onChange={(e) => setSingleData({ ...singleData, departmentId: e.target.value })}
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Batch / Class of *
                </label>
                <select
                  value={singleData.batchId}
                  onChange={(e) => setSingleData({ ...singleData, batchId: e.target.value })}
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                >
                  {filteredBatches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.graduationYear})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                Initial Temporary Password
              </label>
              <input
                type="text"
                required
                value={singleData.initialPassword}
                onChange={(e) => setSingleData({ ...singleData, initialPassword: e.target.value })}
                className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
              <p className="text-xs text-[#526175] mt-1">
                Student will be prompted to update this password on first login.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={singleSaving}
                className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {singleSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Provision Student Account
              </button>
            </div>
          </form>
        </div>

        {/* Module 2: CSV Batch Import */}
        <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EC] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E9EFF6] text-[#142B4A] flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#0F172A]">Batch CSV Import</h2>
                <p className="text-xs text-[#526175]">Onboard entire cohorts in seconds</p>
              </div>
            </div>

            <button
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B4A] hover:underline cursor-pointer"
              title="Download Template CSV"
            >
              <Download className="w-3.5 h-3.5" /> Template
            </button>
          </div>

          {importError && (
            <div className="mb-4 p-3 rounded-lg bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importResult && (
            <div className="mb-4 p-4 rounded-lg bg-[#EBF7EE] border border-[#86EFAC] text-xs space-y-2">
              <div className="font-bold text-[#166534] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                {importResult.message}
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="pt-2 border-t border-[#86EFAC] text-[#9A5B0B]">
                  <span className="font-semibold">{importResult.errors.length} skipped row(s):</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>Row {err.row}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleCsvSubmit} className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-[#DCE3EC] rounded-xl p-6 text-center hover:border-[#142B4A] transition-colors bg-[#F4F6F9]">
              <FileSpreadsheet className="w-10 h-10 text-[#B9C9DD] mx-auto mb-2" />
              <label className="font-semibold text-xs text-[#142B4A] hover:underline cursor-pointer block">
                <span>Select a .csv file from your computer</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-[#526175] mt-1">
                {csvFile ? `Selected: ${csvFile.name}` : 'Columns: name, email, rollNumber, departmentCode, batchName, password'}
              </p>
            </div>

            <div className="p-3 bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg text-xs text-[#526175] space-y-1">
              <div className="font-bold text-[#0F172A] flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#142B4A]" /> Required Header Format:
              </div>
              <p className="font-mono text-xs text-[#0F172A] bg-white p-1 rounded border border-[#DCE3EC]">
                name,email,rollNumber,departmentCode,batchName,password
              </p>
              <p>Department codes: MCA, CSE, IT, ECE. Duplicate emails or roll numbers will be safely skipped.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={importing || !csvFile}
                className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import Students from CSV
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
