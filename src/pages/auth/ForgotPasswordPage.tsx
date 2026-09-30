import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MitraLogo } from '../../components/common/MitraLogo';
import { resetPassword } from '../../services/authService';
import { forgotPasswordSchema } from '../../utils/validation';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Invalid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-8 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <MitraLogo size="md" showSubtitle={true} />
          <h1 className="text-xl font-bold tracking-tight mt-6 text-zinc-100">
            Reset Password
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Enter your email to receive password reset instructions
          </p>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 shadow-2xl">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-green-950/60 border border-green-800 rounded-full flex items-center justify-center mx-auto text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Reset Link Sent</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  We have sent instructions to <span className="text-blue-400 font-mono">{email}</span>. Please check your inbox.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@vit.edu.in"
                    required
                    className="w-full bg-[#181818] border border-[#262626] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
