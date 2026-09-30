import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MitraLogo } from '../../components/common/MitraLogo';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/user';
import { loginSchema } from '../../utils/validation';
import { Lock, Mail, Shield, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, setUserProfile } = useAuth();

  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const target = user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';
      navigate(target, { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Quick fill helper for testing/demo credentials
  const fillDemoAccount = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'student') {
      setEmail('aarav.vibe@vit.edu.in');
      setPassword('password123');
    } else {
      setEmail('faculty@vit.edu.in');
      setPassword('password123');
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate using Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Please check your inputs.');
      return;
    }

    setLoading(true);
    try {
      const userProfile = await loginUser(email, password, activeRole);
      setUserProfile(userProfile);

      // Redirect based on actual authoritative user role from Firestore
      if (userProfile.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Background Subtle Mesh Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <MitraLogo size="lg" showSubtitle={true} />
          <h1 className="text-xl font-bold tracking-tight mt-6 text-zinc-100">
            MitraPulse Portal
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            VIT Mitra Daily Attendance Management
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 shadow-2xl backdrop-blur-sm">
          {/* Role Switcher (UI convenience only) */}
          <div className="flex bg-[#181818] p-1 rounded-lg mb-6 border border-[#262626]">
            <button
              type="button"
              onClick={() => {
                setActiveRole('student');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                activeRole === 'student'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('faculty');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                activeRole === 'faculty'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Faculty Login
            </button>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                {activeRole === 'faculty' ? 'Faculty Identifier / Email' : 'Student Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeRole === 'faculty' ? 'faculty@vit.edu.in' : 'student@vit.edu.in'
                  }
                  required
                  className="w-full bg-[#181818] border border-[#262626] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-zinc-300 font-mono">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#181818] border border-[#262626] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeRole === 'faculty' ? 'Faculty' : 'Student'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Links for Testing */}
          <div className="mt-6 pt-4 border-t border-[#262626] flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-mono text-[10px]">Test Quick Fill:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('student')}
                className="px-2 py-1 bg-[#181818] hover:bg-[#262626] rounded text-blue-400 font-mono text-[10px] transition-colors border border-[#262626]"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('faculty')}
                className="px-2 py-1 bg-[#181818] hover:bg-[#262626] rounded text-blue-400 font-mono text-[10px] transition-colors border border-[#262626]"
              >
                Faculty Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-zinc-500 text-center mt-6 font-mono">
          VIT Mitra Attendance System • Internal Portal Access Only
        </p>
      </div>
    </div>
  );
};
