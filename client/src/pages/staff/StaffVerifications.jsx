import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useOutletContext, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Filter,
  Search,
  ExternalLink,
  History,
  FileText,
  AlertCircle,
  Eye,
  MessageSquare
} from 'lucide-react';

export function StaffVerifications({ defaultStatus = 'all' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCounts } = useOutletContext() || {};

  // Determine current active filter from URL or prop
  const currentPath = location.pathname;
  let initialTab = defaultStatus;
  if (currentPath.includes('/verifications/pending')) initialTab = 'PENDING';
  else if (currentPath.includes('/verifications/verified')) initialTab = 'VERIFIED';
  else if (currentPath.includes('/verifications/rejected')) initialTab = 'REJECTED';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Synchronize activeTab whenever location.pathname or defaultStatus updates
  useEffect(() => {
    let tab = defaultStatus;
    if (location.pathname.includes('/verifications/pending')) tab = 'PENDING';
    else if (location.pathname.includes('/verifications/verified')) tab = 'VERIFIED';
    else if (location.pathname.includes('/verifications/rejected')) tab = 'REJECTED';
    else if (location.pathname === '/staff/verifications') tab = 'all';
    setActiveTab(tab);
  }, [location.pathname, defaultStatus]);

  // Review & Decision Modal
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [decision, setDecision] = useState('VERIFIED');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // History Drawer Modal
  const [historyModalItem, setHistoryModalItem] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (search) {
        params.q = search;
      }

      const res = await api.get('/staff/verifications', { params });
      if (res.data.success) {
        let list = res.data.submissions;
        // If "rejected" tab, show both REJECTED and RESUBMISSION_REQUIRED
        if (activeTab === 'REJECTED') {
          list = list.filter(s => s.status === 'REJECTED' || s.status === 'RESUBMISSION_REQUIRED');
        }
        setSubmissions(list);
      }
    } catch (err) {
      console.error('Failed to load verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const handleOpenReview = (item) => {
    setActiveModalItem(item);
    setDecision('VERIFIED');
    setComments('');
    setActionError('');
    setActionSuccess('');
  };

  const handleCloseReview = () => {
    setActiveModalItem(null);
    setComments('');
    setActionError('');
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!activeModalItem) return;

    if (['REJECTED', 'RESUBMISSION_REQUIRED'].includes(decision) && (!comments || comments.trim().length < 5)) {
      setActionError('Please provide a mandatory feedback comment explaining why this submission is rejected or needs correction.');
      return;
    }

    setSubmitting(true);
    setActionError('');
    try {
      const res = await api.post(`/staff/verifications/${activeModalItem.id}/decision`, {
        decision,
        comments
      });

      if (res.data.success) {
        setActionSuccess(res.data.message);
        setTimeout(() => {
          handleCloseReview();
          fetchSubmissions();
          refreshCounts?.();
        }, 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit verification decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#142B4A]" />
            Document Verification Queue
          </h1>
          <p className="text-xs text-[#526175] mt-0.5">
            Audit and verify certificates, achievements, and supporting credentials submitted by students in your cohort.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/staff/history"
            className="px-3.5 py-2 rounded-lg border border-[#DCE3EC] text-xs font-semibold text-[#526175] hover:text-[#142B4A] hover:bg-[#E9EFF6] inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
          >
            <History className="w-3.5 h-3.5 text-[#142B4A]" />
            Verification History
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE3EC] pb-2 overflow-x-auto">
        {[
          { label: 'All Documents', key: 'all', path: '/staff/verifications' },
          { label: 'Pending Verification', key: 'PENDING', path: '/staff/verifications/pending' },
          { label: 'Approved / Verified', key: 'VERIFIED', path: '/staff/verifications/verified' },
          { label: 'Rejected / Corrections', key: 'REJECTED', path: '/staff/verifications/rejected' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              navigate(tab.path);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6]'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3EC] shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-[#B9C9DD] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by document title, student name, or roll number..."
            className="w-full text-xs bg-[#F4F6F9] pl-9 pr-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#F4F6F9] px-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] font-medium focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="CERTIFICATE">Certificates</option>
            <option value="ACHIEVEMENT">Achievements</option>
            <option value="INTERNSHIP_EXPERIENCE">Internships & Experience</option>
            <option value="ACADEMIC_SUPPORTING">Academic Supporting</option>
            <option value="OTHER">Other Proofs</option>
          </select>

          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-[#142B4A] text-white rounded-lg text-xs font-semibold hover:bg-[#243F64] transition-colors cursor-pointer shadow-xs"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Queue Items */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DCE3EC] p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-[#166534] mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-[#0F172A]">No Document Submissions Found</h3>
          <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
            No submissions match the selected verification criteria. All items may be audited.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const isPending = sub.status === 'PENDING';
            const isVerified = sub.status === 'VERIFIED';
            const isRejected = sub.status === 'REJECTED';
            const isResubmission = sub.status === 'RESUBMISSION_REQUIRED';
            const recordsCount = sub.verificationRecords?.length || 0;
            const latestRecord = sub.verificationRecords?.[0];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-5 hover:border-[#142B4A] transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#0F172A]">{sub.title}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isVerified
                            ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                            : isPending
                            ? 'bg-[#FEF7EA] text-[#9A5B0B] border-[#FDE68A]'
                            : isResubmission
                            ? 'bg-[#FEF2E8] text-[#B44810] border-[#FDBA74]'
                            : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
                        }`}
                      >
                        {isVerified
                          ? 'Approved / Verified'
                          : isPending
                          ? 'Pending Verification'
                          : isResubmission
                          ? 'Resubmission Required'
                          : 'Rejected'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#E9EFF6] text-[#243F64]">
                        {sub.category}
                      </span>
                      {sub.version > 1 && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]">
                          v{sub.version} Resubmitted
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#526175] flex-wrap">
                      <span>
                        Student:{' '}
                        <Link
                          to={`/staff/students/${sub.student?.id}`}
                          className="font-semibold text-[#142B4A] hover:underline"
                        >
                          {sub.student?.fullName}
                        </Link>{' '}
                        ({sub.student?.rollNumber})
                      </span>
                      <span>•</span>
                      <span>Dept: {sub.student?.department?.code}</span>
                      <span>•</span>
                      <span>Batch: {sub.student?.batch?.name}</span>
                      <span>•</span>
                      <span>Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>

                    {sub.description && (
                      <p className="text-xs text-[#526175] bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC]">
                        {sub.description}
                      </p>
                    )}

                    {latestRecord && latestRecord.comments && (
                      <div className="p-2.5 rounded-lg bg-[#E9EFF6] border border-[#B9C9DD] text-xs">
                        <span className="font-bold text-[#142B4A]">Latest Staff Note: </span>
                        <span className="text-[#243F64]">{latestRecord.comments}</span>
                        <span className="text-xs text-[#526175] block mt-0.5">
                          Decision: {latestRecord.decision} by {latestRecord.reviewerName} on {new Date(latestRecord.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap self-end lg:self-center">
                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-[#DCE3EC] text-xs font-semibold text-[#526175] hover:text-[#142B4A] hover:bg-[#E9EFF6] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#142B4A]" />
                        View Document
                      </a>
                    )}

                    {recordsCount > 0 && (
                      <button
                        onClick={() => setHistoryModalItem(sub)}
                        className="px-3 py-1.5 rounded-lg border border-[#DCE3EC] text-xs font-semibold text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View decision history"
                      >
                        <History className="w-3.5 h-3.5 text-[#526175]" />
                        History ({recordsCount})
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenReview(sub)}
                      className="px-4 py-1.5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#243F64] shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isPending ? 'Review & Verify' : 'Update Decision'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Document Verification</h3>
                <p className="text-xs text-[#526175]">Student: {activeModalItem.student?.fullName} ({activeModalItem.student?.rollNumber})</p>
              </div>
              <button
                onClick={handleCloseReview}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {actionSuccess ? (
              <div className="p-4 rounded-xl bg-[#EBF7EE] border border-[#86EFAC] text-[#166534] text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#166534]" />
                <span>{actionSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitDecision} className="space-y-4">
                {actionError && (
                  <div className="p-3 rounded-lg bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222] text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC] text-xs space-y-1">
                  <p><strong className="text-[#0F172A]">Title:</strong> <span className="text-[#526175]">{activeModalItem.title}</span></p>
                  <p><strong className="text-[#0F172A]">Category:</strong> <span className="text-[#526175]">{activeModalItem.category}</span></p>
                  {activeModalItem.fileUrl && (
                    <p>
                      <strong className="text-[#0F172A]">Evidence:</strong>{' '}
                      <a href={activeModalItem.fileUrl} target="_blank" rel="noreferrer" className="text-[#142B4A] underline font-semibold">
                        View Attached File
                      </a>
                    </p>
                  )}
                  {activeModalItem.credentialUrl && (
                    <p>
                      <strong className="text-[#0F172A]">Verification URL:</strong>{' '}
                      <a href={activeModalItem.credentialUrl} target="_blank" rel="noreferrer" className="text-[#142B4A] underline">
                        {activeModalItem.credentialUrl}
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                    Verification Decision
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision('VERIFIED')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        decision === 'VERIFIED'
                          ? 'border-[#86EFAC] bg-[#EBF7EE] text-[#166534] ring-2 ring-[#86EFAC]/30'
                          : 'border-[#DCE3EC] text-[#526175] hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('RESUBMISSION_REQUIRED')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        decision === 'RESUBMISSION_REQUIRED'
                          ? 'border-[#FDBA74] bg-[#FEF2E8] text-[#B44810] ring-2 ring-[#FDBA74]/30'
                          : 'border-[#DCE3EC] text-[#526175] hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 text-[#B44810]" />
                      Request Correction
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('REJECTED')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        decision === 'REJECTED'
                          ? 'border-[#FCA5A5] bg-[#FDF0F0] text-[#A82222] ring-2 ring-[#FCA5A5]/30'
                          : 'border-[#DCE3EC] text-[#526175] hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-[#A82222]" />
                      Reject
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Staff Comments / Feedback {decision !== 'VERIFIED' && <span className="text-[#A82222]">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={
                      decision === 'VERIFIED'
                        ? 'Optional verification notes (e.g. cross-verified against student portal)...'
                        : 'Explain why resubmission is required or why the document was rejected...'
                    }
                    className="w-full text-xs p-3 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                  />
                  {decision !== 'VERIFIED' && (
                    <p className="text-xs text-[#526175] mt-1">
                      This feedback is mandatory and will be displayed on the student dashboard so they can correct their submission.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC]">
                  <button
                    type="button"
                    onClick={handleCloseReview}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#526175] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#243F64] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                  >
                    {submitting ? 'Recording Decision...' : 'Confirm Decision'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* History Drawer Modal */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Decision History</h3>
                <p className="text-xs text-[#526175]">{historyModalItem.title}</p>
              </div>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {historyModalItem.verificationRecords?.length === 0 ? (
                <p className="text-xs text-[#526175] text-center py-4">No verification actions recorded yet.</p>
              ) : (
                historyModalItem.verificationRecords?.map((rec, i) => (
                  <div key={rec.id} className="p-3 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">{rec.decision}</span>
                      <span className="text-xs text-[#526175]">{new Date(rec.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[#526175]">{rec.comments || 'No comment provided.'}</p>
                    <p className="text-xs text-[#142B4A] font-semibold">Reviewer: {rec.reviewerName} ({rec.reviewerRole})</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#DCE3EC] flex justify-end">
              <button
                onClick={() => setHistoryModalItem(null)}
                className="px-4 py-2 bg-[#F4F6F9] hover:bg-[#E9EFF6] rounded-lg text-xs font-semibold text-[#526175] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
