import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  History,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  Search,
  Filter,
  FileText
} from 'lucide-react';

export function StaffHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDecision, setFilterDecision] = useState('all');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDecision !== 'all') params.decision = filterDecision;
      const res = await api.get('/staff/history', { params });
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load verification history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterDecision]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <History className="w-6 h-6 text-[#142B4A]" />
            Verification Decisions Log
          </h1>
          <p className="text-xs text-[#526175] mt-0.5">
            Audit trail of all document approvals, rejections, and correction requests processed by you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="text-xs bg-white px-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] font-semibold focus:outline-hidden focus:border-[#142B4A]"
          >
            <option value="all">All Decisions</option>
            <option value="VERIFIED">Approved / Verified</option>
            <option value="RESUBMISSION_REQUIRED">Resubmission Requested</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DCE3EC] p-12 text-center">
          <History className="w-10 h-10 text-[#B9C9DD] mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-[#0F172A]">No Verification History Yet</h3>
          <p className="text-xs text-[#526175] mt-1">
            Decisions made on student documents will be permanently recorded and displayed here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] border-b border-[#DCE3EC] text-[#526175] uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Comments / Recorded Feedback</th>
                  <th className="py-3 px-4 text-right">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EC]">
                {history.map((item) => {
                  const isVerified = item.decision === 'VERIFIED';
                  const isResubmission = item.decision === 'RESUBMISSION_REQUIRED';

                  return (
                    <tr key={item.id} className="hover:bg-[#F4F6F9] transition-colors">
                      <td className="py-3 px-4 text-[#526175] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0F172A]">
                        {item.documentSubmission?.title || 'Document'}
                        <span className="block text-xs font-normal text-[#526175]">
                          {item.documentSubmission?.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Link
                          to={`/staff/students/${item.student?.id}`}
                          className="font-semibold text-[#142B4A] hover:underline block"
                        >
                          {item.student?.fullName}
                        </Link>
                        <span className="text-xs text-[#526175]">{item.student?.rollNumber} • {item.student?.department?.code}</span>
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
                          {item.decision}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-[#526175]">
                        {item.comments ? (
                          <span className="line-clamp-2">{item.comments}</span>
                        ) : (
                          <span className="text-[#B9C9DD] italic">No notes</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {item.documentSubmission?.fileUrl && (
                          <a
                            href={item.documentSubmission.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B4A] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> View File
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
