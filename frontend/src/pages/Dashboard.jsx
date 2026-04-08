import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlusCircle, HiOutlineDocumentText, HiOutlineArchiveBox } from 'react-icons/hi2';
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <HiOutlineDocumentText className="text-purple-400" />
              My Notes
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your brain
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 self-start"
          >
            <HiOutlinePlusCircle className="text-lg" />
            Add Note
          </button>
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
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {search ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              {search
                ? `No results for "${search}". Try a different query.`
                : 'Start building your knowledge base by adding your first note.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
              >
                <HiOutlinePlusCircle className="text-lg" />
                Add Your First Note
              </button>
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
