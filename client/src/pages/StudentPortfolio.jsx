import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  GraduationCap,
  Calendar,
  ExternalLink,
  Globe,
  Share2,
  CheckCircle2,
  Award,
  Briefcase,
  Trophy,
  Activity,
  FolderGit2,
  Sparkles,
  ShieldCheck,
  Building2,
  Check,
  ArrowRight
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/common/Icons';

export function StudentPortfolio() {
  const { username } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/public/students/${username}`);
        if (res.data.success) {
          setStudent(res.data.student);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(err.response.data?.message || 'Portfolio not found or unavailable.');
        } else {
          setError('Failed to load portfolio. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#526175]">Loading student portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
          <div className="w-12 h-12 bg-[#FDF0F0] text-[#A82222] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#F8C8C8]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">Portfolio Unavailable</h2>
          <p className="text-xs text-[#526175] mt-2 leading-relaxed">
            {error || 'This student portfolio is private, suspended, or does not exist.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/search"
              className="px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
            >
              Explore Portfolios
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-[#FFFFFF] border border-[#DCE3EC] text-[#526175] hover:text-[#0F172A] text-xs font-bold uppercase tracking-wider rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAlumni = student.status === 'ALUMNI' || student.status === 'GRADUATED';

  // Group skills by category
  const technicalSkills = student.skills?.filter(s => s.skill.category === 'TECHNICAL') || [];
  const softSkills = student.skills?.filter(s => s.skill.category === 'SOFT') || [];
  const interests = student.skills?.filter(s => s.skill.category === 'INTEREST') || [];

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-20">
      
      {/* Top Banner / Breadcrumb */}
      <div className="bg-[#FFFFFF] border-b border-[#DCE3EC] py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#526175]">
            <Link to="/" className="hover:text-[#142B4A]">Home</Link>
            <span>/</span>
            <Link to="/search" className="hover:text-[#142B4A]">Portfolios</Link>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">{student.fullName}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] border border-[#DCE3EC] hover:bg-[#F4F6F9] text-[#142B4A] rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Portfolio</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Profile Header Card */}
        <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(20,43,74,0.05)] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#142B4A] text-white flex items-center justify-center font-extrabold text-3xl overflow-hidden shadow-xs border-2 border-[#DCE3EC]">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  student.fullName.charAt(0)
                )}
              </div>
              <div
                className="absolute -bottom-2 -right-2 bg-[#FFFFFF] rounded-full p-1.5 shadow-xs border border-[#DCE3EC]"
                title="Institutionally Verified"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            {/* Core Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                  {student.fullName}
                </h1>
                
                {isAlumni ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-pending">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Alumni
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-approved">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Student
                  </span>
                )}
              </div>

              {/* Department & Batch Metadata */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm sm:text-base text-[#526175] mb-3">
                <span className="font-semibold text-[#142B4A] flex items-center gap-1.5">
                  <Building2 className="w-4.5 h-4.5" />
                  {student.department?.name} ({student.department?.code})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4.5 h-4.5 text-[#526175]" />
                  Batch: {student.batch?.name} (Class of {student.batch?.graduationYear})
                </span>
              </div>

              {/* Bio */}
              {student.bio && (
                <p className="text-sm sm:text-base text-[#0F172A] leading-relaxed max-w-3xl">
                  {student.bio}
                </p>
              )}

              {/* Professional Links */}
              {student.links && student.links.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-4">
                  {student.links.map((link) => {
                    const platformLower = link.platform.toLowerCase();
                    const isGh = platformLower.includes('github');
                    const isLi = platformLower.includes('linkedin');

                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] text-sm font-semibold text-[#0F172A] hover:border-[#142B4A] hover:text-[#142B4A] transition shadow-2xs"
                      >
                        {isGh && <GithubIcon className="w-4 h-4 text-[#0F172A]" />}
                        {isLi && <LinkedinIcon className="w-4 h-4 text-[#243F64]" />}
                        {!isGh && !isLi && <Globe className="w-4 h-4 text-[#142B4A]" />}
                        <span>{link.label || link.platform}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#526175]" />
                      </a>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </section>

        {/* Skills & Interests Section */}
        {student.skills && student.skills.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#142B4A]" />
              Skills & Expertise
            </h2>

            <div className="space-y-4">
              {technicalSkills.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#526175] mb-2.5">
                    Technical Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {technicalSkills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#E9EFF6] text-[#243F64] border border-[#DCE3EC]"
                      >
                        {s.skill.name}
                        {s.proficiency && (
                          <span className="text-xs text-[#526175] font-normal">
                            ({s.proficiency})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {softSkills.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#526175] mb-2.5">
                    Core Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-[#F4F6F9] text-[#0F172A] border border-[#DCE3EC]"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {interests.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#526175] mb-2.5">
                    Interests & Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]"
                      >
                        #{s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {student.projects && student.projects.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#142B4A]" />
              Engineering Projects & Applications ({student.projects.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {student.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="border border-[#DCE3EC] rounded-xl p-5 bg-[#F4F6F9] flex flex-col justify-between hover:border-[#142B4A] transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] bg-[#E9EFF6] px-2.5 py-1 rounded border border-[#DCE3EC]">
                        {proj.category || 'Software Project'}
                      </span>
                      {proj.isFeatured && (
                        <span className="text-xs font-semibold badge-approved px-2.5 py-1 rounded flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-[#0F172A] leading-snug">
                      {proj.title}
                    </h3>

                    {proj.role && (
                      <p className="text-sm text-[#526175] font-medium mt-1">
                        Role: {proj.role}
                      </p>
                    )}

                    <p className="text-sm text-[#526175] mt-2 leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-3.5">
                        {proj.technologies.map((t) => (
                          <span
                            key={t.skill.id}
                            className="text-xs px-2.5 py-1 rounded bg-[#FFFFFF] text-[#243F64] border border-[#DCE3EC] font-medium"
                          >
                            {t.skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
                    <span className="text-[#526175] font-medium text-xs">
                      Status: {proj.progressStatus}
                    </span>
                    <div className="flex items-center gap-3">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#526175] hover:text-[#0F172A] transition flex items-center gap-1.5 font-semibold text-sm"
                        >
                          <GithubIcon className="w-4 h-4" />
                          Code
                        </a>
                      )}
                      {proj.demoLink && (
                        <a
                          href={proj.demoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#142B4A] hover:text-[#243F64] transition flex items-center gap-1.5 font-semibold text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Timeline */}
        {student.education && student.education.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#142B4A]" />
              Education History
            </h2>

            <div className="relative pl-6 border-l-2 border-[#B9C9DD] space-y-6">
              {student.education.map((edu) => (
                <div key={edu.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#142B4A] border-4 border-white shadow-xs"></div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-[#0F172A]">
                      {edu.program}
                    </h3>
                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded bg-[#E9EFF6] text-[#142B4A]">
                      {edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[#526175] mt-1">
                    {edu.institution} • {edu.fieldOfStudy}
                  </p>

                  {edu.grade && (
                    <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded badge-approved">
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications (Verified Only) */}
        {student.certifications && student.certifications.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#142B4A]" />
              Faculty-Verified Certifications ({student.certifications.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] flex items-start justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Tutor Verified
                    </div>
                    <h3 className="font-bold text-base text-[#0F172A]">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-[#526175] mt-1">
                      Issued by <span className="font-semibold">{cert.issuer}</span> • {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-[#526175] hover:text-[#142B4A] transition shrink-0"
                      title="View Credential"
                    >
                      <ExternalLink className="w-4.5 h-4.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience & Internships */}
        {student.experience && student.experience.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#142B4A]" />
              Work Experience & Internships
            </h2>

            <div className="relative pl-6 border-l-2 border-[#DCE3EC] space-y-6">
              {student.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#243F64] border-4 border-white shadow-xs"></div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-[#0F172A]">
                      {exp.role}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#F4F6F9] text-[#526175]">
                      {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Completed'}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#142B4A] mt-1">
                    {exp.organization} {exp.location && `• ${exp.location}`}
                  </p>

                  <p className="text-sm text-[#526175] mt-1.5 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements (Verified Only) */}
        {student.achievements && student.achievements.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#142B4A]" />
              Honors & Achievements
            </h2>

            <div className="space-y-3.5">
              {student.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] flex items-start justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded badge-pending">
                        Award
                      </span>
                      <span className="text-xs text-[#526175] font-medium">
                        {new Date(ach.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#0F172A]">
                      {ach.title}
                    </h3>

                    <p className="text-sm text-[#526175] mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  {ach.proofUrl && (
                    <a
                      href={ach.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[#142B4A] hover:underline flex items-center gap-1 shrink-0 mt-1"
                    >
                      Proof Link <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Extracurricular Activities */}
        {student.extracurriculars && student.extracurriculars.length > 0 && (
          <section className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#142B4A]" />
              Extracurricular Activities & Leadership
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student.extracurriculars.map((extra) => (
                <div
                  key={extra.id}
                  className="p-4 rounded-xl border border-[#DCE3EC] bg-[#F4F6F9] text-sm"
                >
                  <h3 className="font-bold text-base text-[#0F172A]">
                    {extra.activityName}
                  </h3>
                  <div className="text-sm font-semibold text-[#142B4A] mt-1">
                    {extra.role} {extra.organization && `• ${extra.organization}`}
                  </div>
                  <div className="text-xs text-[#526175] mt-1">
                    Duration: {extra.duration}
                  </div>
                  <p className="text-sm text-[#526175] mt-2 leading-relaxed">
                    {extra.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
