import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2
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

  // Generate student-specific unique portfolio URL using their own slug
  const studentSlug = profile?.slug || profile?.fullName?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') || '';
  const publicUrl = studentSlug ? `${window.location.origin}/student/${studentSlug}` : '';

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const docs = profile?.documentSubmissions || [];
  const verifiedDocs = docs.filter(d => d.status === 'VERIFIED').length;
  const pendingDocs = docs.filter(d => d.status === 'PENDING').length;
  const correctionDocs = docs.filter(d => ['REJECTED', 'RESUBMISSION_REQUIRED'].includes(d.status)).length;

  const isPubliclyActive = profile?.isPublished && pendingDocs === 0 && correctionDocs === 0;

  // Identify next uncompleted step for the primary action
  const nextStep = checklist.find(c => !c.completed) || {
    label: 'Preview your published portfolio',
    path: `/student/${studentSlug}`
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION A: Institutional Portfolio Workspace */}
      <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]">
              <Sparkles className="w-3.5 h-3.5 text-[#142B4A]" />
              Institutional Portfolio Workspace
            </div>
            {/* Welcome message displaying the student's name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Welcome, {profile?.fullName || 'Student'}
            </h1>
            <p className="text-sm sm:text-base text-[#526175]">
              {profile?.department?.name || 'Department'} ({profile?.department?.code}) • Batch of {profile?.batch?.graduationYear || '2026'} • Roll #{profile?.rollNumber}
            </p>
          </div>

          {/* Student-Specific Unique Public URL Box */}
          <div className="bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl p-4 max-w-md w-full">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#526175] uppercase tracking-wider block">
                Your Unique Public Portfolio URL
              </span>
              {isPubliclyActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active & Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full" title="Activates automatically once all documents and sections are verified by your assigned faculty tutor">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Pending Verification
                </span>
              )}
            </div>

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
              {studentSlug && (
                <a
                  href={`/student/${studentSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[#FFFFFF] border border-[#DCE3EC] text-[#243F64] hover:text-[#142B4A] hover:bg-[#E9EFF6] rounded-lg shrink-0 transition"
                  title="Open Public Page"
                >
                  <ExternalLink className="w-4.5 h-4.5" />
                </a>
              )}
            </div>
            {!isPubliclyActive && (
              <p className="text-[11px] text-[#526175] mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Link activates automatically once your assigned tutor verifies your submissions.</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grid containing Section B & Section C */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION B: Profile Strength & Readiness (7 cols) */}
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

        {/* SECTION C: Document Verification (5 cols) */}
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

    </div>
  );
}
