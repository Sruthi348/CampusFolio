import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Award,
  ChevronRight
} from 'lucide-react';

export function StaffStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/staff/students', { params });
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Failed to load assigned students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#142B4A]" />
            Assigned Students
          </h1>
          <p className="text-xs text-[#526175] mt-0.5">
            Students under your institutional mentorship and document verification purview.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD] self-start sm:self-center">
          Total Assigned: <strong>{students.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3EC] shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-[#B9C9DD] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or email..."
            className="w-full text-xs bg-[#F4F6F9] pl-9 pr-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F4F6F9] px-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] font-medium focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="GRADUATED">Graduated</option>
            <option value="ALUMNI">Alumni</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-[#142B4A] text-white rounded-lg text-xs font-semibold hover:bg-[#243F64] transition-colors cursor-pointer shadow-xs"
          >
            Search
          </button>
        </div>
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DCE3EC] p-12 text-center">
          <Users className="w-10 h-10 text-[#B9C9DD] mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-[#0F172A]">No Assigned Students Found</h3>
          <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
            No student matches the specified filter or is assigned to your staff profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-5 flex flex-col justify-between hover:border-[#142B4A] transition-colors group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-[#E9EFF6] text-[#142B4A] font-bold text-sm flex items-center justify-center shrink-0 border border-[#B9C9DD]">
                      {student.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#0F172A] truncate group-hover:text-[#142B4A] transition-colors">
                        {student.fullName}
                      </h3>
                      <p className="text-xs text-[#526175] font-mono">{student.rollNumber}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      student.status === 'ACTIVE'
                        ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                        : student.status === 'SUSPENDED'
                        ? 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
                        : 'bg-[#F4F6F9] text-[#526175] border-[#DCE3EC]'
                    }`}
                  >
                    {student.status}
                  </span>
                </div>

                <div className="text-xs text-[#526175] space-y-1 mb-4 bg-[#F4F6F9] p-3 rounded-lg border border-[#DCE3EC]">
                  <div className="flex justify-between">
                    <span className="text-[#526175]">Department:</span>
                    <span className="font-semibold text-[#0F172A]">{student.department?.code || student.department?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#526175]">Batch:</span>
                    <span className="font-semibold text-[#0F172A]">{student.batch?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#526175]">Email:</span>
                    <span className="font-mono text-xs text-[#0F172A] truncate max-w-[170px]">{student.email}</span>
                  </div>
                </div>

                {/* Document Verification Status Pills */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-4">
                  <div className="p-1.5 rounded-lg bg-[#FEF7EA] border border-[#FDE68A] text-[#9A5B0B]">
                    <span className="font-bold block text-xs">{student.pendingDocs || 0}</span>
                    Pending
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EBF7EE] border border-[#86EFAC] text-[#166534]">
                    <span className="font-bold block text-xs">{student.verifiedDocs || 0}</span>
                    Verified
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222]">
                    <span className="font-bold block text-xs">{student.actionNeeded || 0}</span>
                    Action
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCE3EC] flex items-center justify-between">
                {student.slug && (
                  <Link
                    to={`/student/${student.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#526175] hover:text-[#142B4A] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Public View
                  </Link>
                )}
                <Link
                  to={`/staff/students/${student.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B4A] hover:text-[#243F64] group-hover:translate-x-0.5 transition"
                >
                  Inspect Portfolio <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
