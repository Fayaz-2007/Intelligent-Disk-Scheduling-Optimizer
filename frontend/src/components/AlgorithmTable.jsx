import { motion } from 'framer-motion';
import { Trophy, Check } from 'lucide-react';

export default function AlgorithmTable({ results }) {
  if (!results || results.length === 0) return null;
  const minMove = Math.min(...results.map(r => r.totalMovement));
  const maxMove = Math.max(...results.map(r => r.totalMovement));
  const range   = maxMove - minMove || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden' }}
    >
      {/* Table head */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 220px 120px', padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['Algorithm', 'Seek Sequence', 'Total Head Movement', 'Status'].map(h => (
          <span key={h} style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', fontWeight: 600 }}>{h}</span>
        ))}
      </div>

      {results.map((r, i) => {
        const isBest = r.totalMovement === minMove;
        const barPct = Math.max(((maxMove - r.totalMovement) / range) * 88 + 12, 8);

        return (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 220px 120px',
              padding: '16px 28px',
              alignItems: 'center',
              borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: isBest ? 'rgba(0,212,255,0.04)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!isBest) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
            onMouseLeave={e => { if (!isBest) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isBest ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)' }}>
                {isBest
                  ? <Trophy size={13} color="#00d4ff" />
                  : <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 700 }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isBest ? '#00d4ff' : '#e2e8f0' }}>{r.name}</span>
            </div>

            {/* Seek sequence pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {r.sequence.slice(0, 8).map((s, idx) => (
                <span key={idx} style={{
                  fontSize: '0.7rem', padding: '2px 7px', borderRadius: '6px', fontFamily: 'monospace',
                  background: idx === 0 ? 'rgba(124,58,237,0.22)' : 'rgba(255,255,255,0.05)',
                  color: idx === 0 ? '#c4b5fd' : '#475569',
                  border: idx === 0 ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                }}>
                  {s}
                </span>
              ))}
              {r.sequence.length > 8 && (
                <span style={{ fontSize: '0.68rem', color: '#334155', alignSelf: 'center' }}>+{r.sequence.length - 8}</span>
              )}
            </div>

            {/* Bar + number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '7px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.85, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: '100%', borderRadius: '99px',
                    background: isBest ? 'linear-gradient(90deg,#00d4ff,#7c3aed)' : 'rgba(100,116,139,0.4)',
                    boxShadow: isBest ? '0 0 8px rgba(0,212,255,0.5)' : 'none',
                  }}
                />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: isBest ? '#00d4ff' : '#94a3b8', width: '40px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {r.totalMovement}
              </span>
            </div>

            {/* Status */}
            <div>
              {isBest
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: '#00d4ff', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.28)' }}>
                    <Check size={11} /> Best
                  </span>
                : <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
                    +{r.totalMovement - minMove}
                  </span>
              }
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
