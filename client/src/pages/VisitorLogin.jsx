import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Search,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Compass
} from 'lucide-react';

export function VisitorLogin() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { visitorLogin, visitorRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/search';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await visitorLogin(loginEmail, loginPassword);
      navigate(from);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      await visitorRegister({
        fullName: regFullName,
        email: regEmail,
        organization: regOrganization,
        password: regPassword
      });
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate(from);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F6F9]">
      
      {/* Brand Panel (Left - Deep Navy) */}
      <div className="lg:w-1/2 bg-[#142B4A] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#243F64]/40 blur-2xl pointer-events-none"></div>
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
                Visitor Portal
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

        {/* Feature Highlights */}
        <div className="relative z-10 my-10 lg:my-0 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#243F64]/80 text-[#E9EFF6] border border-[#B9C9DD]/30">
            <UserCheck className="w-4 h-4 text-[#B9C9DD]" />
            Public Visitor & Recruiter Gateway
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Explore Verified Student Talent & Projects.
            </h1>
            <p className="text-base text-[#B9C9DD] leading-relaxed">
              Create an account or log in as an external visitor, industry recruiter, or partner to bookmark, discover, and review accredited student achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#243F64]/40 border border-[#B9C9DD]/20">
              <Compass className="w-5 h-5 text-[#B9C9DD] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-white">Full Discovery Access</p>
                <p className="text-xs text-[#B9C9DD]">Browse academic portfolios, project prototypes, and achievements.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#243F64]/40 border border-[#B9C9DD]/20">
              <Sparkles className="w-5 h-5 text-[#B9C9DD] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-white">Institutional Backing</p>
                <p className="text-xs text-[#B9C9DD]">All academic credentials vetted by college faculty tutors.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="relative z-10 pt-6 border-t border-[#243F64]">
          <p className="text-xs text-[#B9C9DD] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Public Visitor Portal • Institutional records remain tamper-proof
          </p>
        </div>
      </div>

      {/* Form Panel (Right - Crisp Clean UI) */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 border border-[#DCE3EC] shadow-[0_4px_20px_rgba(20,43,74,0.06)]">
          
          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-[#F4F6F9] rounded-xl border border-[#DCE3EC] mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-[#526175] hover:text-[#0F172A]'
              }`}
            >
              Visitor Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-[#526175] hover:text-[#0F172A]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              {mode === 'login' ? 'Welcome Back, Visitor' : 'Register Visitor Account'}
            </h2>
            <p className="text-xs sm:text-sm text-[#526175] mt-1.5">
              {mode === 'login'
                ? 'Log in with your email and password to access discovery features.'
                : 'Fill in your details below to set up your visitor profile.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#526175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="visitor@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#526175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526175] hover:text-[#0F172A]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-[#142B4A] text-white hover:bg-[#243F64] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>{submitting ? 'Authenticating...' : 'Log In as Visitor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#526175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#526175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sarah@techpartners.com"
                    className="w-full pl-10 pr-4 py-2 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1">
                  Organization / Affiliation (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#526175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regOrganization}
                    onChange={(e) => setRegOrganization(e.target.value)}
                    placeholder="e.g. Acme Innovations / Talent Recruiter"
                    className="w-full pl-10 pr-4 py-2 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1">
                  Password (Min. 6 Characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#526175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526175]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#526175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl text-sm focus:outline-hidden focus:border-[#142B4A] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-[#142B4A] text-white hover:bg-[#243F64] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>{submitting ? 'Registering...' : 'Create Visitor Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Institutional Portal Switch */}
          <div className="mt-8 pt-6 border-t border-[#DCE3EC] text-center">
            <p className="text-xs text-[#526175]">
              Are you an institutional student, faculty, or admin?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#142B4A] hover:underline"
            >
              <span>Go to Institutional Portal Log In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
