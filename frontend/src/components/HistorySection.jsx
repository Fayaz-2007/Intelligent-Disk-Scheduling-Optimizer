import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';

function timeAgo(iso) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

const ALGO_COLOR = { FCFS: '#00d4ff', SSTF: '#a78bfa', SCAN: '#34d399', 'C-SCAN': '#fb923c', LOOK: '#f472b6', 'C-LOOK': '#facc15' };

export default function HistorySection({ history, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden' }}
    >
      {/* Header row */}
      <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={15} color="#00d4ff" />
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
            {history.length > 0 ? `${history.length} past runs` : 'No runs yet'}
          </span>
        </div>
        {history.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClear}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#f87171', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
          >
            <Trash2 size={13} /> Clear
          </motion.button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ padding: '52px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#334155' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)' }}>
            <Clock size={22} style={{ opacity: 0.4 }} />
          </div>
          <p style={{ color: '#475569', fontSize: '0.85rem' }}>Run the optimizer to see history here</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px 150px 100px', padding: '11px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Time', 'Requests', 'Head', 'Best Algorithm', 'Seek Time'].map(h => (
              <span key={h} style={{ fontSize: '0.61rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#475569', fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          <AnimatePresence>
            {history.map((row, i) => {
              const color = ALGO_COLOR[row.best_algorithm] || '#00d4ff';
              return (
                <motion.div
                  key={row.id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px 150px 100px', padding: '13px 28px', alignItems: 'center', borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: '#475569', fontSize: '0.75rem' }}>{timeAgo(row.created_at)}</span>
                  <span style={{ color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '16px' }}>{row.requests}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>{row.head_position}</span>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}30` }}>
                      {row.best_algorithm}
                    </span>
                  </div>
                  <span style={{ color: '#34d399', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{row.seek_time}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
