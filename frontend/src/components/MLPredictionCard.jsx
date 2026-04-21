import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, CheckCircle, Cpu } from 'lucide-react';

const ALGO_COLORS = {
  FCFS: '#00d4ff', SSTF: '#a78bfa', SCAN: '#34d399',
  'C-SCAN': '#fb923c', LOOK: '#f472b6', 'C-LOOK': '#facc15',
};

export default function MLPredictionCard({ recommendation }) {
  if (!recommendation) return null;
  const { algo, confidence, reason, probabilities } = recommendation;
  const mainColor = ALGO_COLORS[algo] || '#00d4ff';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: 0.08 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: '18px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.18),transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,255,0.1),transparent 70%)' }} />
      </div>

      {/* Header */}
      <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5 }}
            style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(0,212,255,0.15))', flexShrink: 0 }}
          >
            <Brain size={17} color="#c084fc" />
          </motion.div>
          <div>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#475569', fontWeight: 600 }}>Pure-JS Neural Network · {recommendation.architecture || '6→12→8→6'}</p>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>ML Algorithm Classifier</p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 250, delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '99px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', flexShrink: 0 }}
        >
          <TrendingUp size={12} color="#00d4ff" />
          <span style={{ color: '#00d4ff', fontWeight: 700, fontSize: '0.88rem' }}>{confidence}%</span>
          <span style={{ color: '#475569', fontSize: '0.72rem' }}>conf.</span>
        </motion.div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 28px 24px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Winner */}
        <div>
          <p style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '6px' }}>Best Algorithm for this Workload</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <span style={{
              fontWeight: 900,
              lineHeight: 1,
              fontSize: 'clamp(2.2rem, 4vw, 3rem)',
              background: `linear-gradient(135deg,${mainColor},#a78bfa)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'gradientShift 3s linear infinite',
            }}>
              {algo}
            </span>
            <Sparkles size={18} color="#facc15" style={{ marginBottom: '6px' }} />
          </div>
        </div>

        {/* Reason */}
        <div style={{ borderRadius: '12px', padding: '12px 14px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckCircle size={14} color="#22d3ee" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.55' }}>{reason}</p>
          </div>
        </div>

        {/* Probability bars for all algorithms */}
        {probabilities && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} color="#475569" />
                <p style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#475569', fontWeight: 600 }}>Neural Network Output Probabilities</p>
              </div>
              {recommendation.trainedSamples && (
                <span style={{ fontSize: '0.65rem', color: '#334155', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {recommendation.trainedSamples} training samples
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {probabilities.map(({ algo: a, prob }, i) => {
                const c = ALGO_COLORS[a] || '#00d4ff';
                const pct = Math.round(prob * 100);
                return (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '52px', fontSize: '0.72rem', fontWeight: 700, color: a === algo ? c : '#475569', textAlign: 'right', flexShrink: 0 }}>{a}</span>
                    <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 1)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          height: '100%', borderRadius: '99px',
                          background: a === algo ? `linear-gradient(90deg,${c},#a78bfa)` : `${c}44`,
                          boxShadow: a === algo ? `0 0 8px ${c}88` : 'none',
                        }}
                      />
                    </div>
                    <span style={{ width: '32px', fontSize: '0.72rem', fontWeight: a === algo ? 700 : 400, color: a === algo ? c : '#334155', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
