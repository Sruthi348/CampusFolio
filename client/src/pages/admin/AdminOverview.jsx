import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  Building2,
  UserCheck,
  UserPlus,
  KeyRound,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export function AdminOverview() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports')
      .then((res) => {
        if (res.data.success) {
          setReports(res.data);
        }
      })
      .catch((err) => console.error('Error fetching admin reports:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-[#526175]">Loading administrative workspace...</p>
      </div>
    );
  }

  const stats = reports?.stats || {};
  const departmentStats = reports?.departmentStats || [];
  const topViewedStudents = reports?.topViewedStudents || [];
  const pendingVerificationTotal = (stats.pendingVerificationCerts || 0) + (stats.pendingVerificationAchs || 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1.5">
            Institutional Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Governance & Operational Control
          </h1>
          <p className="text-sm sm:text-base text-[#526175] mt-1">
            Centralized management of student cohorts, faculty tutors, academic faculties, and access credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/add-student"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-semibold rounded-lg transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add Student / CSV
          </Link>
          <Link
            to="/admin/verification-logs"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE3EC] hover:bg-[#F4F6F9] text-[#142B4A] text-sm font-semibold rounded-lg transition shadow-xs"
          >
            <ClipboardList className="w-4 h-4" />
            Verification Logs
          </Link>
        </div>
      </div>

      {/* Operational Module Summaries (Management Efficiency) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Student Accounts */}
        <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#142B4A] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526175]">Student Accounts</span>
              <Users className="w-4.5 h-4.5 text-[#142B4A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              {stats.totalStudents || 0}
            </div>
            <p className="text-sm text-[#526175] mt-1">
              {stats.activeStudents || 0} Active • {stats.suspendedStudents || 0} Suspended
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
            <Link to="/admin/students" className="font-semibold text-[#142B4A] hover:underline flex items-center gap-1">
              Manage Roster <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Staff & Class Tutors */}
        <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#243F64] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526175]">Staff & Tutors</span>
              <UserCheck className="w-4.5 h-4.5 text-[#243F64]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              Active Faculty
            </div>
            <p className="text-sm text-[#526175] mt-1">
              Class in-charges assigned to cohort verification
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
            <Link to="/admin/staff" className="font-semibold text-[#243F64] hover:underline flex items-center gap-1">
              Assign Cohorts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Departments & Batches */}
        <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#142B4A] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526175]">Academic Structure</span>
              <Building2 className="w-4.5 h-4.5 text-[#142B4A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              {departmentStats.length} Faculties
            </div>
            <p className="text-sm text-[#526175] mt-1">
              Departments, degree codes & graduation batches
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
            <Link to="/admin/departments" className="font-semibold text-[#142B4A] hover:underline flex items-center gap-1">
              Edit Structure <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Security & Credentials */}
        <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#526175] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526175]">Credentials & Access</span>
              <KeyRound className="w-4.5 h-4.5 text-[#526175]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              RBAC Control
            </div>
            <p className="text-sm text-[#526175] mt-1">
              Password resets, credential re-issue & lockouts
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
            <Link to="/admin/credentials" className="font-semibold text-[#142B4A] hover:underline flex items-center gap-1">
              Manage Logins <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Structured Clean Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department Enrollment Data Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Department Enrollment Breakdown</h2>
              <p className="text-sm text-[#526175]">Active student cohort distribution across academic faculties</p>
            </div>
            <Link to="/admin/departments" className="text-sm font-semibold text-[#142B4A] hover:underline">
              Departments & Batches
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#DCE3EC] text-[#526175] uppercase text-xs font-bold tracking-wider">
                  <th className="py-3 px-3.5">Code</th>
                  <th className="py-3 px-3.5">Faculty / Department Name</th>
                  <th className="py-3 px-3.5 text-right">Students</th>
                  <th className="py-3 px-3.5 text-right">Proportion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EC]">
                {departmentStats.map((dept) => {
                  const count = dept._count?.students || 0;
                  const total = stats.totalStudents || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <tr key={dept.id} className="hover:bg-[#F4F6F9] transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-[#142B4A]">{dept.code}</td>
                      <td className="py-3 px-3.5 font-medium text-[#0F172A]">{dept.name}</td>
                      <td className="py-3 px-3.5 text-right font-bold text-[#0F172A]">{count}</td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className="text-xs text-[#526175] font-semibold">{pct}%</span>
                          <div className="w-20 bg-[#E9EFF6] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-[#142B4A] rounded-full"
                              style={{ width: `${Math.max(8, pct)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Viewed Portfolios Table (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Highest Traffic Portfolios</h2>
              <p className="text-sm text-[#526175]">Students attracting external recruiter views</p>
            </div>
            <Link to="/admin/students" className="text-sm font-semibold text-[#142B4A] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {topViewedStudents.map((st, idx) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] hover:bg-[#FFFFFF] hover:border-[#142B4A] transition text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-bold text-[#526175] w-6 text-center text-xs">#{idx + 1}</span>
                  <div className="min-w-0">
                    <Link
                      to={`/student/${st.slug}`}
                      target="_blank"
                      className="font-bold text-sm text-[#0F172A] hover:text-[#142B4A] transition truncate block"
                    >
                      {st.fullName}
                    </Link>
                    <span className="text-xs text-[#526175] truncate block mt-0.5">
                      {st.department?.code} • {st.batch?.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-[#142B4A] bg-[#E9EFF6] px-2.5 py-1 rounded border border-[#B9C9DD] text-xs shrink-0">
                  <Eye className="w-3.5 h-3.5 text-[#142B4A]" />
                  <span>{st.profileViews} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
