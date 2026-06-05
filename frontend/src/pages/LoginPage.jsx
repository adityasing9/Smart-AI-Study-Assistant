import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
        toast.success('Account created! Welcome aboard 🎉');
      } else {
        await login(email, password);
        toast.success('Welcome back! 👋');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || (isSignup ? 'Signup failed' : 'Login failed'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
      <div className="ambient-bg" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <HiOutlineSparkles className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Smart AI <span className="gradient-text">Study Assistant</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl gradient-border shadow-2xl shadow-emerald-500/5">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-slate-500">
              {isSignup
                ? 'Start your AI-powered study journey'
                : 'Sign in to access your study brain'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/5 border border-slate-900/10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900/5 border border-slate-900/10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setEmail('');
                  setPassword('');
                }}
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Smart AI Study Assistant
        </p>
      </motion.div>
    </div>
  );
}
