import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Search,
  MessageSquare,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export function StaffOverview() {
  const { refreshCounts } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [decision, setDecision] = useState('VERIFIED');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/overview');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load staff overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleOpenReview = (item, initialDecision = 'VERIFIED') => {
    setActiveModalItem(item);
    setDecision(initialDecision);
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
      setActionError('Please provide a mandatory reason comment explaining why this submission is rejected or needs correction.');
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
          fetchOverview();
          refreshCounts?.();
        }, 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit verification decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const counts = data?.counts || {};
  const staff = data?.staff || {};
  const recentSubmissions = data?.recentSubmissions || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD] mb-2">
            <ShieldCheck className="w-4 h-4 text-[#142B4A]" />
            Faculty Verification Desk
          </div>
          {/* Exactly "Welcome, [Staff Name]" as specified in section 9 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Welcome, {staff.fullName || 'Faculty Member'}
          </h1>
          <p className="text-sm sm:text-base text-[#526175] mt-1">
            {staff.designation || 'Class Tutor'} • {staff.department?.name || 'Assigned Department'} {staff.batch?.name ? `(${staff.batch.name})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/staff/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCE3EC] hover:bg-[#F4F6F9] text-[#142B4A] text-sm font-semibold transition shadow-xs"
          >
            <Users className="w-4 h-4" />
            Assigned Cohort ({counts.assignedStudents || 0})
          </Link>
          <Link
            to="/staff/verifications/pending"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-semibold transition shadow-xs"
          >
            <Clock className="w-4 h-4" />
            Pending Queue ({counts.pending || 0})
          </Link>
        </div>
      </div>

      {/* 2. Prioritized Task-Focused Review Workspace */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3EC] shadow-[0_1px_3px_rgba(20,43,74,0.05)] p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EC] mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#142B4A]" />
              Priority Document Verification Queue
            </h2>
            <p className="text-sm text-[#526175] mt-0.5">
              Certificates and evidence submitted by assigned students awaiting faculty review
            </p>
          </div>
          <Link
            to="/staff/verifications/pending"
            className="text-sm font-bold text-[#142B4A] hover:underline inline-flex items-center gap-1"
          >
            View All Pending ({counts.pending || 0}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[#DCE3EC] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-[#EBF7EE] text-[#166534] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#0F172A]">All Submissions Clear</h3>
            <p className="text-sm text-[#526175] mt-1 max-w-sm mx-auto">
              There are currently no pending student documents requiring verification in your assigned cohort.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {recentSubmissions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] hover:bg-[#FFFFFF] hover:border-[#142B4A] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm"
              >
                {/* Student and Document Details */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-[#0F172A]">{item.title}</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#E9EFF6] text-[#142B4A] border border-[#DCE3EC]">
                      {item.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold badge-pending">
                      Pending Review
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#526175]">
                    <span className="font-semibold text-[#0F172A]">
                      {item.student?.fullName}
                    </span>
                    <span>Roll #{item.student?.rollNumber}</span>
                    <span>•</span>
                    <span>{item.student?.department?.code} • {item.student?.batch?.name}</span>
                    <span>•</span>
                    <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {item.description && (
                    <p className="text-sm text-[#526175] line-clamp-1 italic">
                      "{item.description}"
                    </p>
                  )}
                </div>

                {/* Actions & Preview Link */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#DCE3EC]">
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-lg border border-[#DCE3EC] bg-[#FFFFFF] hover:bg-[#E9EFF6] text-[#243F64] text-sm font-semibold flex items-center gap-1.5 transition"
                      title="Inspect Document"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Preview
                    </a>
                  )}

                  {/* Distinct Approve, Reject, Request Correction actions */}
                  <button
                    onClick={() => handleOpenReview(item, 'VERIFIED')}
                    className="px-3.5 py-2 rounded-lg badge-approved font-bold text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleOpenReview(item, 'RESUBMISSION_REQUIRED')}
                    className="px-3.5 py-2 rounded-lg badge-correction font-bold text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    Request Correction
                  </button>

                  <button
                    onClick={() => handleOpenReview(item, 'REJECTED')}
                    className="px-3.5 py-2 rounded-lg badge-rejected font-bold text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Verification Decision Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl max-w-lg w-full p-6 shadow-xl animate-fade-in-up">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A]">
                  Faculty Verification Decision
                </span>
                <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {activeModalItem.title}
                </h3>
                <p className="text-sm text-[#526175]">
                  Student: {activeModalItem.student?.fullName} ({activeModalItem.student?.rollNumber})
                </p>
              </div>
              <button
                onClick={handleCloseReview}
                className="text-[#526175] hover:text-[#0F172A] text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FDF0F0] border border-[#F8C8C8] text-[#A82222] text-sm flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#EBF7EE] border border-[#BCE6C9] text-[#166534] text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitDecision} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Select Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('VERIFIED')}
                    className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition cursor-pointer ${
                      decision === 'VERIFIED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-[#F4F6F9] text-[#526175] border-[#DCE3EC] hover:bg-slate-100'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('RESUBMISSION_REQUIRED')}
                    className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition cursor-pointer ${
                      decision === 'RESUBMISSION_REQUIRED'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-[#F4F6F9] text-[#526175] border-[#DCE3EC] hover:bg-slate-100'
                    }`}
                  >
                    ↺ Correction
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition cursor-pointer ${
                      decision === 'REJECTED'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-[#F4F6F9] text-[#526175] border-[#DCE3EC] hover:bg-slate-100'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Feedback & Decision Comments {decision !== 'VERIFIED' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    decision === 'VERIFIED'
                      ? 'Optional note (e.g., Credential authenticated via issuing authority portal)'
                      : 'Please provide clear guidance for the student regarding necessary corrections...'
                  }
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-3.5 text-sm text-[#0F172A] placeholder-[#526175]/60 focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DCE3EC]">
                <button
                  type="button"
                  onClick={handleCloseReview}
                  className="px-4 py-2.5 rounded-lg border border-[#DCE3EC] text-sm font-semibold text-[#526175] hover:bg-[#F4F6F9] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Recording...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
