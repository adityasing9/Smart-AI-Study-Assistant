import { Link } from 'react-router-dom';
import BentoCard from '../components/BentoCard';
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
    color: 'from-emerald-500 to-amber-500',
    glow: 'shadow-emerald-500/20',
    image: '/feature-notes.jpg',
  },
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: 'AI Answers',
    desc: 'Ask questions in natural language and get intelligent answers pulled from your notes.',
    color: 'from-amber-500 to-emerald-500',
    glow: 'shadow-emerald-500/20',
    image: '/feature-ai.jpg',
  },
  {
    icon: HiOutlineMicrophone,
    title: 'Voice Assistant',
    desc: 'Speak your questions and hear answers read back to you — hands-free studying.',
    color: 'from-emerald-400 to-amber-400',
    glow: 'shadow-emerald-500/20',
    image: '/feature-voice.jpg',
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
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left - Text */}
            <div className="text-center md:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs sm:text-sm mb-6"
              >
                <HiOutlineSparkles className="text-emerald-600 text-sm" />
                <span className="text-slate-700">AI-Powered Study Assistant</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-tight"
              >
                Your{' '}
                <span className="gradient-text">Smart AI Study Assistant</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed"
              >
                Add notes, ask questions via text or voice, and let AI find the perfect answers
                from your study material — instantly.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center md:justify-start"
              >
                <Link
                  to="/login"
                  className="group px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold text-white gradient-bg hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                >
                  Get Started
                  <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold text-slate-700 glass hover:bg-slate-900/5 transition-all flex items-center gap-2"
                >
                  <HiOutlineMicrophone />
                  Try Voice
                </Link>
              </motion.div>
            </div>

            {/* Right - Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/80">
                <img
                  src="/hero-study.jpg"
                  alt="Students collaborating and studying together"
                  className="w-full h-[320px] sm:h-[400px] object-cover"
                />
              </div>
              {/* Decorative floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 glass-card px-4 py-2 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700">AI Ready</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
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
                <stat.icon className="mx-auto text-xl sm:text-2xl text-emerald-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section className="px-6 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
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
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
              Powerful features designed to make studying efficient and enjoyable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:auto-rows-[280px]">
            {features.map((feat, i) => (
              <BentoCard
                key={i}
                delay={i * 0.15}
                className={`group overflow-hidden ${i === 0 ? 'md:col-span-2 md:row-span-1' : (i === 1 ? 'md:col-span-1 md:row-span-2' : 'md:col-span-2 md:row-span-1')}`}
              >
                <div className="flex flex-col h-full relative">
                  {/* Background image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={feat.image}
                      alt={feat.title}
                      className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  {/* Content */}
                  <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 shadow-xl ${feat.glow} group-hover:scale-110 group-hover:-rotate-3 transition-transform`}
                    >
                      <feat.icon className="text-white text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 mt-auto">{feat.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-sm">{feat.desc}</p>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA Bottom ───────── */}
      <section className="px-6 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl overflow-hidden gradient-border"
          >
            <div className="grid md:grid-cols-2 items-center">
              {/* Image */}
              <div className="h-[200px] md:h-full">
                <img
                  src="/cta-study.jpg"
                  alt="Person studying with laptop"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Text */}
              <div className="p-8 sm:p-10 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl font-bold mb-3">
                  Ready to boost your studies?
                </h2>
                <p className="text-sm text-slate-600 mb-6">
                  Start adding notes and let AI handle the rest. Your personal study assistant is waiting.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Launch Study Brain
                  <HiOutlineArrowRight />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="px-6 py-6 sm:py-8 border-t border-slate-900/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 Smart AI Study Assistant</span>
          <span></span>
        </div>
      </footer>
    </div>
  );
}
