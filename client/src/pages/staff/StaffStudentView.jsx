import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  GraduationCap,
  Award,
  Trophy,
  Briefcase,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

export function StaffStudentView() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick verification modal
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [decision, setDecision] = useState('VERIFIED');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchStudent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/staff/students/${id}`);
      if (res.data.success) {
        setStudent(res.data.student);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

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
          fetchStudent();
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

  if (error || !student) {
    return (
      <div className="bg-white rounded-xl border border-[#DCE3EC] p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-[#A82222] mx-auto mb-2" />
        <h3 className="font-semibold text-base text-[#0F172A]">Access Restricted</h3>
        <p className="text-xs text-[#526175] mt-1">{error || 'Student not found or unauthorized.'}</p>
        <Link
          to="/staff/students"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Students
        </Link>
      </div>
    );
  }

  const documents = student.documentSubmissions || [];

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/staff/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526175] hover:text-[#142B4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students Roster
        </Link>

        {student.slug && (
          <Link
            to={`/student/${student.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#B9C9DD] bg-[#E9EFF6] text-[#142B4A] hover:bg-[#DCE3EC] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public Showcase
          </Link>
        )}
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#142B4A] text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{student.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF7EE] text-[#166534] border border-[#86EFAC]">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-[#526175] font-mono mt-0.5">
                Roll: {student.rollNumber} • Email: {student.user?.email}
              </p>
              <p className="text-xs text-[#526175] mt-1">
                <strong className="text-[#0F172A]">{student.department?.name}</strong> ({student.department?.code}) • Batch: {student.batch?.name}
              </p>
            </div>
          </div>
        </div>

        {student.bio && (
          <div className="mt-4 pt-4 border-t border-[#DCE3EC] text-xs text-[#526175] leading-relaxed bg-[#F4F6F9] p-3 rounded-lg">
            {student.bio}
          </div>
        )}
      </div>

      {/* Submitted Documents & Verification Section */}
      <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EC] mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#142B4A]" />
              Uploaded Supporting Evidence & Verification Status
            </h2>
            <p className="text-xs text-[#526175] mt-0.5">
              Certificates, achievements, and documents submitted by {student.fullName}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]">
            {documents.length} Submissions
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#526175]">
            No supporting documents uploaded by this student yet.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const latestDecision = doc.verificationRecords?.[0];
              const isPending = doc.status === 'PENDING';
              const isVerified = doc.status === 'VERIFIED';
              const isRejected = doc.status === 'REJECTED';
              const isResubmission = doc.status === 'RESUBMISSION_REQUIRED';

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#0F172A]">{doc.title}</span>
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
                        {doc.category}
                      </span>
                    </div>

                    {doc.description && (
                      <p className="text-xs text-[#526175]">{doc.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[#526175] flex-wrap">
                      <span>Submitted: {new Date(doc.createdAt).toLocaleDateString()}</span>
                      {doc.version > 1 && <span>Version: v{doc.version} (Resubmitted)</span>}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#142B4A] underline font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Evidence File
                        </a>
                      )}
                      {doc.credentialUrl && (
                        <a
                          href={doc.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#142B4A] underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Credential Link
                        </a>
                      )}
                    </div>

                    {latestDecision && latestDecision.comments && (
                      <div className="mt-2 p-2.5 rounded-lg bg-white border border-[#DCE3EC] text-xs">
                        <span className="font-bold text-[#0F172A]">Staff Feedback: </span>
                        <span className="text-[#526175]">{latestDecision.comments}</span>
                        <span className="text-xs text-[#526175] block mt-0.5">
                          Reviewed by {latestDecision.reviewerName} on {new Date(latestDecision.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenReview(doc)}
                    className="self-end sm:self-center px-3.5 py-1.5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#243F64] shadow-xs inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Document
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portfolio Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education */}
        <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-6">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#DCE3EC] mb-3">
            <GraduationCap className="w-4 h-4 text-[#142B4A]" />
            Education ({student.education?.length || 0})
          </h2>
          <div className="space-y-3">
            {student.education?.map((edu) => (
              <div key={edu.id} className="text-xs p-3 rounded-lg bg-[#F4F6F9] border border-[#DCE3EC]">
                <div className="flex justify-between font-bold text-[#0F172A]">
                  <span>{edu.program}</span>
                  <span className="text-[#142B4A]">{edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}</span>
                </div>
                <p className="text-[#526175]">{edu.institution}</p>
                {edu.grade && <p className="text-[#526175] mt-1">Grade: <strong className="text-[#0F172A]">{edu.grade}</strong></p>}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-6">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#DCE3EC] mb-3">
            <Award className="w-4 h-4 text-[#142B4A]" />
            Certifications ({student.certifications?.length || 0})
          </h2>
          <div className="space-y-3">
            {student.certifications?.map((cert) => (
              <div key={cert.id} className="text-xs p-3 rounded-lg bg-[#F4F6F9] border border-[#DCE3EC]">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-[#0F172A]">{cert.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      cert.verificationStatus === 'VERIFIED'
                        ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                        : 'bg-[#FEF7EA] text-[#9A5B0B] border-[#FDE68A]'
                    }`}
                  >
                    {cert.verificationStatus}
                  </span>
                </div>
                <p className="text-[#526175]">{cert.issuer} • Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[#142B4A] underline mt-1 inline-block">
                    Credential Link
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-6">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#DCE3EC] mb-3">
            <Trophy className="w-4 h-4 text-[#142B4A]" />
            Achievements ({student.achievements?.length || 0})
          </h2>
          <div className="space-y-3">
            {student.achievements?.map((ach) => (
              <div key={ach.id} className="text-xs p-3 rounded-lg bg-[#F4F6F9] border border-[#DCE3EC]">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-[#0F172A]">{ach.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      ach.verificationStatus === 'VERIFIED'
                        ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                        : 'bg-[#FEF7EA] text-[#9A5B0B] border-[#FDE68A]'
                    }`}
                  >
                    {ach.verificationStatus}
                  </span>
                </div>
                <p className="text-[#526175] mt-1">{ach.description}</p>
                <p className="text-[#526175] mt-1">Date: {new Date(ach.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Experience / Internships */}
        <div className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-6">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#DCE3EC] mb-3">
            <Briefcase className="w-4 h-4 text-[#142B4A]" />
            Experience & Internships ({student.experience?.length || 0})
          </h2>
          <div className="space-y-3">
            {student.experience?.map((exp) => (
              <div key={exp.id} className="text-xs p-3 rounded-lg bg-[#F4F6F9] border border-[#DCE3EC]">
                <div className="flex justify-between font-bold text-[#0F172A]">
                  <span>{exp.role}</span>
                  <span className="text-[#142B4A]">{exp.organization}</span>
                </div>
                <p className="text-[#526175] mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Decision Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Verify Student Document</h3>
                <p className="text-xs text-[#526175]">Student: {student.fullName} ({student.rollNumber})</p>
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
                        View Attached Document
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
                        ? 'Optional validation notes...'
                        : 'Explain why resubmission is required or why the document was rejected...'
                    }
                    className="w-full text-xs p-3 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                  />
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
                    {submitting ? 'Recording...' : 'Confirm Decision'}
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
