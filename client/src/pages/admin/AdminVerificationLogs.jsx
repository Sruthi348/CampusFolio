import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  Calendar,
  UserCheck,
  GraduationCap,
  FileText,
  Clock
} from 'lucide-react';

export function AdminVerificationLogs() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (decisionFilter !== 'all') params.decision = decisionFilter;
      if (search) params.q = search;

      const res = await api.get('/admin/verification-logs', { params });
      if (res.data.success) {
        setRecords(res.data.records);
        setPagination(res.data.pagination || { total: res.data.records.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load verification logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [decisionFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#142B4A]" />
            Verification Audit Logs
          </h1>
          <p className="text-xs text-[#526175] mt-0.5">
            Institutional surveillance and audit trail: monitor which staff member reviewed each document, decision taken, timestamps, and feedback.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD] self-start sm:self-center">
          Total Logged Actions: <strong>{pagination.total}</strong>
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
            placeholder="Search by student name, roll number, document title, reviewer name, or comments..."
            className="w-full text-xs bg-[#F4F6F9] pl-9 pr-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={decisionFilter}
            onChange={(e) => {
              setDecisionFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-[#F4F6F9] px-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] font-semibold focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          >
            <option value="all">All Verification Actions</option>
            <option value="VERIFIED">Approved / Verified</option>
            <option value="RESUBMISSION_REQUIRED">Correction / Resubmission</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-[#142B4A] text-white rounded-lg text-xs font-semibold hover:bg-[#243F64] transition-colors shadow-xs cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DCE3EC] p-12 text-center">
          <ClipboardList className="w-12 h-12 text-[#B9C9DD] mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-[#0F172A]">No Verification Records Found</h3>
          <p className="text-xs text-[#526175] mt-1">
            Actions taken by staff members reviewing student documents will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] border-b border-[#DCE3EC] text-[#526175] uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Staff Reviewer</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Affected Student</th>
                  <th className="py-3 px-4">Document / Proof</th>
                  <th className="py-3 px-4">Recorded Comments / Reasons</th>
                  <th className="py-3 px-4 text-right">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EC]">
                {records.map((rec) => {
                  const isVerified = rec.decision === 'VERIFIED';
                  const isResubmission = rec.decision === 'RESUBMISSION_REQUIRED';

                  return (
                    <tr key={rec.id} className="hover:bg-[#F4F6F9] transition-colors">
                      <td className="py-3 px-4 text-[#526175] whitespace-nowrap">
                        <div className="font-semibold text-[#0F172A]">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[#526175]">
                          {new Date(rec.createdAt).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#142B4A] shrink-0" />
                          {rec.reviewerName}
                        </div>
                        <div className="text-xs text-[#526175] font-mono">{rec.reviewerEmail}</div>
                        <div className="text-xs text-[#243F64] font-medium">{rec.reviewerRole}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isVerified
                              ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                              : isResubmission
                              ? 'bg-[#FEF2E8] text-[#B44810] border-[#FDBA74]'
                              : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="w-3 h-3 text-[#166534]" />
                          ) : isResubmission ? (
                            <RotateCcw className="w-3 h-3 text-[#B44810]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-[#A82222]" />
                          )}
                          {rec.decision}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#142B4A] shrink-0" />
                          {rec.student?.fullName}
                        </div>
                        <div className="text-xs text-[#526175] font-mono">
                          {rec.student?.rollNumber} • {rec.student?.department?.code}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-[#0F172A] truncate">
                          {rec.documentSubmission?.title || 'Document Submission'}
                        </div>
                        <div className="text-xs text-[#526175]">
                          {rec.documentSubmission?.category}
                          {rec.documentSubmission?.version > 1 && ` (v${rec.documentSubmission.version})`}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-sm text-[#526175]">
                        {rec.comments ? (
                          <div className="line-clamp-2 bg-white p-2 rounded border border-[#DCE3EC]">
                            {rec.comments}
                          </div>
                        ) : (
                          <span className="text-[#B9C9DD] italic">No comments</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {rec.documentSubmission?.fileUrl && (
                          <a
                            href={rec.documentSubmission.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B4A] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Proof File
                          </a>
                        )}
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
              <span>Total records: {pagination.total}</span>
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
    </div>
  );
}
