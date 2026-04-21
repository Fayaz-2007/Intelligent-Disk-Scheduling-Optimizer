import { motion } from 'framer-motion';
import { ChevronDown, Cpu, Zap, Brain } from 'lucide-react';

export default function HeroSection() {
  const scrollToInput = () => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', zIndex: 1 }}>
      {/* Grid bg */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
      {/* Radial glow center */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ position: 'relative', zIndex: 1, maxWidth: '780px', width: '100%' }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '99px', marginBottom: '36px', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          <Brain size={13} color="#00d4ff" />
          <span style={{ fontSize: '0.68rem', color: '#00d4ff', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>AI-Powered Disk Intelligence</span>
          <Zap size={13} color="#a78bfa" />
        </motion.div>

        {/* Title */}
        <h1 style={{
          fontWeight: 900,
          fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: '22px',
          background: 'linear-gradient(135deg,#00d4ff 0%,#a78bfa 45%,#00d4ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% auto',
          animation: 'gradientShift 4s linear infinite',
        }}>
          Intelligent Disk<br />Scheduling Optimizer
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{ color: '#64748b', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.7, marginBottom: '44px', maxWidth: '520px', margin: '0 auto 44px' }}
        >
          Neural network–powered algorithm selection for maximum I/O efficiency.
          Analyse, compare, and visualise all scheduling strategies in real time.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '44px' }}
        >
          {[{ val: '6', lbl: 'Algorithms' }, { val: 'brain.js', lbl: 'ML Engine' }, { val: 'Real-time', lbl: 'Visualisation' }].map(s => (
            <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', padding: '12px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00d4ff' }}>{s.val}</div>
              <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px' }}>{s.lbl}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(0,212,255,0.5)' }}
          whileTap={{ scale: 0.97 }}
          onClick={scrollToInput}
          style={{ padding: '14px 40px', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', color: '#000', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', boxShadow: '0 0 24px rgba(0,212,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          Start Optimizer <ChevronDown size={18} />
        </motion.button>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ position: 'absolute', bottom: '28px', color: '#334155' }}
      >
        <ChevronDown size={22} />
      </motion.div>
    </section>
  );
}
