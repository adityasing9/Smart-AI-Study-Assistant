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
          ? 'gradient-bg text-white shadow-lg shadow-purple-500/30 mic-pulse'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5'
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
