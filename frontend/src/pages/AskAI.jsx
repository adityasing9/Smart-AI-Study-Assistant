import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineClock,
} from 'react-icons/hi2';
import { api } from '../utils/api';
import { useVoice } from '../hooks/useVoice';
import VoiceButton from '../components/VoiceButton';
import AnswerCard from '../components/AnswerCard';
import SuggestedNotes from '../components/SuggestedNotes';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AskAI() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useState('classic');

  const { isListening, transcript, isSupported, startListening, stopListening, speak } = useVoice();

  // Load history on mount
  useEffect(() => {
    api.getHistory().then((data) => setHistory(data.history)).catch(() => {});
  }, []);

  // Update question when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
    }
  }, [transcript]);

  const handleAsk = async (q = question) => {
    const text = q.trim();
    if (!text) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.askQuestion(text, mode);
      setResult(data);
      // Refresh history
      api.getHistory().then((h) => setHistory(h.history)).catch(() => {});
    } catch (err) {
      toast.error(err.message || 'Failed to get answer');
    }
    setLoading(false);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setTimeout(() => {
        if (question.trim()) handleAsk();
      }, 300);
    } else {
      startListening((finalText) => {
        setQuestion(finalText);
        setTimeout(() => handleAsk(finalText), 200);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 px-4 sm:px-6 pb-12">
      <div className="ambient-bg" />
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4 text-xs sm:text-sm">
            <HiOutlineSparkles className="text-purple-400" />
            <span className="text-slate-300">AI-Powered Answers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Ask Your <span className="gradient-text">Study Brain</span>
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            Type or speak your question — AI will search your notes for the best answer.
          </p>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium transition-colors ${mode === 'classic' ? 'text-white' : 'text-slate-500'}`}>Classic Mode</span>
            <button
              onClick={() => setMode(m => m === 'classic' ? 'smart' : 'classic')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#050510] ${mode === 'smart' ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              <span className="sr-only">Toggle AI Mode</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mode === 'smart' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${mode === 'smart' ? 'text-purple-400' : 'text-slate-500'}`}>Smart AI</span>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 sm:p-5 mb-8 gradient-border rounded-2xl"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your study notes..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all resize-none text-sm sm:text-[15px]"
              />
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-2 right-3 flex items-center gap-1.5 text-xs text-purple-400"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Listening...
                </motion.div>
              )}
            </div>
            <div className="flex gap-2">
              <VoiceButton
                isListening={isListening}
                onClick={handleVoiceToggle}
                isSupported={isSupported}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="p-3.5 rounded-xl gradient-bg text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
              >
                <HiOutlinePaperAirplane className="text-xl" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {loading && <LoadingSpinner text="Searching your notes..." />}
        </AnimatePresence>

        {/* Answer */}
        <AnimatePresence>
          {result && !loading && (
            <div className="space-y-6">
              <AnswerCard
                answer={result.answer}
                keywords={result.keywords}
                matchedNote={result.matched_note}
                mode={result.mode}
                onSpeak={speak}
              />
              <SuggestedNotes
                notes={result.related_notes}
                title="Related Notes"
              />
            </div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              <HiOutlineClock />
              {showHistory ? 'Hide' : 'Show'} Question History ({history.length})
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {history.slice(0, 10).map((h, i) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-white/5"
                      onClick={() => {
                        setQuestion(h.question);
                        handleAsk(h.question);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{h.question}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{h.answer}</p>
                      </div>
                      <span className="text-xs text-slate-600 whitespace-nowrap">
                        {new Date(h.asked_at).toLocaleDateString()}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
