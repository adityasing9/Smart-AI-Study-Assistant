import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = 'Thinking...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-4"
    >
      {/* Brain animation */}
      <div className="relative w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-blue-500"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-500 border-l-emerald-500"
        />
        <div className="absolute inset-4 rounded-full gradient-bg flex items-center justify-center">
          <span className="text-lg">🧠</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-slate-700">{text}</span>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </motion.div>
  );
}
