import { HiOutlineSpeakerWave, HiOutlineSparkles, HiOutlineDocumentText } from 'react-icons/hi2';
import BentoCard from './BentoCard';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AnswerCard({ answer, keywords, matchedNote, mode = 'classic', onSpeak }) {
  // Render Markdown safely, especially for tables and formatted text
  const renderAnswer = (text) => {
    if (!text) return null;
    return (
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <BentoCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <HiOutlineSparkles className="text-slate-900 text-sm" />
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {mode === 'smart' ? 'Smart AI Answer' : 'Classic AI Answer'}
          </span>
        </div>
        {onSpeak && (
          <button
            onClick={() => onSpeak(answer)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-emerald-500/10 transition-all"
            title="Read aloud"
          >
            <HiOutlineSpeakerWave className="text-lg" />
          </button>
        )}
      </div>

      {/* Answer */}
      <div className="text-slate-700 leading-relaxed text-[15px] mb-4">
        {renderAnswer(answer)}
      </div>

      {/* Matched Note Info */}
      {matchedNote && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-900/5">
          <HiOutlineDocumentText className="text-slate-900 text-sm" />
          <span className="text-xs text-slate-500">
            Source: <span className="text-slate-900 font-medium">{matchedNote.title}</span>
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
              className="px-2 py-0.5 rounded-md text-xs bg-emerald-500/10 text-slate-900 border border-emerald-500/20"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </BentoCard>
  );
}
