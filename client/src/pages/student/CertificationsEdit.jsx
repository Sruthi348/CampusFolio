import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText,
  Loader2
} from 'lucide-react';

export function CertificationsEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const certsList = profileSummary?.profile?.certifications || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    certificateFileUrl: ''
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialUrl: '',
      certificateFileUrl: ''
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cert) => {
    setEditingId(cert.id);
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate ? cert.issueDate.slice(0, 10) : '',
      expiryDate: cert.expiryDate ? cert.expiryDate.slice(0, 10) : '',
      credentialUrl: cert.credentialUrl || '',
      certificateFileUrl: cert.certificateFileUrl || ''
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Document size must be less than 5 MB.' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('document', file);

    setUploading(true);
    try {
      const res = await api.post('/upload/document', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setFormData(prev => ({ ...prev, certificateFileUrl: res.data.fileUrl }));
        setMessage({ type: 'success', text: 'Certificate file uploaded.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload certificate file.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      const res = await api.delete(`/students/me/certifications/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Certification deleted.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete certification.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: formData.name,
        issuer: formData.issuer,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate || null,
        credentialUrl: formData.credentialUrl || null,
        certificateFileUrl: formData.certificateFileUrl || null
      };

      if (editingId) {
        await api.put(`/students/me/certifications/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Certification updated and resubmitted for verification.' });
      } else {
        await api.post('/students/me/certifications', payload);
        setMessage({ type: 'success', text: 'Certification submitted for verification.' });
      }

      await refreshProfile();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save certification.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1">
            Verified Credentials
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Certifications & Licenses
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-1">
            Certifications undergo institutional review before displaying verified badges on your public portfolio.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'badge-approved'
              : 'badge-rejected'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Certifications List */}
      <div className="space-y-3.5">
        {certsList.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <Award className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A]">No Certifications Added</h3>
            <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
              Add your AWS, Coursera, Meta, Oracle, or institutional credentials along with proof links or certificate PDFs.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </div>
        ) : (
          certsList.map((cert) => {
            const isVerified = cert.verificationStatus === 'VERIFIED';
            const isPending = cert.verificationStatus === 'PENDING';
            const isRejected = cert.verificationStatus === 'REJECTED';

            return (
              <div
                key={cert.id}
                className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex items-start justify-between gap-4 hover:border-[#142B4A] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#0F172A]">{cert.name}</h3>

                    {/* Status Badge */}
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold badge-approved px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold badge-pending px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold badge-rejected px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3 text-red-600" /> Needs Revision
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#526175]">
                    Issuer: <span className="font-semibold text-[#0F172A]">{cert.issuer}</span> • Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </p>

                  {cert.verificationNotes && (
                    <p className="text-xs text-[#B44810] bg-[#FEF2E8] p-2 rounded-lg border border-[#F9D3B4] mt-2">
                      Reviewer Note: {cert.verificationNotes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-2 text-xs">
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#142B4A] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Credential URL
                      </a>
                    )}
                    {cert.certificateFileUrl && (
                      <a
                        href={cert.certificateFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#243F64] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" /> Certificate File
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(cert)}
                    className="p-1.5 text-[#526175] hover:text-[#142B4A] hover:bg-[#F4F6F9] rounded-lg transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-1.5 text-[#526175] hover:text-[#A82222] hover:bg-[#FDF0F0] rounded-lg transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Certification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="font-bold text-base text-[#0F172A]">
                {editingId ? 'Edit Certification' : 'Submit Certification'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect Associate"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="e.g. Amazon Web Services, Oracle, Google"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Online Verification / Credential URL
                </label>
                <input
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://credly.com/badges/..."
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              {/* Upload Certificate File */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Upload Certificate Document / PDF (Max 5MB)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#DCE3EC] rounded-lg text-xs font-semibold text-[#142B4A] bg-[#F4F6F9] hover:bg-[#E9EFF6] cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-[#142B4A]" />
                    <span>{uploading ? 'Uploading...' : 'Choose PDF or Image'}</span>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={handleDocumentUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {formData.certificateFileUrl && (
                    <span className="text-xs text-emerald-700 font-semibold truncate max-w-xs">
                      File attached!
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCE3EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#DCE3EC] text-[#526175] rounded-lg hover:bg-[#F4F6F9] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
