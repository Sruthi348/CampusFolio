import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  KeyRound,
  Search,
  Filter,
  UserCheck,
  GraduationCap,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Lock,
  Calendar,
  AlertTriangle,
  Clock
} from 'lucide-react';

export function AdminCredentials() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Reset credential modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [resetError, setResetError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.q = search;

      const res = await api.get('/admin/credentials', { params });
      if (res.data.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination || { total: res.data.users.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load accounts & credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleOpenReset = (u) => {
    setResetModalUser(u);
    setNewPassword('');
    setResetResult(null);
    setResetError('');
    setCopied(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetModalUser) return;

    setResetting(true);
    setResetError('');

    try {
      const res = await api.post('/admin/credentials/reset', {
        userId: resetModalUser.id,
        newPassword: newPassword ? newPassword.trim() : undefined
      });

      if (res.data.success) {
        setResetResult(res.data);
        fetchUsers();
      }
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset credential.');
    } finally {
      setResetting(false);
    }
  };

  const handleCopyPassword = () => {
    if (resetResult?.tempPassword) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-[#142B4A]" />
            Account & Credential Governance
          </h1>
          <p className="text-xs text-[#526175] mt-0.5">
            Audit institutional credentials, monitor authentication status, and issue secure password initializations.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-[#FEF7EA] border border-[#FDE68A] text-[#9A5B0B] text-xs font-medium flex items-center gap-2 self-start sm:self-center">
          <Lock className="w-4 h-4 text-[#9A5B0B]" />
          <span>Passwords securely hashed with bcrypt</span>
        </div>
      </div>

      {/* Search and Role Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3EC] shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-[#B9C9DD] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student/staff name, roll number, staff ID, or institutional email..."
            className="w-full text-xs bg-[#F4F6F9] pl-9 pr-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-[#F4F6F9] px-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] font-semibold focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="STAFF">Staff (Tutors / In-charge)</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-[#142B4A] text-white rounded-lg text-xs font-semibold hover:bg-[#243F64] transition-colors shadow-xs cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users & Credentials Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DCE3EC] p-12 text-center">
          <KeyRound className="w-12 h-12 text-[#B9C9DD] mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-[#0F172A]">No User Accounts Found</h3>
          <p className="text-xs text-[#526175] mt-1">Try broadening your search or role filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] border-b border-[#DCE3EC] text-[#526175] uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="py-3 px-4">Account Holder</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Affiliation</th>
                  <th className="py-3 px-4">Credential Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EC]">
                {users.map((u) => {
                  const isStudent = u.role === 'STUDENT';
                  const isStaff = u.role === 'STAFF';
                  const isAdmin = u.role === 'ADMIN';

                  const displayName = isStudent
                    ? u.studentProfile?.fullName
                    : isStaff
                    ? u.staffProfile?.fullName
                    : 'System Administrator';

                  const identifier = isStudent
                    ? u.studentProfile?.rollNumber
                    : isStaff
                    ? u.staffProfile?.staffId
                    : 'ADMIN';

                  const dept = isStudent
                    ? u.studentProfile?.department?.code
                    : isStaff
                    ? u.staffProfile?.department?.code
                    : 'CAMPUS-WIDE';

                  return (
                    <tr key={u.id} className="hover:bg-[#F4F6F9] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0F172A]">{displayName}</div>
                        <div className="text-xs text-[#526175] font-mono">{u.email}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isAdmin
                              ? 'bg-[#FEF7EA] text-[#9A5B0B] border-[#FDE68A]'
                              : isStaff
                              ? 'bg-[#E9EFF6] text-[#142B4A] border-[#B9C9DD]'
                              : 'bg-[#E9EFF6] text-[#243F64] border-[#B9C9DD]'
                          }`}
                        >
                          {isAdmin ? (
                            <ShieldAlert className="w-3 h-3 text-[#9A5B0B]" />
                          ) : isStaff ? (
                            <UserCheck className="w-3 h-3 text-[#142B4A]" />
                          ) : (
                            <GraduationCap className="w-3 h-3 text-[#243F64]" />
                          )}
                          {u.role}
                        </span>
                        {identifier && (
                          <span className="block text-xs text-[#526175] font-mono mt-0.5">
                            ID: {identifier}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[#526175] whitespace-nowrap">
                        <span className="font-semibold text-[#0F172A]">{dept || 'Unassigned'}</span>
                        {isStudent && u.studentProfile?.batch?.name && (
                          <span className="block text-xs text-[#526175]">
                            Batch: {u.studentProfile.batch.name}
                          </span>
                        )}
                        {isStaff && u.staffProfile?.designation && (
                          <span className="block text-xs text-[#142B4A]">
                            {u.staffProfile.designation}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {u.isInitialPassword ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#FEF7EA] text-[#9A5B0B] border border-[#FDE68A]">
                            <Clock className="w-3 h-3" /> Initial Password Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#EBF7EE] text-[#166534] border border-[#86EFAC]">
                            <CheckCircle2 className="w-3 h-3" /> Password Customized
                          </span>
                        )}
                        {isStudent && u.studentProfile?.status && (
                          <span className="block text-xs text-[#526175] mt-0.5">
                            Status: <strong className="text-[#0F172A]">{u.studentProfile.status}</strong>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[#526175] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReset(u)}
                          className="px-3 py-1.5 rounded-lg border border-[#DCE3EC] text-xs font-semibold text-[#526175] hover:text-[#142B4A] hover:bg-[#E9EFF6] transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-[#142B4A]" />
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-[#DCE3EC] bg-[#F4F6F9] flex items-center justify-between text-xs text-[#526175]">
              <span>Total accounts: {pagination.total}</span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2.5 py-1 rounded-lg border border-[#DCE3EC] bg-white text-[#526175] disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                <span className="px-2.5 py-1 font-semibold text-[#0F172A]">Page {page} of {pagination.totalPages}</span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-2.5 py-1 rounded-lg border border-[#DCE3EC] bg-white text-[#526175] disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#DCE3EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#142B4A]" />
                  Secure Credential Initialization
                </h3>
                <p className="text-xs text-[#526175]">{resetModalUser.email}</p>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#EBF7EE] border border-[#86EFAC] text-[#166534] text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#166534]">
                    <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                    Temporary Credential Generated!
                  </div>
                  <p>
                    {resetResult.message}
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-[#86EFAC] font-mono text-sm font-bold text-[#0F172A] flex items-center justify-between mt-2">
                    <span>{resetResult.tempPassword}</span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="px-2 py-1 text-xs bg-[#E9EFF6] hover:bg-[#DCE3EC] text-[#142B4A] rounded font-sans flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-[#166534]">
                    Provide this temporary credential to the user securely. They will be mandated to change it upon first login.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-2 bg-[#142B4A] text-white rounded-lg text-xs font-semibold hover:bg-[#243F64] transition-colors cursor-pointer shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                {resetError && (
                  <div className="p-3 rounded-lg bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                <p className="text-[#526175] leading-relaxed">
                  Resetting credentials will invalidate the existing session and set a temporary password with the <strong>Initial Password</strong> flag active.
                </p>

                <div>
                  <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                    Assign Specific Password (Leave blank for auto-generated)
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Auto-generate secure College@XXXX password"
                    className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] font-mono focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                  />
                  <span className="text-xs text-[#526175] block mt-1">
                    Minimum 6 characters. If left empty, a randomized secure password will be created.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC]">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-2 rounded-lg text-[#526175] font-semibold hover:bg-[#E9EFF6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetting}
                    className="px-4 py-2 rounded-lg bg-[#142B4A] text-white font-semibold hover:bg-[#243F64] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {resetting ? 'Generating...' : 'Issue Reset'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
