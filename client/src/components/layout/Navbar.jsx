import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Search,
  BookOpen,
  FolderGit2,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isStaff, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const studentSlug = user?.studentProfile?.slug;

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#DCE3EC] shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center text-white shadow-xs transition-colors group-hover:bg-[#243F64]">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl leading-tight tracking-tight text-[#0F172A]">
                  Campus<span className="text-[#142B4A]">Folio</span>
                </span>
                <span className="text-xs font-semibold text-[#526175] tracking-wider uppercase">
                  Institutional Portfolio
                </span>
              </div>
            </Link>

            {/* Desktop Public Nav */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                to="/search"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/search')
                    ? 'text-[#142B4A] bg-[#E9EFF6]'
                    : 'text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9]'
                }`}
              >
                <Search className="w-4 h-4 text-[#243F64]" />
                Explore Portfolios
              </Link>
              <Link
                to="/departments"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/departments')
                    ? 'text-[#142B4A] bg-[#E9EFF6]'
                    : 'text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#526175]" />
                Departments
              </Link>
              <Link
                to="/projects"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/projects')
                    ? 'text-[#142B4A] bg-[#E9EFF6]'
                    : 'text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9]'
                }`}
              >
                <FolderGit2 className="w-4 h-4 text-[#526175]" />
                Innovations
              </Link>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {isStudent && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#142B4A] text-white hover:bg-[#243F64] shadow-xs transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {studentSlug && (
                      <Link
                        to={`/student/${studentSlug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[#DCE3EC] text-[#526175] hover:text-[#142B4A] hover:bg-[#F4F6F9] transition-colors"
                        title="View Public Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Public View
                      </Link>
                    )}
                  </>
                )}

                {isStaff && (
                  <Link
                    to="/staff"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#142B4A] text-white hover:bg-[#243F64] shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verification Portal
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#142B4A] text-white hover:bg-[#243F64] shadow-xs transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Control
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#526175] hover:text-[#A82222] hover:bg-[#FDF0F0] transition-colors cursor-pointer"
                  title="Sign out of CampusFolio"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/search"
                  className="text-sm font-semibold text-[#526175] hover:text-[#0F172A] px-3.5 py-2 rounded-lg hover:bg-[#F4F6F9] transition-colors"
                >
                  Search Talent
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#142B4A] text-white hover:bg-[#243F64] shadow-xs transition-colors"
                >
                  <span>Portal Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9] transition-colors focus:outline-hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#142B4A]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#DCE3EC] px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fade-in-slide-up">
          <nav className="space-y-1">
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#0F172A] hover:bg-[#E9EFF6] transition-colors"
            >
              <Search className="w-4 h-4 text-[#142B4A]" />
              Explore Portfolios
            </Link>
            <Link
              to="/departments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#0F172A] hover:bg-[#E9EFF6] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#142B4A]" />
              Academic Departments
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#0F172A] hover:bg-[#E9EFF6] transition-colors"
            >
              <FolderGit2 className="w-4 h-4 text-[#142B4A]" />
              Featured Innovations
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#DCE3EC] space-y-2">
            {isAuthenticated ? (
              <>
                {isStudent && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-[#142B4A] text-white"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Open Student Portal
                  </Link>
                )}
                {isStaff && (
                  <Link
                    to="/staff"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-[#142B4A] text-white"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Staff Verification Portal
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-[#142B4A] text-white"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Governance Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-[#A82222] bg-[#FDF0F0] hover:bg-[#FCA5A5]/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-[#142B4A] text-white"
              >
                Sign In to CampusFolio
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
