import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#142B4A] bg-[#E9EFF6] px-3 py-1 rounded-full border border-[#B9C9DD] mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#142B4A]" />
            Data Protection & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Institutional Portfolio Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-2">
            How we protect student personal data, verify credentials, and respect section visibility preferences.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-8 sm:p-10 shadow-[0_1px_3px_rgba(20,43,74,0.05)] space-y-7 text-xs sm:text-sm text-[#526175] leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#142B4A]" />
              1. Date of Birth and Private Fields Protection
            </h2>
            <p>
              Under institutional policy and technical specification FR-4.6 / FR-6.5, student personal dates of birth (DOB) are strictly confidential. Date of birth data is never transmitted to non-owners, visitors, recruiters, or public API endpoints. Only the verified student and authorized institutional administrators can view or edit this information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#142B4A]" />
              2. Student-Controlled Section Visibility
            </h2>
            <p>
              Students maintain complete autonomy over which portfolio sections appear on their public URL (`/student/:username`). Through the Account Settings and Portfolio Editor, students can toggle the visibility of education, projects, certifications, internships, achievements, and links. Hidden sections are omitted from both the public webpage and public REST API responses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#142B4A]" />
              3. Institutional Moderation & Credential Verification
            </h2>
            <p>
              To maintain academic integrity and recruiter trust, self-reported certifications and competitive achievements undergo review by department tutors and administrators. Verified credentials display an institutional verification badge. Suspended or unapproved accounts are immediately purged from discovery search and public URLs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#142B4A]" />
              4. Security Architecture & Audit Logging
            </h2>
            <p>
              All passwords are encrypted with industry-standard bcrypt hashing. Sessions are governed by signed JSON Web Tokens with strict expiry. Every administrative action (approval, suspension, certification verification, and batch graduation) is permanently recorded in an immutable audit log.
            </p>
          </section>

          <div className="pt-6 border-t border-[#DCE3EC] flex items-center justify-between text-xs text-[#526175]">
            <span>Version 2.0 • Institutional Data Governance</span>
            <span>CampusFolio Platform Standard</span>
          </div>

        </div>

      </div>
    </div>
  );
}
