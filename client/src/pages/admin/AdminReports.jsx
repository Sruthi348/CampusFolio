import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  BarChart3,
  Users,
  Award,
  FolderGit2,
  Building2,
  Download,
  Eye,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports')
      .then(res => {
        if (res.data.success) {
          setReports(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    window.open('/api/admin/students/export', '_blank');
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Generating database-derived reports...
      </div>
    );
  }

  const stats = reports?.stats || {};
  const departmentStats = reports?.departmentStats || [];
  const batchStats = reports?.batchStats || [];
  const topViewedStudents = reports?.topViewedStudents || [];
  const popularSkills = reports?.popularSkills || [];

  return (
    <div className="max-w-5xl space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Institutional Reports & Analytics (FR-8.5)
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Database-backed operational reports across departments, skill adoption, and profile reach.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3730A3] hover:bg-[#312E81] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Student Database (CSV)
        </button>
      </div>

      {/* Numerical Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Enrollment</span>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-1">{stats.activeStudents || 0}</div>
          <span className="text-xs text-emerald-600 font-medium">Currently registered</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Alumni Directory</span>
          <div className="text-3xl font-extrabold text-[#92400E] mt-1">{stats.alumniStudents || 0}</div>
          <span className="text-xs text-slate-500 font-medium">Graduated talent</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Projects</span>
          <div className="text-3xl font-extrabold text-[#3730A3] mt-1">{stats.totalProjects || 0}</div>
          <span className="text-xs text-[#0D9488] font-medium">{stats.featuredProjects || 0} Featured on home</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Reviews</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">
            {(stats.pendingVerificationCerts || 0) + (stats.pendingVerificationAchs || 0)}
          </div>
          <span className="text-xs text-amber-700 font-medium">In verification queue</span>
        </div>
      </div>

      {/* Cohort Breakdown Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[#0F172A]">Batch & Cohort Enrollment Statistics</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="py-2.5 px-3">Batch Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Graduation Year</th>
                <th className="py-2.5 px-3 text-right">Student Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batchStats.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{b.name}</td>
                  <td className="py-2.5 px-3 text-[#3730A3]">{b.department?.code}</td>
                  <td className="py-2.5 px-3 text-slate-500">{b.graduationYear}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{b._count?.students || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Skills Barometer */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[#0F172A]">Student Competency Distribution (Top Skills)</h2>

        <div className="space-y-3">
          {popularSkills.map((s) => {
            const count = s._count?.studentSkills || 0;
            const maxCount = Math.max(...popularSkills.map(item => item._count?.studentSkills || 1));
            const pct = Math.round((count / maxCount) * 100);

            return (
              <div key={s.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800">{s.name} ({s.category})</span>
                  <span className="text-[#0D9488] font-bold">{count} Students</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all duration-500"
                    style={{ width: `${Math.max(5, pct)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
