import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(Boolean(tokenFromUrl));
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devResetLink, setDevResetLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setSubmitted(true);
    }
  }, [tokenFromUrl]);

  // Step 1: Request Reset Link
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setSubmitted(true);
        if (res.data.devResetToken) {
          const rawToken = res.data.devResetToken;
          setToken(rawToken);
          const fullLink = `${window.location.origin}/reset-password?token=${rawToken}`;
          setDevResetLink(fullLink);
        }
      }
    } catch (err) {
      // Security: Do not expose internal details
      setError(err.response?.data?.message || 'Failed to submit password recovery request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('A valid password reset token or link is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword
      });
      if (res.data.success) {
        setResetCompleted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired password reset link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!devResetLink) return;
    navigator.clipboard.writeText(devResetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-[#142B4A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#243F64] transition">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-[#0F172A] tracking-tight">
            Campus<span className="text-[#142B4A]">Folio</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Account Password Recovery
        </h2>
        <p className="mt-1 text-sm text-[#526175]">
          Secure password recovery for Student, Staff, and Administrator accounts
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-8 px-6 shadow-[0_2px_12px_rgba(20,43,74,0.06)] border border-[#DCE3EC] rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222] text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Step 1: Request Password Reset */}
          {!submitted ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Registered Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 text-[#526175] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu or staff@college.edu"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#0F172A] placeholder-[#526175]/60 focus:outline-hidden focus:border-[#142B4A] focus:ring-2 focus:ring-[#142B4A]/15 transition"
                  />
                </div>
                <p className="text-xs text-[#526175] mt-1.5 leading-relaxed">
                  Enter your registered institutional email address. If an account is associated with this address, a secure, single-use password reset link will be generated.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Generating Reset Link...' : 'Send Recovery Instructions'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : !resetCompleted ? (
            /* Form Step 2: Set New Password */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#EBF7EE] border border-[#BCE6C9] text-[#166534] text-xs leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="font-semibold block text-emerald-900">Recovery Instructions Active</span>
                  If an account matches your email, password recovery instructions are active. Enter and confirm your new password below.
                </div>
              </div>

              {/* Dev mode helper card with full URL link */}
              {devResetLink && (
                <div className="p-3 rounded-xl bg-[#E9EFF6] border border-[#B9C9DD] text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#142B4A] font-bold">
                    <span>Generated Password Reset Link:</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 text-xs bg-white px-2 py-0.5 rounded border border-[#B9C9DD] hover:bg-[#F4F6F9] transition cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedLink ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-[#243F64] break-all bg-white p-2 rounded border border-[#DCE3EC]">
                    {devResetLink}
                  </div>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter security reset token"
                    className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4.5 h-4.5 text-[#526175] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#526175] hover:text-[#0F172A] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4.5 h-4.5 text-[#526175] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          ) : (
            /* Step 3: Success Confirmation */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#EBF7EE] text-[#166534] flex items-center justify-center mx-auto border border-[#BCE6C9]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl text-[#0F172A]">Password Successfully Updated</h3>
              <p className="text-sm text-[#526175] leading-relaxed">
                Your password has been securely updated. The reset token has been invalidated. You can now log in using your new credentials.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-bold uppercase tracking-wider transition shadow-xs"
              >
                Proceed to Login
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#DCE3EC] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#526175] hover:text-[#142B4A] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
