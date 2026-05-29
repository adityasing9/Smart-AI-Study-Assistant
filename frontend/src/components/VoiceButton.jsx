import { motion } from 'framer-motion';
import { HiOutlineMicrophone, HiOutlineStop } from 'react-icons/hi2';

export default function VoiceButton({ isListening, onClick, isSupported = true }) {
  if (!isSupported) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative p-3.5 rounded-xl transition-all ${
        isListening
          ? 'gradient-bg text-slate-900 shadow-lg shadow-emerald-500/30 mic-pulse'
          : 'bg-slate-900/5 border border-slate-900/10 text-slate-600 hover:text-slate-900 hover:border-emerald-500/30 hover:bg-emerald-500/5'
      }`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? (
        <HiOutlineStop className="text-xl" />
      ) : (
        <HiOutlineMicrophone className="text-xl" />
      )}
    </motion.button>
  );
}
