import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineLightBulb } from 'react-icons/hi2';

export default function SuggestedNotes({ notes, title = 'You may also like' }) {
  if (!notes || notes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineLightBulb className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {notes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="glass-card p-4 cursor-pointer group"
          >
            <h4 className="text-sm font-semibold text-white mb-1.5 line-clamp-1 group-hover:text-purple-300 transition-colors">
              {note.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
              {note.content}
            </p>
            <div className="flex items-center gap-1 text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View</span>
              <HiOutlineArrowRight className="text-[10px]" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
