import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate(from === '/' || from.startsWith('/admin') || from.startsWith('/staff') ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F6F9]">
      
      {/* Brand Panel (Left - Deep Navy) */}
      <div className="lg:w-1/2 bg-[#142B4A] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#243F64]/40 blur-2xl pointer-events-none animate-gentle-float"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#1e3a5f]/30 blur-xl pointer-events-none"></div>

        {/* Brand Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group focus:outline-hidden">
            <div className="w-11 h-11 rounded-xl bg-[#243F64] border border-[#B9C9DD]/30 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <GraduationCap className="w-6 h-6 text-[#E9EFF6]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-[#FFFFFF]">
                Campus<span className="text-[#B9C9DD]">Folio</span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#B9C9DD]">
                Institutional Platform
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#B9C9DD] hover:text-white transition-colors px-3.5 py-2 rounded-lg border border-[#B9C9DD]/20 hover:border-[#B9C9DD]/40 bg-[#243F64]/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Abstract Portfolio Composition */}
        <div className="relative z-10 my-12 lg:my-0 max-w-lg">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#243F64]/80 text-[#E9EFF6] border border-[#B9C9DD]/30">
              <ShieldCheck className="w-4 h-4 text-[#B9C9DD]" />
              Verified Institutional Portfolios
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Your journey, achievements and ambitions—together in one place.
            </h1>

            <p className="text-[#B9C9DD] text-base leading-relaxed max-w-md">
              A unified system for students, faculty, and administrators to track academic milestones, verify credentials, and showcase validated work to industry.
            </p>

            {/* Layered visual highlight card */}
            <div className="bg-[#243F64]/50 border border-[#B9C9DD]/20 rounded-2xl p-5 backdrop-blur-xs space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-[#B9C9DD]">
                <span className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                  Institutionally Certified Records
                </span>
                <span className="text-xs font-mono font-semibold uppercase bg-[#142B4A] px-2.5 py-1 rounded text-[#E9EFF6]">
                  RBAC Secured
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                <div className="bg-[#142B4A]/60 rounded-xl p-3 border border-[#B9C9DD]/10">
                  <span className="block text-sm font-bold text-white">Student</span>
                  <span className="text-xs text-[#B9C9DD]">Portfolio CRUD</span>
                </div>
                <div className="bg-[#142B4A]/60 rounded-xl p-3 border border-[#B9C9DD]/10">
                  <span className="block text-sm font-bold text-white">Staff</span>
                  <span className="text-xs text-[#B9C9DD]">Tutor Verification</span>
                </div>
                <div className="bg-[#142B4A]/60 rounded-xl p-3 border border-[#B9C9DD]/10">
                  <span className="block text-sm font-bold text-white">Admin</span>
                  <span className="text-xs text-[#B9C9DD]">Central Governance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 text-sm text-[#B9C9DD]/80 flex items-center justify-between pt-6 border-t border-[#B9C9DD]/10">
          <span>© {new Date().getFullYear()} CampusFolio System</span>
          <span className="font-medium">University Portal Access</span>
        </div>
      </div>

      {/* Login Panel (Right - Soft Blue-Grey Background) */}
      <div className="lg:w-1/2 bg-[#F4F6F9] p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center">
        
        {/* Mobile Back Button */}
        <div className="w-full max-w-md sm:hidden mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#526175] hover:text-[#0F172A]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md animate-fade-in-slide-up">
          
          {/* Card Container */}
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-7 sm:p-9 shadow-[0_2px_12px_rgba(20,43,74,0.06)]">
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-sm text-[#526175] mt-1.5">
                Enter your institutional credentials to access your dashboard
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222] text-sm flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-[#A82222]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 text-[#526175] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu or staff@college.edu"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#0F172A] placeholder-[#526175]/60 focus:outline-hidden focus:border-[#142B4A] focus:ring-2 focus:ring-[#142B4A]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#142B4A] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 text-[#526175] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl pl-10 pr-11 py-3 text-sm text-[#0F172A] placeholder-[#526175]/60 focus:outline-hidden focus:border-[#142B4A] focus:ring-2 focus:ring-[#142B4A]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#526175] hover:text-[#0F172A] focus:outline-hidden p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-bold uppercase tracking-wider transition-all duration-150 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts Quick-Fill Helper */}
            <div className="mt-6 pt-5 border-t border-[#DCE3EC]">
              <div className="text-xs font-bold text-[#526175] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Demo Credentials:</span>
                <span className="text-xs lowercase text-[#526175]/80 font-normal">Click to fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@college.edu', 'AdminPassword@123')}
                  className="px-3 py-2 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] hover:bg-[#E9EFF6] text-[#142B4A] font-semibold text-left transition-colors cursor-pointer"
                >
                  <span className="block text-xs text-[#526175] font-normal">System Admin</span>
                  admin@college.edu
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('staff.mca@college.edu', 'StaffPassword@123')}
                  className="px-3 py-2 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] hover:bg-[#E9EFF6] text-[#142B4A] font-semibold text-left transition-colors cursor-pointer"
                >
                  <span className="block text-xs text-[#526175] font-normal">Staff (MCA Tutor)</span>
                  staff.mca@college.edu
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('keerthana.ar@college.edu', 'Student@123')}
                  className="px-3 py-2 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] hover:bg-[#E9EFF6] text-[#142B4A] font-semibold text-left transition-colors cursor-pointer"
                >
                  <span className="block text-xs text-[#526175] font-normal">Student (Keerthana)</span>
                  keerthana.ar@...
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('rahul.sharma@college.edu', 'Student@123')}
                  className="px-3 py-2 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] hover:bg-[#E9EFF6] text-[#142B4A] font-semibold text-left transition-colors cursor-pointer"
                >
                  <span className="block text-xs text-[#526175] font-normal">Student (Rahul)</span>
                  rahul.sharma@...
                </button>
              </div>
            </div>

          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-semibold text-[#526175] hover:text-[#142B4A] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Return to CampusFolio Homepage
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
