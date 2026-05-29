import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineClock,
  HiOutlinePhoto,
  HiXMark
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
  const [mode, setMode] = useState('smart'); // Default to Smart AI
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [pastedImage, setPastedImage] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const { isListening, transcript, isSupported, startListening, stopListening, speak } = useVoice();

  // Load history and documents on mount
  useEffect(() => {
    api.getHistory().then((data) => setHistory(data.history)).catch(() => {});
    api.getDocuments().then((data) => setDocuments(data.documents || [])).catch(() => {});
  }, []);

  // Update question when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPastedImage(ev.target.result);
          setMode('smart'); // Auto-switch to smart mode
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPastedImage(ev.target.result);
        setMode('smart'); // Auto-switch to smart mode
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAsk = async (q = question) => {
    const text = q.trim();
    if (!text && !pastedImage) return;
    setLoading(true);
    setResult(null);
    try {
      const currentMode = pastedImage ? 'smart' : mode;
      const data = await api.askQuestion(text, currentMode, selectedDocId || null, pastedImage);
      setResult(data);
      setPastedImage(null); // Clear image after success
      // Refresh history
      api.getHistory().then((h) => setHistory(h.history)).catch(() => {});
      setTimeout(scrollToBottom, 100);
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
    <div className="min-h-screen pt-24 sm:pt-28 px-4 sm:px-6 flex flex-col relative pb-40">
      <div className="ambient-bg" />
      
      <div className="max-w-3xl mx-auto w-full flex-1 relative z-10 flex flex-col">
        
        {/* Header / Empty State */}
        <AnimatePresence>
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mt-10 sm:mt-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4 text-xs sm:text-sm">
                <HiOutlineSparkles className="text-slate-900" />
                <span className="text-slate-700">AI-Powered Answers</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3">
                Ask Your <span className="gradient-text">Study Brain</span>
              </h1>
              <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                Type or speak your question — AI will search your notes for the best answer.
              </p>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {loading && <LoadingSpinner text="Searching your notes..." />}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-4"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {!result && history.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 max-w-2xl mx-auto w-full"
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-center w-full gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6"
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
                  className="space-y-3 overflow-hidden"
                >
                  {history.slice(0, 10).map((h, i) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-900/5 border border-slate-900/10"
                      onClick={() => {
                        setQuestion(h.question);
                        handleAsk(h.question);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 font-medium truncate mb-1">{h.question}</p>
                        <p className="text-xs text-slate-500 truncate">{h.answer}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap pt-0.5">
                        {new Date(h.asked_at).toLocaleDateString()}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        
        <div ref={bottomRef} className="h-10" />
      </div>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-white via-white/90 to-transparent z-50 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 sm:p-4 shadow-2xl shadow-emerald-500/10 gradient-border rounded-2xl bg-white/80 backdrop-blur-xl"
          >
            {/* Mode & Document Scope Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-900/5">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium transition-colors ${mode === 'classic' ? 'text-slate-900' : 'text-slate-400'}`}>Classic</span>
                <button
                  onClick={() => setMode(m => m === 'classic' ? 'smart' : 'classic')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white ${mode === 'smart' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className="sr-only">Toggle AI Mode</span>
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${mode === 'smart' ? 'translate-x-4.5' : 'translate-x-1'}`}
                    style={{ transform: mode === 'smart' ? 'translateX(1.125rem)' : 'translateX(0.25rem)' }}
                  />
                </button>
                <span className={`text-xs font-medium transition-colors ${mode === 'smart' ? 'text-slate-900' : 'text-slate-400'}`}>Smart AI</span>
              </div>
              
              {documents.length > 0 && (
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-700"
                >
                  <option value="">Search all notes</option>
                  {documents.map((doc) => (
                    <option key={doc.document_id} value={doc.document_id}>
                      In: {doc.document_title.length > 25 ? doc.document_title.substring(0, 25) + '...' : doc.document_title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* Image Preview */}
              <AnimatePresence>
                {pastedImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative self-start"
                  >
                    <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/30">
                      <img src={pastedImage} alt="Pasted" className="h-24 w-auto object-cover" />
                      <button
                        onClick={() => setPastedImage(null)}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                      >
                        <HiXMark className="text-sm" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={pastedImage ? "Ask about this image..." : "Message AI Study Brain..."}
                    rows={1}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/5 border border-slate-900/10 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all resize-none text-sm sm:text-[15px]"
                    style={{ minHeight: '52px', maxHeight: '150px' }}
                  />
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-6 left-2 flex items-center gap-1.5 text-xs text-slate-900 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Listening...
                  </motion.div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-all flex items-center justify-center"
                  title="Attach Image"
                >
                  <HiOutlinePhoto className="text-xl" />
                </button>
                <VoiceButton
                  isListening={isListening}
                  onClick={handleVoiceToggle}
                  isSupported={isSupported}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAsk()}
                  disabled={loading || (!question.trim() && !pastedImage)}
                  className="p-3.5 rounded-xl gradient-bg text-slate-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center"
                >
                  <HiOutlinePaperAirplane className="text-xl" />
                </motion.button>
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
