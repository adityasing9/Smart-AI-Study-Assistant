import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSparkles } from 'react-icons/hi2';

export default function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <HiOutlineSparkles className="text-slate-900 text-base" />
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Smart AI <span className="gradient-text"> Study Assistant</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isLanding && (
            <>
              <NavLink to="/dashboard" current={location.pathname}>Dashboard</NavLink>
              <NavLink to="/ask" current={location.pathname}>Ask AI</NavLink>
            </>
          )}
          {isLanding && (
            <Link
              to="/dashboard"
              className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 gradient-bg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, current, children }) {
  const isActive = current === to;
  return (
    <Link
      to={to}
      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${isActive
        ? 'gradient-bg text-slate-900 shadow-lg shadow-emerald-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5'
        }`}
    >
      {children}
    </Link>
  );
}
