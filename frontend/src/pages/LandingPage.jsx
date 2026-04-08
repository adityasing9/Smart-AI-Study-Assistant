import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMicrophone,
  HiOutlineArrowRight,
  HiOutlineBolt,
  HiOutlineShieldCheck,
  HiOutlineCpuChip,
} from 'react-icons/hi2';

const features = [
  {
    icon: HiOutlineDocumentText,
    title: 'Smart Notes',
    desc: 'Organize your study material with tagged, searchable notes that your AI can reference.',
    color: 'from-purple-500 to-blue-500',
    glow: 'shadow-purple-500/20',
  },
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: 'AI Answers',
    desc: 'Ask questions in natural language and get intelligent answers pulled from your notes.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: HiOutlineMicrophone,
    title: 'Voice Assistant',
    desc: 'Speak your questions and hear answers read back to you — hands-free studying.',
    color: 'from-cyan-500 to-emerald-500',
    glow: 'shadow-cyan-500/20',
  },
];

const stats = [
  { icon: HiOutlineBolt, label: 'Instant Answers', value: '<1s' },
  { icon: HiOutlineShieldCheck, label: 'Private & Local', value: '100%' },
  { icon: HiOutlineCpuChip, label: 'Smart Matching', value: 'AI' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Ambient glow */}
      <div className="ambient-bg" />

      {/* ───────── Hero ───────── */}
      <section className="relative px-6 pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs sm:text-sm mb-6"
          >
            <HiOutlineSparkles className="text-purple-400 text-sm" />
            <span className="text-slate-300">AI-Powered Study Assistant</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-tight"
          >
            Your AI{' '}
            <span className="gradient-text">Study Brain</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Add notes, ask questions via text or voice, and let AI find the perfect answers
            from your study material — instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap"
          >
            <Link
              to="/dashboard"
              className="group px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold text-white gradient-bg hover:opacity-90 transition-all shadow-xl shadow-purple-500/25 flex items-center gap-2"
            >
              Get Started
              <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/ask"
              className="px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold text-slate-300 glass hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <HiOutlineMicrophone />
              Try Voice
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───────── Stats ───────── */}
      <section className="px-6 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-2xl p-5 sm:p-6 grid grid-cols-3 gap-4"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="mx-auto text-xl sm:text-2xl text-purple-400 mb-2" />
                <div className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section className="px-6 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Everything you need to{' '}
              <span className="gradient-text">study smarter</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
              Powerful features designed to make studying efficient and enjoyable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 sm:p-8 text-center group"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-xl ${feat.glow} group-hover:scale-110 transition-transform`}
                >
                  <feat.icon className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA Bottom ───────── */}
      <section className="px-6 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-10 text-center gradient-border rounded-2xl"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Ready to boost your studies?
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Start adding notes and let AI handle the rest.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-all shadow-xl shadow-purple-500/25"
            >
              Launch Study Brain
              <HiOutlineArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="px-6 py-6 sm:py-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 StudyBrain. Built with AI.</span>
          <span>Made with 💜</span>
        </div>
      </footer>
    </div>
  );
}
