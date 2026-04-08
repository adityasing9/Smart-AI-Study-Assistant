import { motion } from 'framer-motion';
import { HiOutlineSpeakerWave, HiOutlineSparkles, HiOutlineDocumentText } from 'react-icons/hi2';

export default function AnswerCard({ answer, keywords, matchedNote, mode = 'classic', onSpeak }) {
  // Parse answer: replace **word** with highlighted spans
  const renderAnswer = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const word = part.slice(2, -2);
        return (
          <span key={i} className="keyword-highlight">
            {word}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="glass-card p-6 gradient-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <HiOutlineSparkles className="text-white text-sm" />
          </div>
          <span className="text-sm font-semibold text-white">
            {mode === 'smart' ? 'Smart AI Answer' : 'Classic AI Answer'}
          </span>
        </div>
        {onSpeak && (
          <button
            onClick={() => onSpeak(answer)}
            className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
            title="Read aloud"
          >
            <HiOutlineSpeakerWave className="text-lg" />
          </button>
        )}
      </div>

      {/* Answer */}
      <div className="text-slate-300 leading-relaxed text-[15px] mb-4">
        {renderAnswer(answer)}
      </div>

      {/* Matched Note Info */}
      {matchedNote && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <HiOutlineDocumentText className="text-purple-400 text-sm" />
          <span className="text-xs text-slate-500">
            Source: <span className="text-purple-400 font-medium">{matchedNote.title}</span>
          </span>
        </div>
      )}

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-slate-500">Keywords:</span>
          {keywords.map((kw) => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded-md text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
