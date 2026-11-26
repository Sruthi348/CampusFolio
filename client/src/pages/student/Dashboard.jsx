import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  FolderGit2,
  Award,
  Trophy,
  Briefcase,
  ExternalLink,
  Copy,
  Check,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  AlertTriangle,
  User,
  GraduationCap
} from 'lucide-react';

export function Dashboard() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (refreshProfile) {
      refreshProfile();
    }
  }, []);

  if (!profileSummary) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-[#526175]">Loading student workspace...</p>
      </div>
    );
  }

  const profile = profileSummary?.profile;
  const completion = profileSummary?.completion?.percentage || 0;
  const checklist = profileSummary?.completion?.checklist || [];

  const slug = profile?.slug;
  const publicUrl = slug ? `${window.location.origin}/student/${slug}` : '';

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const projects = profile?.projects || [];
  const certs = profile?.certifications || [];
  const docs = profile?.documentSubmissions || [];

  const verifiedDocs = docs.filter(d => d.status === 'VERIFIED').length;
  const pendingDocs = docs.filter(d => d.status === 'PENDING').length;
  const correctionDocs = docs.filter(d => ['REJECTED', 'RESUBMISSION_REQUIRED'].includes(d.status)).length;

  // Identify next uncompleted step for the primary action
  const nextStep = checklist.find(c => !c.completed) || {
    label: 'Preview your published portfolio',
    path: `/student/${slug}`
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Welcome Area */}
      <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]">
              <Sparkles className="w-3.5 h-3.5 text-[#142B4A]" />
              Institutional Portfolio Workspace
            </div>
            {/* Exactly "Welcome, [Student Name]" as specified in section 7 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Welcome, {profile?.fullName || 'Student'}
            </h1>
            <p className="text-sm sm:text-base text-[#526175]">
              {profile?.department?.name || 'Department'} ({profile?.department?.code}) • Batch of {profile?.batch?.graduationYear || '2026'} • Roll #{profile?.rollNumber}
            </p>
          </div>

          {/* Unique Public URL Box */}
          <div className="bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl p-4 max-w-md w-full">
            <span className="text-xs font-bold text-[#526175] uppercase tracking-wider block mb-1.5">
              Your Unique Public Portfolio URL
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-sm text-[#0F172A] font-mono select-all focus:outline-hidden"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              {slug && (
                <a
                  href={`/student/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[#FFFFFF] border border-[#DCE3EC] text-[#243F64] hover:text-[#142B4A] hover:bg-[#E9EFF6] rounded-lg shrink-0 transition"
                  title="Open Public Page"
                >
                  <ExternalLink className="w-4.5 h-4.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured Asymmetric Grid: Profile Completion & Verification Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Meaningful Progress & Primary Action Highlight (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Profile Strength & Readiness
                </h2>
                <p className="text-sm text-[#526175] mt-0.5">
                  Complete all sections to unlock maximum discovery score for campus recruiters
                </p>
              </div>
              <span className="text-xl font-black text-[#142B4A]">{completion}%</span>
            </div>

            {/* Visual Progress Bar with markers */}
            <div className="mt-4">
              <div className="w-full bg-[#E9EFF6] rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completion >= 80 ? 'bg-emerald-600' : completion >= 50 ? 'bg-[#142B4A]' : 'bg-amber-500'
                  }`}
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-[#526175] font-semibold mt-2">
                <span>Starter (0%)</span>
                <span>Active (50%)</span>
                <span>Comprehensive (80%+)</span>
              </div>
            </div>

            {/* Checklist items in a 2-col compact grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-[#DCE3EC]">
              {checklist.slice(0, 6).map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-sm">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#DCE3EC] shrink-0"></div>
                  )}
                  <span className={item.completed ? 'text-[#0F172A] font-medium' : 'text-[#526175]'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Card */}
          <div className="mt-5 p-4 rounded-xl bg-[#E9EFF6] border border-[#B9C9DD] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] block">
                Recommended Next Step
              </span>
              <p className="text-sm font-semibold text-[#0F172A] truncate mt-0.5">
                {nextStep.label}
              </p>
            </div>
            <Link
              to={nextStep.path || '/dashboard/profile'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs shrink-0"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right: Verification Progress & Faculty Review Status (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#142B4A]" />
                  Document Verification
                </h2>
                <p className="text-sm text-[#526175] mt-0.5">
                  Academic certificates verified by class tutor
                </p>
              </div>
              <Link
                to="/dashboard/verification"
                className="text-sm font-bold text-[#142B4A] hover:underline"
              >
                View all
              </Link>
            </div>

            {/* Verification status counts in structured blocks */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3.5 rounded-xl badge-approved text-center">
                <span className="text-2xl font-black block">{verifiedDocs}</span>
                <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
              </div>
              <div className="p-3.5 rounded-xl badge-pending text-center">
                <span className="text-2xl font-black block">{pendingDocs}</span>
                <span className="text-xs font-bold uppercase tracking-wider">In Review</span>
              </div>
              <div className="p-3.5 rounded-xl badge-correction text-center">
                <span className="text-2xl font-black block">{correctionDocs}</span>
                <span className="text-xs font-bold uppercase tracking-wider">Action Req</span>
              </div>
            </div>

            {/* Status note */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC] text-sm text-[#526175] leading-relaxed">
              {pendingDocs > 0 ? (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Your tutor has <strong>{pendingDocs} document{pendingDocs > 1 ? 's' : ''}</strong> queued for verification.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>All submitted academic documents are up to date and verified.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
            <span className="text-[#526175]">Need to upload a new certificate?</span>
            <Link
              to="/dashboard/verification"
              className="font-bold text-[#142B4A] hover:text-[#243F64] flex items-center gap-1"
            >
              Upload Evidence <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Useful Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/dashboard/projects"
          className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] hover:border-[#142B4A] hover:shadow-xs transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#E9EFF6] text-[#142B4A] flex items-center justify-center shrink-0 group-hover:bg-[#142B4A] group-hover:text-white transition-colors">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-[#0F172A] block truncate">Projects</span>
            <span className="text-xs text-[#526175]">{projects.length} recorded</span>
          </div>
        </Link>

        <Link
          to="/dashboard/certifications"
          className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] hover:border-[#142B4A] hover:shadow-xs transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#E9EFF6] text-[#142B4A] flex items-center justify-center shrink-0 group-hover:bg-[#142B4A] group-hover:text-white transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-[#0F172A] block truncate">Certifications</span>
            <span className="text-xs text-[#526175]">{certs.length} entries</span>
          </div>
        </Link>

        <Link
          to="/dashboard/verification"
          className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] hover:border-[#142B4A] hover:shadow-xs transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#E9EFF6] text-[#142B4A] flex items-center justify-center shrink-0 group-hover:bg-[#142B4A] group-hover:text-white transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-[#0F172A] block truncate">Verification</span>
            <span className="text-xs text-[#526175]">{docs.length} submitted</span>
          </div>
        </Link>

        <Link
          to="/dashboard/profile"
          className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] hover:border-[#142B4A] hover:shadow-xs transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#E9EFF6] text-[#142B4A] flex items-center justify-center shrink-0 group-hover:bg-[#142B4A] group-hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-[#0F172A] block truncate">Edit Profile</span>
            <span className="text-xs text-[#526175]">Bio & Details</span>
          </div>
        </Link>
      </div>

      {/* 4. Recent Projects & Document Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Projects Preview (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#142B4A]" />
                Recent Projects
              </h2>
              <p className="text-sm text-[#526175] mt-0.5">
                Technical solutions showcased on your public page
              </p>
            </div>
            <Link
              to="/dashboard/projects"
              className="text-sm font-bold text-[#142B4A] hover:underline"
            >
              Manage ({projects.length})
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-[#DCE3EC] rounded-xl">
              <FolderGit2 className="w-9 h-9 text-[#B9C9DD] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#0F172A]">No projects recorded yet</p>
              <p className="text-sm text-[#526175] mt-0.5 max-w-xs mx-auto">
                Add projects to demonstrate your practical technical abilities to recruiters.
              </p>
              <Link
                to="/dashboard/projects"
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-semibold rounded-lg transition"
              >
                <PlusCircle className="w-4 h-4" />
                Add Your First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] hover:bg-[#FFFFFF] hover:border-[#142B4A] transition-all flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A] truncate">{proj.title}</span>
                      {proj.isFeatured && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded badge-approved">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#526175] line-clamp-1 mt-1">
                      {proj.summary || proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {proj.technologies?.slice(0, 3).map((t) => (
                        <span
                          key={t.skill.id}
                          className="text-xs px-2 py-0.5 rounded bg-[#FFFFFF] text-[#243F64] border border-[#DCE3EC] font-medium"
                        >
                          {t.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/dashboard/projects"
                    className="p-2 text-[#526175] hover:text-[#142B4A] rounded-lg transition shrink-0"
                    title="Edit project"
                  >
                    <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Document Submissions (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#142B4A]" />
                Verification Status
              </h2>
              <p className="text-sm text-[#526175] mt-0.5">
                Recently submitted certificates & evidence
              </p>
            </div>
            <Link
              to="/dashboard/verification"
              className="text-sm font-bold text-[#142B4A] hover:underline"
            >
              Upload
            </Link>
          </div>

          {docs.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-[#DCE3EC] rounded-xl">
              <ShieldCheck className="w-9 h-9 text-[#B9C9DD] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#0F172A]">No documents submitted</p>
              <p className="text-sm text-[#526175] mt-0.5 max-w-xs mx-auto">
                Submit course certificates or academic credentials for class tutor verification.
              </p>
              <Link
                to="/dashboard/verification"
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-semibold rounded-lg transition"
              >
                Submit Document
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-[#0F172A] truncate block">{doc.title}</span>
                    <span className="text-xs text-[#526175] block mt-0.5">
                      {doc.category} • {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    {doc.status === 'VERIFIED' && (
                      <span className="px-2.5 py-1 rounded text-xs font-semibold badge-approved">
                        Verified
                      </span>
                    )}
                    {doc.status === 'PENDING' && (
                      <span className="px-2.5 py-1 rounded text-xs font-semibold badge-pending">
                        In Review
                      </span>
                    )}
                    {['REJECTED', 'RESUBMISSION_REQUIRED'].includes(doc.status) && (
                      <span className="px-2.5 py-1 rounded text-xs font-semibold badge-correction">
                        Correction Req
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
