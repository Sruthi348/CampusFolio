import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Award,
  FileText,
  ShieldCheck,
  Briefcase,
  Trophy,
  Activity,
  Link2,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Compass
} from 'lucide-react';

export function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileSummary, setProfileSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProfileSummary = async () => {
    try {
      const res = await api.get('/students/me');
      if (res.data.success) {
        setProfileSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to load profile summary:', err);
    }
  };

  useEffect(() => {
    fetchProfileSummary();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profile = profileSummary?.profile;
  const completion = profileSummary?.completion?.percentage || 0;
  const slug = profile?.slug || (profile?.fullName ? profile.fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : '');

  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'My Profile', to: '/dashboard/profile', icon: User },
    { name: 'Education', to: '/dashboard/education', icon: GraduationCap },
    { name: 'Skills & Interests', to: '/dashboard/skills', icon: Sparkles },
    { name: 'Projects', to: '/dashboard/projects', icon: FolderGit2, badge: profile?.projects?.length },
    { name: 'Certifications', to: '/dashboard/certifications', icon: Award, badge: profile?.certifications?.length },
    { name: 'Resume Extract', to: '/dashboard/resume-extract', icon: FileText },
    { name: 'Document Verification', to: '/dashboard/verification', icon: ShieldCheck, badge: profile?.documentSubmissions?.length },
    { name: 'Experience', to: '/dashboard/experience', icon: Briefcase, badge: profile?.experience?.length },
    { name: 'Achievements', to: '/dashboard/achievements', icon: Trophy, badge: profile?.achievements?.length },
    { name: 'Extracurriculars', to: '/dashboard/extracurriculars', icon: Activity, badge: profile?.extracurriculars?.length },
    { name: 'Social Links', to: '/dashboard/links', icon: Link2, badge: profile?.links?.length },
    { name: 'Account Settings', to: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row">
      
      {/* Mobile Top Header Bar */}
      <div className="md:hidden bg-[#142B4A] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-[#243F64]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-[#243F64] text-[#E9EFF6] hover:bg-[#32537f] transition"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#243F64] flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">CampusFolio</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {slug && (
            <a
              href={`/student/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-[#243F64] text-[#E9EFF6] hover:text-white rounded-lg border border-[#B9C9DD]/30"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview
            </a>
          )}
        </div>
      </div>

      {/* Deep Navy Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-68 bg-[#142B4A] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 border-r border-[#243F64] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: CampusFolio Brand Header */}
        <div>
          <div className="p-4 border-b border-[#243F64] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#243F64] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-[#E9EFF6]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg leading-tight tracking-tight text-white">
                  Campus<span className="text-[#B9C9DD]">Folio</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B9C9DD]">
                  Student Portal
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#B9C9DD] hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="overflow-y-auto px-3 py-2 space-y-1 max-h-[calc(100vh-270px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[#243F64] text-white font-semibold shadow-xs'
                        : 'text-[#B9C9DD] hover:text-white hover:bg-[#243F64]/60 font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-[#B9C9DD]'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : 'bg-[#243F64] text-[#E9EFF6]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Info, Completion Bar, and Sign Out */}
        <div className="p-3.5 border-t border-[#243F64] bg-[#0f213a]/60 space-y-3">
          {/* Public Preview Button */}
          {slug && (
            <a
              href={`/student/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-[#E9EFF6] bg-[#243F64] hover:bg-[#2e4f7a] border border-[#B9C9DD]/20 transition"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#B9C9DD]" />
                <span>View Public Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B9C9DD]" />
            </a>
          )}

          {/* Profile Strength */}
          <div className="px-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#B9C9DD] font-medium">Portfolio Completion</span>
              <span className="font-bold text-white">{completion}%</span>
            </div>
            <div className="w-full bg-[#243F64] rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completion >= 80 ? 'bg-emerald-400' : completion >= 50 ? 'bg-sky-400' : 'bg-amber-400'
                }`}
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>

          {/* User profile row */}
          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="w-9 h-9 rounded-full bg-[#243F64] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#B9C9DD]/30 overflow-hidden">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                profile?.fullName ? profile.fullName.charAt(0) : 'S'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {profile?.fullName || 'Student'}
              </p>
              <p className="text-xs text-[#B9C9DD] truncate font-mono">
                {profile?.rollNumber || user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#B9C9DD] hover:text-rose-400 p-1.5 rounded-md transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile offcanvas */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-2xs z-30 md:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <Outlet context={{ profileSummary, refreshProfile: fetchProfileSummary }} />
      </main>
    </div>
  );
}
