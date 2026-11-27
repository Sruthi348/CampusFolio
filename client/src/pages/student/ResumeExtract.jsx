import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Trash2,
  Edit2,
  GraduationCap,
  FolderGit2,
  Briefcase,
  Award,
  Trophy,
  Link2,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Loader2,
  Info,
  RefreshCw
} from 'lucide-react';

export function ResumeExtract() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const profile = profileSummary?.profile;

  // File upload state
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  
  // Extracted data state
  const [extractedData, setExtractedData] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'education' | 'projects' | 'experience' | 'certifications' | 'achievements' | 'skills'

  // Importing state
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const processSelectedFile = (selected) => {
    if (!selected) return;

    const validExtensions = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validExtensions.some(ext => selected.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError('Invalid format. Please upload a PDF (.pdf) or Word document (.docx).');
      setFile(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum supported resume size is 10 MB.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    processSelectedFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processSelectedFile(dropped);
  };

  const handleExtractSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file to upload.');
      return;
    }

    setError('');
    setImportSuccess(null);
    setExtracting(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/students/me/resume/extract', formData, {
        headers: { 'Content-Type': undefined }
      });

      if (res.data.success && res.data.extracted) {
        const raw = res.data.extracted;
        // Ensure basic info has importBio toggle
        if (raw.basicInfo) {
          raw.basicInfo.importBio = Boolean(raw.basicInfo.bio);
          if (Array.isArray(raw.basicInfo.links)) {
            raw.basicInfo.links = raw.basicInfo.links.map(l => ({ ...l, selected: true }));
          }
        }
        setExtractedData(raw);
      } else {
        throw new Error(res.data.message || 'Could not parse resume.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process and extract resume.');
    } finally {
      setExtracting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setError('');
    setImportSuccess(null);
  };

  // Toggle item selection
  const toggleItemSelection = (section, index) => {
    setExtractedData(prev => {
      const updated = { ...prev };
      if (Array.isArray(updated[section])) {
        const list = [...updated[section]];
        list[index] = { ...list[index], selected: !list[index].selected };
        updated[section] = list;
      }
      return updated;
    });
  };

  // Remove item before importing
  const removeItem = (section, index) => {
    setExtractedData(prev => {
      const updated = { ...prev };
      if (Array.isArray(updated[section])) {
        updated[section] = updated[section].filter((_, i) => i !== index);
      }
      return updated;
    });
  };

  // Toggle all in section
  const toggleAllInSection = (section, selectAll) => {
    setExtractedData(prev => {
      const updated = { ...prev };
      if (Array.isArray(updated[section])) {
        updated[section] = updated[section].map(item => ({ ...item, selected: selectAll }));
      }
      return updated;
    });
  };

  // Save / Import to Portfolio
  const handleImportToPortfolio = async () => {
    if (!extractedData) return;
    setError('');
    setImporting(true);

    try {
      const res = await api.post('/students/me/resume/import', extractedData);
      if (res.data.success) {
        setImportSuccess(res.data.summary);
        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        throw new Error(res.data.message || 'Failed to import to portfolio.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error occurred while saving to portfolio.');
    } finally {
      setImporting(false);
    }
  };

  // Count items
  const counts = {
    education: extractedData?.education?.length || 0,
    projects: extractedData?.projects?.length || 0,
    experience: extractedData?.experience?.length || 0,
    certifications: extractedData?.certifications?.length || 0,
    achievements: extractedData?.achievements?.length || 0,
    skills: extractedData?.skills?.length || 0
  };

  const selectedCounts = {
    education: extractedData?.education?.filter(i => i.selected)?.length || 0,
    projects: extractedData?.projects?.filter(i => i.selected)?.length || 0,
    experience: extractedData?.experience?.filter(i => i.selected)?.length || 0,
    certifications: extractedData?.certifications?.filter(i => i.selected)?.length || 0,
    achievements: extractedData?.achievements?.filter(i => i.selected)?.length || 0,
    skills: extractedData?.skills?.filter(i => i.selected)?.length || 0
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]">
              <Sparkles className="w-3.5 h-3.5 text-[#243F64]" />
              Automated Portfolio Ingestion
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Resume Extract
            </h1>
            <p className="text-sm text-[#526175] max-w-2xl">
              Upload your academic or professional resume. CampusFolio will automatically extract your education, projects, skills, certifications, and experience for your review before adding them to your portfolio.
            </p>
          </div>

          {extractedData && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[#DCE3EC] text-[#526175] hover:bg-[#F4F6F9] hover:text-[#0F172A] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Upload Another Resume
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Extraction Error</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Success Notification after import */}
      {importSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4">
          <div className="flex items-start gap-3.5">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="text-base font-bold">Portfolio Updated Successfully!</h3>
              <p className="text-xs sm:text-sm text-emerald-700 mt-0.5">
                The extracted items have been safely saved to your official student portfolio database. All imported records remain editable at any time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200">
              <span className="font-bold text-emerald-900 block">{importSuccess.educationAdded}</span> Education Added
            </div>
            <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200">
              <span className="font-bold text-emerald-900 block">{importSuccess.projectsAdded}</span> Projects Added
            </div>
            <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200">
              <span className="font-bold text-emerald-900 block">{importSuccess.skillsAdded}</span> Skills Linked
            </div>
            <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200">
              <span className="font-bold text-emerald-900 block">{importSuccess.certificationsAdded + importSuccess.achievementsAdded}</span> Credentials Added
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#142B4A] text-white hover:bg-[#243F64]"
            >
              <span>View Dashboard Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#DCE3EC] text-[#526175] hover:bg-[#F4F6F9]"
            >
              Upload Another Resume
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: UPLOAD AREA (when no data has been extracted yet) */}
      {!extractedData && !importSuccess && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#DCE3EC] shadow-xs space-y-6">
          <form onSubmit={handleExtractSubmit} className="space-y-6">
            
            {/* Dropzone */}
            <div
              onClick={() => document.getElementById('resumeFileInput')?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-[#142B4A] bg-[#E9EFF6] scale-[1.01]'
                  : file
                  ? 'border-[#142B4A] bg-[#E9EFF6]/30'
                  : 'border-[#B9C9DD] hover:border-[#142B4A] hover:bg-[#F4F6F9] bg-[#F4F6F9]/50'
              }`}
            >
              <input
                type="file"
                id="resumeFileInput"
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#E9EFF6] flex items-center justify-center text-[#142B4A] shadow-xs">
                  {file ? <FileText className="w-8 h-8 text-[#142B4A]" /> : <UploadCloud className="w-8 h-8 text-[#243F64]" />}
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-base font-bold text-[#0F172A]">{file.name}</p>
                    <p className="text-xs text-[#526175]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for processing
                    </p>
                    <label
                      htmlFor="resumeFileInput"
                      className="inline-block mt-2 text-xs font-semibold text-[#142B4A] hover:underline cursor-pointer"
                    >
                      Choose a different file
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-base font-bold text-[#0F172A]">
                      Drag & Drop your resume or{' '}
                      <label htmlFor="resumeFileInput" className="text-[#142B4A] hover:underline cursor-pointer">
                        browse files
                      </label>
                    </p>
                    <p className="text-xs text-[#526175]">
                      Supports PDF (.pdf) and Microsoft Word (.docx) documents up to 10 MB.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy notice banner */}
            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#142B4A] shrink-0 mt-0.5" />
              <div className="text-xs text-[#526175] space-y-1">
                <p className="font-semibold text-[#0F172A]">Institutional Data Protection Guarantee</p>
                <p>
                  Your resume data is processed securely on the backend. Institutional identifiers (such as Roll Number, Department, Batch, and Student ID) are strictly protected and will never be overwritten.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || extracting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-[#142B4A] text-white hover:bg-[#243F64] disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Extracting Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Portfolio Data</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: REVIEW & EDIT & CONFIRMATION WORKSPACE */}
      {extractedData && !importSuccess && (
        <div className="space-y-6">
          
          {/* Summary Strip */}
          <div className="bg-[#142B4A] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B9C9DD]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Resume Parsed Successfully
              </div>
              <h2 className="text-xl font-bold">Review Extracted Portfolio Details</h2>
              <p className="text-xs text-[#B9C9DD]">
                Inspect, edit, or uncheck items you do not wish to import. Duplicate entries have been automatically flagged.
              </p>
            </div>

            <button
              onClick={handleImportToPortfolio}
              disabled={importing}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Import Selected to Portfolio</span>
                </>
              )}
            </button>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-[#DCE3EC] shadow-xs">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'basic' ? 'bg-[#142B4A] text-white' : 'text-[#526175] hover:bg-[#F4F6F9]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Basic Info & Links
            </button>

            <button
              onClick={() => setActiveTab('education')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'education' ? 'bg-[#142B4A] text-white' : 'text-[#526175] hover:bg-[#F4F6F9]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Education ({selectedCounts.education}/{counts.education})
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'projects' ? 'bg-[#142B4A] text-white' : 'text-[#526175] hover:bg-[#F4F6F9]'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              Projects ({selectedCounts.projects}/{counts.projects})
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'skills' ? 'bg-[#142B4A] text-white' : 'text-[#526175] hover:bg-[#F4F6F9]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Skills ({selectedCounts.skills}/{counts.skills})
            </button>

            <button
              onClick={() => setActiveTab('experience')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'experience' ? 'bg-[#142B4A] text-white' : 'text-[#526175] hover:bg-[#F4F6F9]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Experience ({selectedCounts.experience}/{counts.experience})
            </button>

            <button
              onClick={() => setActiveTab('certifications')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'certifications' ? 'bg-[#142B4A] text-white' : 'text-[#526175] hover:bg-[#F4F6F9]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Certifications ({selectedCounts.certifications}/{counts.certifications})
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'achievements' ? 'bg-[#142B4A] text-white' : 'text-[#526175] hover:bg-[#F4F6F9]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Achievements ({selectedCounts.achievements}/{counts.achievements})
            </button>
          </div>

          {/* TAB 1: BASIC INFO & LINKS */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Candidate Profile & External Links</h3>
                  <p className="text-xs text-[#526175]">Review candidate summary and social/code links extracted from the resume.</p>
                </div>
              </div>

              {/* Extracted Name & Email display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#526175] block">Extracted Name</span>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {extractedData.basicInfo?.fullName || 'Not specified'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#526175] block">Extracted Contact Email</span>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {extractedData.basicInfo?.email || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Bio / Professional Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#526175] flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(extractedData.basicInfo?.importBio)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setExtractedData(prev => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, importBio: checked }
                        }));
                      }}
                      className="rounded border-[#B9C9DD] text-[#142B4A]"
                    />
                    <span>Import Extracted Bio (Max 150 characters)</span>
                  </label>
                  <span className="text-xs text-[#526175]">
                    {extractedData.basicInfo?.bio?.length || 0}/150
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={extractedData.basicInfo?.bio || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExtractedData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, bio: val }
                    }));
                  }}
                  className="w-full p-3 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white"
                  placeholder="Professional summary statement..."
                />
              </div>

              {/* Links */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526175] block">
                  Discovered Links ({extractedData.basicInfo?.links?.length || 0})
                </span>

                {extractedData.basicInfo?.links?.length === 0 ? (
                  <p className="text-xs text-[#526175] italic">No public web or code links detected in this resume.</p>
                ) : (
                  <div className="space-y-2">
                    {extractedData.basicInfo?.links?.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC]">
                        <input
                          type="checkbox"
                          checked={Boolean(link.selected)}
                          onChange={() => {
                            setExtractedData(prev => {
                              const updated = { ...prev };
                              updated.basicInfo.links[idx].selected = !updated.basicInfo.links[idx].selected;
                              return updated;
                            });
                          }}
                          className="rounded border-[#B9C9DD] text-[#142B4A]"
                        />
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#DCE3EC] text-[#142B4A]">
                          {link.platform}
                        </span>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExtractedData(prev => {
                              const updated = { ...prev };
                              updated.basicInfo.links[idx].url = val;
                              return updated;
                            });
                          }}
                          className="flex-1 bg-white border border-[#DCE3EC] rounded-lg px-2.5 py-1 text-xs text-[#0F172A]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === 'education' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Education Entries ({counts.education})</h3>
                  <p className="text-xs text-[#526175]">Academic qualifications and degrees parsed from the document.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllInSection('education', true)}
                    className="text-xs font-semibold text-[#142B4A] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#DCE3EC]">|</span>
                  <button
                    onClick={() => toggleAllInSection('education', false)}
                    className="text-xs font-semibold text-[#526175] hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {extractedData.education?.length === 0 ? (
                <p className="text-xs text-[#526175] italic py-4">No education entries extracted.</p>
              ) : (
                <div className="space-y-3">
                  {extractedData.education?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.selected
                          ? 'border-[#142B4A] bg-[#E9EFF6]/20'
                          : 'border-[#DCE3EC] bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(item.selected)}
                            onChange={() => toggleItemSelection('education', idx)}
                            className="mt-1 rounded border-[#B9C9DD] text-[#142B4A]"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#0F172A]">{item.program}</span>
                              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-[#142B4A] text-white">
                                {item.level}
                              </span>
                              {item.isDuplicate && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {item.duplicateNotice || 'Duplicate Record'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#526175]">{item.institution} • {item.fieldOfStudy}</p>
                            <p className="text-xs text-[#526175]">
                              {item.startYear} – {item.isCurrent ? 'Present (Ongoing)' : item.endYear || 'N/A'}
                              {item.grade && ` • Grade: ${item.grade}`}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem('education', idx)}
                          className="text-[#526175] hover:text-red-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Projects ({counts.projects})</h3>
                  <p className="text-xs text-[#526175]">Software projects and innovations discovered in your resume.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllInSection('projects', true)}
                    className="text-xs font-semibold text-[#142B4A] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#DCE3EC]">|</span>
                  <button
                    onClick={() => toggleAllInSection('projects', false)}
                    className="text-xs font-semibold text-[#526175] hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {extractedData.projects?.length === 0 ? (
                <p className="text-xs text-[#526175] italic py-4">No project entries extracted.</p>
              ) : (
                <div className="space-y-3">
                  {extractedData.projects?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.selected
                          ? 'border-[#142B4A] bg-[#E9EFF6]/20'
                          : 'border-[#DCE3EC] bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 w-full">
                          <input
                            type="checkbox"
                            checked={Boolean(item.selected)}
                            onChange={() => toggleItemSelection('projects', idx)}
                            className="mt-1 rounded border-[#B9C9DD] text-[#142B4A]"
                          />
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#0F172A]">{item.title}</span>
                              {item.role && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {item.role}
                                </span>
                              )}
                              {item.isDuplicate && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {item.duplicateNotice || 'Duplicate Project'}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#526175] leading-relaxed">{item.description}</p>

                            {/* Tech Badges */}
                            {item.technologies?.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {item.technologies.map((t, tidx) => (
                                  <span key={tidx} className="text-2xs font-medium px-2 py-0.5 rounded-md bg-white border border-[#DCE3EC] text-[#142B4A]">
                                    {typeof t === 'string' ? t : t.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Links */}
                            <div className="flex items-center gap-3 text-xs pt-1">
                              {item.githubUrl && (
                                <a href={item.githubUrl} target="_blank" rel="noreferrer" className="text-[#142B4A] hover:underline">
                                  GitHub Repo
                                </a>
                              )}
                              {item.demoLink && (
                                <a href={item.demoLink} target="_blank" rel="noreferrer" className="text-[#142B4A] hover:underline">
                                  Live Demo
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem('projects', idx)}
                          className="text-[#526175] hover:text-red-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Skills & Interests ({counts.skills})</h3>
                  <p className="text-xs text-[#526175]">Click any badge to toggle its import selection.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllInSection('skills', true)}
                    className="text-xs font-semibold text-[#142B4A] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#DCE3EC]">|</span>
                  <button
                    onClick={() => toggleAllInSection('skills', false)}
                    className="text-xs font-semibold text-[#526175] hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {extractedData.skills?.length === 0 ? (
                <p className="text-xs text-[#526175] italic py-4">No skills extracted.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {extractedData.skills?.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleItemSelection('skills', idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        item.selected
                          ? 'bg-[#142B4A] text-white border-[#142B4A] shadow-xs'
                          : 'bg-white text-[#526175] border-[#DCE3EC] opacity-50'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className={`text-2xs px-1.5 py-0.2 rounded-full ${item.selected ? 'bg-[#243F64] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {item.category}
                      </span>
                      {item.isDuplicate && (
                        <span className="text-2xs text-amber-300" title="Already added in your portfolio">
                          • Exists
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Experience & Internships ({counts.experience})</h3>
                  <p className="text-xs text-[#526175]">Work experiences, apprenticeships, and industry roles.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllInSection('experience', true)}
                    className="text-xs font-semibold text-[#142B4A] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#DCE3EC]">|</span>
                  <button
                    onClick={() => toggleAllInSection('experience', false)}
                    className="text-xs font-semibold text-[#526175] hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {extractedData.experience?.length === 0 ? (
                <p className="text-xs text-[#526175] italic py-4">No experience entries extracted.</p>
              ) : (
                <div className="space-y-3">
                  {extractedData.experience?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.selected
                          ? 'border-[#142B4A] bg-[#E9EFF6]/20'
                          : 'border-[#DCE3EC] bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(item.selected)}
                            onChange={() => toggleItemSelection('experience', idx)}
                            className="mt-1 rounded border-[#B9C9DD] text-[#142B4A]"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#0F172A]">{item.role}</span>
                              <span className="text-xs font-semibold text-[#142B4A]">@ {item.organization}</span>
                              {item.isDuplicate && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {item.duplicateNotice || 'Duplicate Record'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#526175]">
                              {item.startDate} – {item.isCurrent ? 'Present' : item.endDate || 'N/A'}
                              {item.location && ` • ${item.location}`}
                            </p>
                            <p className="text-xs text-[#526175] leading-relaxed pt-1">{item.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem('experience', idx)}
                          className="text-[#526175] hover:text-red-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Certifications ({counts.certifications})</h3>
                  <p className="text-xs text-[#526175]">Accredited licenses and courses detected in the resume.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllInSection('certifications', true)}
                    className="text-xs font-semibold text-[#142B4A] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#DCE3EC]">|</span>
                  <button
                    onClick={() => toggleAllInSection('certifications', false)}
                    className="text-xs font-semibold text-[#526175] hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {extractedData.certifications?.length === 0 ? (
                <p className="text-xs text-[#526175] italic py-4">No certifications extracted.</p>
              ) : (
                <div className="space-y-3">
                  {extractedData.certifications?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.selected
                          ? 'border-[#142B4A] bg-[#E9EFF6]/20'
                          : 'border-[#DCE3EC] bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(item.selected)}
                            onChange={() => toggleItemSelection('certifications', idx)}
                            className="mt-1 rounded border-[#B9C9DD] text-[#142B4A]"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#0F172A]">{item.name}</span>
                              <span className="text-xs text-[#526175]">Issued by {item.issuer}</span>
                              {item.isDuplicate && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {item.duplicateNotice || 'Duplicate'}
                                </span>
                              )}
                            </div>
                            {item.credentialUrl && (
                              <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-[#142B4A] hover:underline block">
                                Credential Link
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem('certifications', idx)}
                          className="text-[#526175] hover:text-red-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE3EC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Achievements & Awards ({counts.achievements})</h3>
                  <p className="text-xs text-[#526175]">Honors, hackathon podium finishes, and academic recognitions.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllInSection('achievements', true)}
                    className="text-xs font-semibold text-[#142B4A] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#DCE3EC]">|</span>
                  <button
                    onClick={() => toggleAllInSection('achievements', false)}
                    className="text-xs font-semibold text-[#526175] hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {extractedData.achievements?.length === 0 ? (
                <p className="text-xs text-[#526175] italic py-4">No achievements extracted.</p>
              ) : (
                <div className="space-y-3">
                  {extractedData.achievements?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.selected
                          ? 'border-[#142B4A] bg-[#E9EFF6]/20'
                          : 'border-[#DCE3EC] bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(item.selected)}
                            onChange={() => toggleItemSelection('achievements', idx)}
                            className="mt-1 rounded border-[#B9C9DD] text-[#142B4A]"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#0F172A]">{item.title}</span>
                              {item.isDuplicate && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {item.duplicateNotice || 'Duplicate'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#526175]">{item.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem('achievements', idx)}
                          className="text-[#526175] hover:text-red-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="bg-white rounded-2xl p-6 border border-[#DCE3EC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#526175]">
              Ready to import? Only checked items will be committed to your official portfolio.
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#DCE3EC] text-[#526175] hover:bg-[#F4F6F9]"
              >
                Discard & Upload Another
              </button>
              <button
                onClick={handleImportToPortfolio}
                disabled={importing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Import Selected to Portfolio</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
