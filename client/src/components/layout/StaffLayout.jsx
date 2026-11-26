import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({
    assignedStudents: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    resubmissionRequired: 0
  });

  const fetchOverviewCounts = async () => {
    try {
      const res = await api.get('/staff/overview');
      if (res.data.success && res.data.counts) {
        setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to load staff counts:', err);
    }
  };

  useEffect(() => {
    fetchOverviewCounts();
    const interval = setInterval(fetchOverviewCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', to: '/staff', icon: LayoutDashboard, end: true },
    {
      name: 'Assigned Students',
      to: '/staff/students',
      icon: Users,
      badge: counts.assignedStudents || undefined
    },
    {
      name: 'Pending Verification',
      to: '/staff/verifications/pending',
      icon: ShieldCheck,
      badge: counts.pending || undefined,
      badgeHighlight: true
    },
    {
      name: 'Verified Documents',
      to: '/staff/verifications/verified',
      icon: FileCheck2,
      badge: counts.verified || undefined
    },
    {
      name: 'Corrections & Rejected',
      to: '/staff/verifications/rejected',
      icon: AlertTriangle,
      badge: (counts.rejected + counts.resubmissionRequired) || undefined
    },
    { name: 'Account Settings', to: '/staff/settings', icon: Settings }
  ];

  const staff = user?.staffProfile;

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row">
      
      {/* Mobile Header Bar */}
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

        <div className="text-xs font-semibold px-2.5 py-1 rounded bg-[#243F64] text-[#B9C9DD] border border-[#B9C9DD]/20">
          Faculty
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
                  Staff Portal
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

          {/* Scope Indicator */}
          <div className="px-4 py-2.5 bg-[#0f213a]/50 border-b border-[#243F64]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B9C9DD]">Tutorship Scope</p>
            <p className="text-sm font-bold text-white truncate mt-0.5">
              {staff?.department?.name || 'Department Faculty'}
            </p>
            {staff?.batch?.name && (
              <p className="text-xs text-[#B9C9DD] mt-0.5">
                Cohort: {staff.batch.name}
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="overflow-y-auto px-3 py-3 space-y-1 max-h-[calc(100vh-270px)]">
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
                            item.badgeHighlight
                              ? 'bg-amber-400 text-[#142B4A] font-bold'
                              : isActive
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

        {/* Bottom Section: Staff User Profile and Sign Out */}
        <div className="p-3.5 border-t border-[#243F64] bg-[#0f213a]/60">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#243F64] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#B9C9DD]/30">
              {staff?.fullName ? staff.fullName.charAt(0) : 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {staff?.fullName || 'Faculty Tutor'}
              </p>
              <p className="text-xs text-[#B9C9DD] truncate font-mono">
                {staff?.staffId || user?.email}
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
        <Outlet context={{ refreshCounts: fetchOverviewCounts }} />
      </main>
    </div>
  );
}
