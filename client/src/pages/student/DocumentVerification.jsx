import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ExternalLink,
  AlertTriangle,
  Plus,
  Trash2,
  History,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

export function DocumentVerification() {
  const [documents, setDocuments] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, verified: 0, rejected: 0, resubmissionRequired: 0 });
  const [loading, setLoading] = useState(true);

  // Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CERTIFICATE');
  const [description, setDescription] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Resubmission modal
  const [resubmitTarget, setResubmitTarget] = useState(null);
  const [resubmitFile, setResubmitFile] = useState(null);
  const [resubmitTitle, setResubmitTitle] = useState('');
  const [resubmitDesc, setResubmitDesc] = useState('');
  const [resubmitUrl, setResubmitUrl] = useState('');
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState('');

  // Decision history modal
  const [historyTarget, setHistoryTarget] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/me/documents');
      if (res.data.success) {
        setDocuments(res.data.documents);
        setCounts(res.data.counts || {});
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedFile) {
      setFormError('Please select a file to upload (PDF, JPG, or PNG up to 5MB).');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('document', selectedFile);

      const uploadRes = await api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message || 'File upload failed');
      }

      const { fileUrl, fileName, size } = uploadRes.data;

      // 2. Submit document record
      const docRes = await api.post('/students/me/documents', {
        title: title.trim(),
        category,
        fileUrl,
        fileName,
        fileSize: size,
        description: description ? description.trim() : null,
        credentialUrl: credentialUrl ? credentialUrl.trim() : null,
        issueDate: issueDate || null
      });

      if (docRes.data.success) {
        setFormSuccess('Document submitted successfully! It is now pending review by your faculty tutor.');
        setTimeout(() => {
          setUploadModalOpen(false);
          setTitle('');
          setDescription('');
          setCredentialUrl('');
          setIssueDate('');
          setSelectedFile(null);
          setFormSuccess('');
          fetchDocuments();
        }, 1200);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to submit document.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenResubmit = (doc) => {
    setResubmitTarget(doc);
    setResubmitTitle(doc.title);
    setResubmitDesc(doc.description || '');
    setResubmitUrl(doc.credentialUrl || '');
    setResubmitFile(null);
    setResubmitError('');
  };

  const handleResubmitSubmit = async (e) => {
    e.preventDefault();
    if (!resubmitTarget) return;

    if (!resubmitFile) {
      setResubmitError('Please select a corrected or clearer document file to upload.');
      return;
    }

    setResubmitting(true);
    setResubmitError('');

    try {
      const formData = new FormData();
      formData.append('document', resubmitFile);

      const uploadRes = await api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message || 'File upload failed');
      }

      const { fileUrl, fileName, size } = uploadRes.data;

      const res = await api.put(`/students/me/documents/${resubmitTarget.id}/resubmit`, {
        title: resubmitTitle.trim(),
        category: resubmitTarget.category,
        fileUrl,
        fileName,
        fileSize: size,
        description: resubmitDesc.trim(),
        credentialUrl: resubmitUrl ? resubmitUrl.trim() : null
      });

      if (res.data.success) {
        setResubmitTarget(null);
        fetchDocuments();
      }
    } catch (err) {
      setResubmitError(err.response?.data?.message || err.message || 'Resubmission failed.');
    } finally {
      setResubmitting(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document submission?')) return;

    try {
      const res = await api.delete(`/students/me/documents/${docId}`);
      if (res.data.success) {
        fetchDocuments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC]">
        <div>
          <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1">
            Faculty Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#142B4A]" />
            Document Verification
          </h1>
          <p className="text-sm sm:text-base text-[#526175] mt-1">
            Upload certificates, achievements, and credentials for faculty review. Track verification status and feedback.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadModalOpen(true);
            setFormError('');
            setFormSuccess('');
          }}
          className="px-4 py-2.5 rounded-xl bg-[#142B4A] text-white text-sm font-semibold hover:bg-[#243F64] shadow-xs inline-flex items-center gap-2 transition self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Info notice about verification policy */}
      <div className="p-4 rounded-xl bg-[#E9EFF6] border border-[#B9C9DD] flex items-start gap-3 text-sm text-[#142B4A] leading-relaxed">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#142B4A]" />
        <div>
          <span className="font-bold">Institutional Verification Standard:</span> Uploaded certificates and supporting proofs are reviewed by your designated <strong>Class In-charge / Faculty Tutor</strong>. Verified records display a permanent verification badge on your public institutional portfolio.
        </div>
      </div>

      {/* Verification Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between text-[#526175]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Uploads</span>
            <FileText className="w-4.5 h-4.5 text-[#526175]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1.5">{counts.total || 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between text-[#9A5B0B]">
            <span className="text-xs font-bold uppercase tracking-wider">In Review</span>
            <Clock className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#9A5B0B] mt-1.5">{counts.pending || 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between text-[#166534]">
            <span className="text-xs font-bold uppercase tracking-wider">Verified / Approved</span>
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#166534] mt-1.5">{counts.verified || 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between text-[#B44810]">
            <span className="text-xs font-bold uppercase tracking-wider">Needs Correction</span>
            <RotateCcw className="w-4.5 h-4.5 text-orange-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#B44810] mt-1.5">
            {(counts.rejected || 0) + (counts.resubmissionRequired || 0)}
          </p>
        </div>
      </div>

      {/* Document Submissions List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3EC] p-12 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <ShieldCheck className="w-12 h-12 text-[#B9C9DD] mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#0F172A]">No Supporting Documents Uploaded Yet</h3>
          <p className="text-sm text-[#526175] mt-1.5 max-w-sm mx-auto mb-4">
            Upload your certification scans, achievement certificates, or internship letters to have them verified by your faculty tutor.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-5 py-2.5 bg-[#142B4A] text-white rounded-xl text-sm font-semibold hover:bg-[#243F64] transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload First Document
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            const isVerified = doc.status === 'VERIFIED';
            const isPending = doc.status === 'PENDING';
            const isResubmission = doc.status === 'RESUBMISSION_REQUIRED';
            const isRejected = doc.status === 'REJECTED';
            const latestRecord = doc.verificationRecords?.[0];

            return (
              <div
                key={doc.id}
                className={`bg-[#FFFFFF] rounded-2xl border p-5 transition shadow-[0_1px_3px_rgba(20,43,74,0.05)] ${
                  isResubmission
                    ? 'border-orange-300 ring-1 ring-orange-200'
                    : isRejected
                    ? 'border-red-300'
                    : isVerified
                    ? 'border-emerald-200'
                    : 'border-[#DCE3EC]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-[#0F172A]">{doc.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                          isVerified
                            ? 'badge-approved'
                            : isPending
                            ? 'badge-pending'
                            : isResubmission
                            ? 'badge-correction'
                            : 'badge-rejected'
                        }`}
                      >
                        {isVerified
                          ? 'Approved / Verified'
                          : isPending
                          ? 'Pending Review'
                          : isResubmission
                          ? 'Correction Required'
                          : 'Rejected'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-[#F4F6F9] text-[#243F64] border border-[#DCE3EC]">
                        {doc.category}
                      </span>
                      {doc.version > 1 && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]">
                          v{doc.version}
                        </span>
                      )}
                    </div>

                    {doc.description && (
                      <p className="text-sm text-[#526175]">{doc.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-sm text-[#526175] flex-wrap pt-1">
                      <span>Submitted: {new Date(doc.createdAt).toLocaleDateString()}</span>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#142B4A] hover:underline font-semibold flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Uploaded Document
                        </a>
                      )}
                      {doc.credentialUrl && (
                        <a
                          href={doc.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#142B4A] hover:underline flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Credential URL
                        </a>
                      )}
                    </div>

                    {/* Staff Feedback / Rejection Reason Box */}
                    {latestRecord && (
                      <div
                        className={`mt-3 p-3.5 rounded-xl text-sm space-y-1.5 ${
                          isResubmission
                            ? 'badge-correction'
                            : isRejected
                            ? 'badge-rejected'
                            : 'badge-approved'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {isVerified ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isResubmission ? (
                              <RotateCcw className="w-4 h-4 text-orange-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                            )}
                            Faculty Review: {latestRecord.decision}
                          </span>
                          <span className="text-xs font-normal opacity-80">
                            {new Date(latestRecord.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {latestRecord.comments && (
                          <p className="font-medium pt-0.5">{latestRecord.comments}</p>
                        )}
                        <p className="text-xs opacity-75">
                          Reviewed by <strong>{latestRecord.reviewerName}</strong> ({latestRecord.reviewerRole})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {(isResubmission || isRejected) && (
                      <button
                        onClick={() => handleOpenResubmit(doc)}
                        className="px-3.5 py-2 rounded-lg badge-correction font-bold text-sm hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Correct & Resubmit
                      </button>
                    )}

                    {doc.verificationRecords?.length > 0 && (
                      <button
                        onClick={() => setHistoryTarget(doc)}
                        className="p-2 rounded-lg border border-[#DCE3EC] text-[#526175] hover:bg-[#F4F6F9] transition cursor-pointer"
                        title="View decision history"
                      >
                        <History className="w-4.5 h-4.5" />
                      </button>
                    )}

                    {!isVerified && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg border border-[#DCE3EC] text-[#526175] hover:text-[#A82222] hover:bg-[#FDF0F0] transition cursor-pointer"
                        title="Delete submission"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload New Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-2xs p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC] animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#142B4A]" />
                Upload Document for Verification
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formSuccess ? (
              <div className="p-4 rounded-xl badge-approved text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl badge-rejected flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#A82222]" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect Associate"
                    className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A]"
                    >
                      <option value="CERTIFICATE">Certificate</option>
                      <option value="ACHIEVEMENT">Achievement / Award</option>
                      <option value="INTERNSHIP_EXPERIENCE">Internship / Experience</option>
                      <option value="ACADEMIC_SUPPORTING">Academic Supporting</option>
                      <option value="OTHER">Other Proof</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Supporting Document File (PDF, JPG, PNG ≤ 5MB) *
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full p-2 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E9EFF6] file:text-[#142B4A] hover:file:bg-[#B9C9DD]/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Credential Verification URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Description / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about the issuing body, certificate ID, or internship role..."
                    className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC]">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-[#526175] font-semibold hover:bg-[#F4F6F9] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 rounded-lg bg-[#142B4A] text-white font-bold uppercase tracking-wider hover:bg-[#243F64] disabled:opacity-50 transition cursor-pointer"
                  >
                    {uploading ? 'Submitting...' : 'Submit Document'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Resubmit Modal */}
      {resubmitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-2xs p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC] animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-600" />
                  Correct & Resubmit Document
                </h3>
                <p className="text-xs text-[#526175]">Resubmitting triggers an updated verification review by your faculty tutor.</p>
              </div>
              <button
                onClick={() => setResubmitTarget(null)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResubmitSubmit} className="space-y-4 text-xs">
              {resubmitError && (
                <div className="p-3 rounded-xl badge-rejected flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#A82222]" />
                  <span>{resubmitError}</span>
                </div>
              )}

              {/* Show faculty feedback that student is responding to */}
              {resubmitTarget.verificationRecords?.[0]?.comments && (
                <div className="p-3 rounded-xl badge-correction space-y-1">
                  <span className="font-bold block">Faculty Issue to Address:</span>
                  <p>{resubmitTarget.verificationRecords[0].comments}</p>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={resubmitTitle}
                  onChange={(e) => setResubmitTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Upload Corrected File (PDF, JPG, PNG ≤ 5MB) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setResubmitFile(e.target.files[0])}
                  className="w-full p-2 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E9EFF6] file:text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Updated Credential URL
                </label>
                <input
                  type="url"
                  value={resubmitUrl}
                  onChange={(e) => setResubmitUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Correction Explanation / Notes
                </label>
                <textarea
                  rows={2}
                  value={resubmitDesc}
                  onChange={(e) => setResubmitDesc(e.target.value)}
                  placeholder="Explain what corrections were made (e.g. re-scanned in high resolution)..."
                  className="w-full p-2.5 rounded-xl border border-[#DCE3EC] bg-[#FFFFFF] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC]">
                <button
                  type="button"
                  onClick={() => setResubmitTarget(null)}
                  className="px-4 py-2 rounded-lg text-[#526175] font-semibold hover:bg-[#F4F6F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resubmitting}
                  className="px-4 py-2 rounded-lg bg-[#142B4A] hover:bg-[#243F64] text-white font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer"
                >
                  {resubmitting ? 'Submitting...' : 'Resubmit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-2xs p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC] max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Verification History</h3>
                <p className="text-xs text-[#526175]">{historyTarget.title}</p>
              </div>
              <button
                onClick={() => setHistoryTarget(null)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {historyTarget.verificationRecords?.length === 0 ? (
                <p className="text-xs text-[#526175] text-center py-4">No reviews recorded yet.</p>
              ) : (
                historyTarget.verificationRecords?.map((rec) => (
                  <div key={rec.id} className="p-3 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">{rec.decision}</span>
                      <span className="text-xs text-[#526175]">{new Date(rec.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[#526175]">{rec.comments || 'No note recorded.'}</p>
                    <p className="text-xs text-[#142B4A] font-semibold">Reviewer: {rec.reviewerName} ({rec.reviewerRole})</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#DCE3EC] flex justify-end">
              <button
                onClick={() => setHistoryTarget(null)}
                className="px-4 py-2 bg-[#F4F6F9] hover:bg-[#E9EFF6] rounded-lg text-xs font-semibold text-[#0F172A] cursor-pointer"
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
