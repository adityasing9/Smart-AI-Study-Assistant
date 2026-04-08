import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineClock, HiOutlineTag } from 'react-icons/hi2';

export default function NoteCard({ note, onDelete, index = 0 }) {
  const date = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass-card p-6 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
          {note.title}
        </h3>
        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
            title="Delete note"
          >
            <HiOutlineTrash className="text-lg" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
        {note.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <HiOutlineClock className="text-sm" />
          {date}
        </div>
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >
                <HiOutlineTag className="text-[10px]" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
