import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlusCircle, HiOutlineDocumentText, HiOutlineArchiveBox, HiOutlineArrowUpTray } from 'react-icons/hi2';
import { api } from '../utils/api';
import NoteCard from '../components/NoteCard';
import AddNoteModal from '../components/AddNoteModal';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchNotes = useCallback(async () => {
    try {
      const data = await api.getNotes(search);
      setNotes(data.notes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch notes');
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(fetchNotes, 300);
    return () => clearTimeout(debounce);
  }, [fetchNotes]);

  const handleAdd = async (noteData) => {
    try {
      await api.addNote(noteData);
      toast.success('Note added!');
      fetchNotes();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNote(id);
      toast.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadDocument(file);
      toast.success(result.message);
      fetchNotes();
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    }
    setUploading(false);
    // Reset file input so the same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 px-4 sm:px-6 pb-12">
      <div className="ambient-bg" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <HiOutlineDocumentText className="text-emerald-600" />
              My Notes
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your brain
            </p>
          </div>
          <div className="flex items-center gap-3 self-start">
            {/* Document Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleDocumentUpload}
              className="hidden"
              id="document-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 glass hover:bg-slate-900/5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <HiOutlineArrowUpTray className="text-lg" />
                  Upload Document
                </>
              )}
            </button>
            {/* Add Note Button */}
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <HiOutlinePlusCircle className="text-lg" />
              Add Note
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-8 max-w-sm">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-6">
              <HiOutlineArchiveBox className="text-3xl text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {search ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              {search
                ? `No results for "${search}". Try a different query.`
                : 'Start building your knowledge base by adding your first note or uploading a document (PDF, Word, Excel, Images).'}
            </p>
            {!search && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 glass hover:bg-slate-900/5 transition-all flex items-center gap-2 border border-slate-200"
                >
                  <HiOutlineArrowUpTray className="text-lg" />
                  Upload Document
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <HiOutlinePlusCircle className="text-lg" />
                  Add Your First Note
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {notes.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={i}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal */}
        <AddNoteModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      </div>
    </div>
  );
}
