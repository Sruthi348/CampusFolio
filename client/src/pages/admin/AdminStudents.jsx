import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  X
} from 'lucide-react';

export function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch meta for filters
  useEffect(() => {
    api.get('/public/meta').then(res => {
      if (res.data.success) {
        setDepartments(res.data.departments || []);
        setBatches(res.data.batches || []);
      }
    });
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students', {
        params: {
          q: search,
          departmentId: selectedDept,
          batchId: selectedBatch,
          status: selectedStatus,
          page,
          limit: 15
        }
      });
      if (res.data.success) {
        setStudents(res.data.students || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedDept, selectedBatch, selectedStatus, page]);

  const handleStatusUpdate = async (id, newStatus, isApproved = true) => {
    if (newStatus === 'SUSPENDED' && !window.confirm('Are you sure you want to suspend this student account?')) {
      return;
    }
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.patch(`/admin/students/${id}/status`, {
        status: newStatus,
        isApproved
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: `Student status updated to ${newStatus}.` });
        await fetchStudents();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/students/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Student Accounts & Portfolios
          </h1>
          <p className="text-sm text-[#526175] mt-1">
            Manage institutional access, audit student records, and oversee cohort graduation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#DCE3EC] bg-white hover:bg-[#F4F6F9] text-[#526175] text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#526175]" />
            Export CSV
          </button>
          <Link
            to="/admin/add-student"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add Student / Import
          </Link>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#DCE3EC] rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-[#B9C9DD] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, roll no, email..."
              className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
              className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedBatch}
              onChange={(e) => { setSelectedBatch(e.target.value); setPage(1); }}
              className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.graduationYear})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ALUMNI">ALUMNI</option>
              <option value="GRADUATED">GRADUATED</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="PENDING">PENDING APPROVAL</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-[#DCE3EC] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#0F172A]">
            <thead className="bg-[#F4F6F9] border-b border-[#DCE3EC] text-xs font-bold uppercase tracking-wider text-[#526175]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Department & Batch</th>
                <th className="py-3 px-4">Portfolio Records</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3EC]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#526175]">
                    <div className="w-6 h-6 border-2 border-[#142B4A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#526175]">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const isActive = st.status === 'ACTIVE';
                  const isAlumni = st.status === 'ALUMNI' || st.status === 'GRADUATED';
                  const isSuspended = st.status === 'SUSPENDED';

                  return (
                    <tr key={st.id} className="hover:bg-[#F4F6F9] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#142B4A] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                            {st.photoUrl ? (
                              <img src={st.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              st.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#0F172A]">{st.fullName}</div>
                            <div className="text-xs text-[#526175]">{st.user?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A]">
                        {st.rollNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F172A]">{st.department?.code}</div>
                        <div className="text-xs text-[#526175]">{st.batch?.name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#526175] font-medium">
                        {st._count?.projects || 0} Projects • {st._count?.certifications || 0} Certs
                      </td>

                      <td className="py-3.5 px-4">
                        {isActive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#166534] border border-[#86EFAC]">
                            Active
                          </span>
                        )}
                        {isAlumni && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF7EA] text-[#9A5B0B] border border-[#FDE68A]">
                            Alumni
                          </span>
                        )}
                        {isSuspended && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF0F0] text-[#A82222] border border-[#FCA5A5]">
                            Suspended
                          </span>
                        )}
                        {st.status === 'ARCHIVED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F6F9] text-[#526175] border border-[#DCE3EC]">
                            Archived
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/student/${st.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-[#526175] hover:text-[#142B4A] hover:bg-[#E9EFF6] rounded-md transition-colors"
                            title="Preview Public Showcase"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {isActive && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(st.id, 'ALUMNI')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs font-semibold text-[#9A5B0B] bg-[#FEF7EA] hover:bg-[#FDE68A] rounded border border-[#FDE68A] transition-colors cursor-pointer"
                                title="Mark as Alumni"
                              >
                                Graduate
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(st.id, 'SUSPENDED')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs font-semibold text-[#A82222] bg-[#FDF0F0] hover:bg-[#FCA5A5] rounded border border-[#FCA5A5] transition-colors cursor-pointer"
                                title="Suspend Account"
                              >
                                Suspend
                              </button>
                            </>
                          )}

                          {isSuspended && (
                            <button
                              onClick={() => handleStatusUpdate(st.id, 'ACTIVE')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-xs font-semibold text-[#166534] bg-[#EBF7EE] hover:bg-[#86EFAC] rounded border border-[#86EFAC] transition-colors cursor-pointer"
                              title="Reactivate Account"
                            >
                              Reactivate
                            </button>
                          )}

                          {isAlumni && (
                            <button
                              onClick={() => handleStatusUpdate(st.id, 'ARCHIVED')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-xs font-semibold text-[#526175] bg-[#F4F6F9] hover:bg-[#DCE3EC] rounded border border-[#DCE3EC] transition-colors cursor-pointer"
                              title="Archive Profile"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#DCE3EC] bg-[#F4F6F9] flex items-center justify-between text-xs">
            <span className="text-[#526175] font-medium">
              Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, pagination.total)} of {pagination.total} students
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-[#DCE3EC] rounded-lg bg-white text-[#526175] hover:bg-[#F4F6F9] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="font-semibold text-[#0F172A]">Page {page} of {pagination.totalPages}</span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-[#DCE3EC] rounded-lg bg-white text-[#526175] hover:bg-[#F4F6F9] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
