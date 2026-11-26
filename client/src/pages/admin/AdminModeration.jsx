import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  ShieldCheck,
  Award,
  Trophy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  AlertCircle,
  MessageSquare,
  Loader2,
  X
} from 'lucide-react';

export function AdminModeration() {
  const { refreshModerationCount } = useOutletContext();
  const [queue, setQueue] = useState({ pendingCertifications: [], pendingAchievements: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Rejection notes modal state
  const [noteModal, setNoteModal] = useState({
    open: false,
    type: '', // 'certification' or 'achievement'
    id: null,
    title: '',
    note: ''
  });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/moderation');
      if (res.data.success) {
        setQueue(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch moderation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleVerify = async (type, id) => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = type === 'certification'
        ? `/admin/moderation/certification/${id}`
        : `/admin/moderation/achievement/${id}`;

      const res = await api.patch(endpoint, { status: 'VERIFIED' });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        await fetchQueue();
        refreshModerationCount?.();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Verification action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = noteModal.type === 'certification'
        ? `/admin/moderation/certification/${noteModal.id}`
        : `/admin/moderation/achievement/${noteModal.id}`;

      const res = await api.patch(endpoint, {
        status: 'REJECTED',
        notes: noteModal.note
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: `Item rejected with feedback note.` });
        setNoteModal({ open: false, type: '', id: null, title: '', note: '' });
        await fetchQueue();
        refreshModerationCount?.();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCerts = queue.pendingCertifications || [];
  const pendingAchs = queue.pendingAchievements || [];
  const totalPending = pendingCerts.length + pendingAchs.length;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Institutional Moderation & Credential Review
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FEF7EA] text-[#9A5B0B] border border-[#FDE68A]">
            {totalPending} Pending
          </span>
        </div>
        <p className="text-sm text-[#526175] mt-1">
          Review self-reported certifications and competitive achievements before they receive verified status on public portfolios.
        </p>
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

      {/* Section 1: Certifications Queue */}
      <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#142B4A]" />
            <h2 className="font-bold text-base text-[#0F172A]">
              Pending Certifications ({pendingCerts.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#526175] text-xs">Loading queue...</div>
        ) : pendingCerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#526175]">
            <CheckCircle2 className="w-8 h-8 text-[#166534] mx-auto mb-2" />
            No pending certifications in the review queue. All items are verified!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingCerts.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F172A]">{cert.name}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#FEF7EA] text-[#9A5B0B] border border-[#FDE68A]">
                      PENDING
                    </span>
                  </div>

                  <p className="text-[#526175]">
                    Issuer: <span className="font-semibold text-[#0F172A]">{cert.issuer}</span> • Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </p>

                  <p className="text-[#142B4A] font-medium">
                    Student: <Link to={`/student/${cert.student.slug}`} target="_blank" className="hover:underline font-bold text-[#142B4A]">{cert.student.fullName}</Link> ({cert.student.rollNumber} • {cert.student.department?.code})
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#142B4A] font-semibold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Credential URL
                      </a>
                    )}
                    {cert.certificateFileUrl && (
                      <a
                        href={cert.certificateFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#243F64] font-semibold hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Certificate File
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerify('certification', cert.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify
                  </button>
                  <button
                    onClick={() => setNoteModal({ open: true, type: 'certification', id: cert.id, title: cert.name, note: '' })}
                    disabled={actionLoading}
                    className="px-3 py-1.5 border border-[#FCA5A5] bg-white hover:bg-[#FDF0F0] text-[#A82222] font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Achievements Queue */}
      <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#142B4A]" />
            <h2 className="font-bold text-base text-[#0F172A]">
              Pending Honors & Awards ({pendingAchs.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#526175] text-xs">Loading queue...</div>
        ) : pendingAchs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#526175]">
            <CheckCircle2 className="w-8 h-8 text-[#166534] mx-auto mb-2" />
            No pending achievements in the review queue. All items are verified!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAchs.map((ach) => (
              <div
                key={ach.id}
                className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F172A]">{ach.title}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#FEF7EA] text-[#9A5B0B] border border-[#FDE68A]">
                      PENDING
                    </span>
                  </div>

                  <p className="text-[#526175] line-clamp-2">{ach.description}</p>

                  <p className="text-[#142B4A] font-medium">
                    Student: <Link to={`/student/${ach.student.slug}`} target="_blank" className="hover:underline font-bold text-[#142B4A]">{ach.student.fullName}</Link> ({ach.student.rollNumber} • {ach.student.department?.code})
                  </p>

                  {ach.proofUrl && (
                    <a
                      href={ach.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#142B4A] font-semibold hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Proof Link
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerify('achievement', ach.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify
                  </button>
                  <button
                    onClick={() => setNoteModal({ open: true, type: 'achievement', id: ach.id, title: ach.title, note: '' })}
                    disabled={actionLoading}
                    className="px-3 py-1.5 border border-[#FCA5A5] bg-white hover:bg-[#FDF0F0] text-[#A82222] font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection / Revision Note Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE3EC] rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-3">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  Reject or Request Revision
                </h3>
                <p className="text-xs text-[#526175] mt-0.5">
                  Item: <strong className="text-[#0F172A]">{noteModal.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setNoteModal({ open: false, type: '', id: null, title: '', note: '' })}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Feedback Note for Student *
                </label>
                <textarea
                  rows={3}
                  required
                  value={noteModal.note}
                  onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                  placeholder="e.g. Please upload the official certificate containing verifiable credentials..."
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg p-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC]">
                <button
                  type="button"
                  onClick={() => setNoteModal({ open: false, type: '', id: null, title: '', note: '' })}
                  className="px-4 py-2 border border-[#DCE3EC] text-[#526175] rounded-lg font-semibold hover:bg-[#E9EFF6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#A82222] hover:bg-[#991B1B] text-white rounded-lg font-semibold disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
