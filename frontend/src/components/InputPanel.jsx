import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, HardDrive, ChevronRight } from 'lucide-react';

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#e2e8f0',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};

export default function InputPanel({ onRun, loading }) {
  const [queue,     setQueue]     = useState('98, 183, 37, 122, 14, 124, 65, 67');
  const [head,      setHead]      = useState('53');
  const [diskSize,  setDiskSize]  = useState('200');
  const [direction, setDirection] = useState('right');
  const [focused,   setFocused]   = useState(null);

  const focusStyle = key => ({
    ...inputStyle,
    borderColor: focused === key ? 'rgba(0,212,255,0.55)' : 'rgba(255,255,255,0.09)',
    boxShadow:   focused === key ? '0 0 0 1px rgba(0,212,255,0.2)' : 'none',
    background:  focused === key ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.04)',
  });

  const label = txt => (
    <p style={{ fontSize: '0.64rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00d4ff', fontWeight: 700, marginBottom: '8px' }}>{txt}</p>
  );

  const handleRun = () => {
    const requests = queue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (!requests.length) return;
    onRun({ requests, head: parseInt(head) || 53, diskSize: parseInt(diskSize) || 200, direction });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.22)', borderRadius: '18px', overflow: 'hidden' }}
    >
      {/* Card header */}
      <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.1))', flexShrink: 0 }}>
          <HardDrive size={17} color="#00d4ff" />
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Optimizer Input</p>
          <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '2px' }}>Configure disk scheduling parameters</p>
        </div>
      </div>

      <div style={{ padding: '22px 28px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Queue */}
        <div>
          {label('Disk Request Queue')}
          <input
            type="text" value={queue} onChange={e => setQueue(e.target.value)}
            onFocus={() => setFocused('q')} onBlur={() => setFocused(null)}
            placeholder="e.g. 98, 183, 37, 122, 14, 124, 65, 67"
            style={focusStyle('q')}
          />
          <p style={{ color: '#334155', fontSize: '0.72rem', marginTop: '5px' }}>Comma-separated cylinder numbers</p>
        </div>

        {/* Head + Disk size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            {label('Initial Head')}
            <input type="number" value={head} onChange={e => setHead(e.target.value)}
              onFocus={() => setFocused('h')} onBlur={() => setFocused(null)}
              placeholder="53" style={focusStyle('h')} />
          </div>
          <div>
            {label('Disk Size')}
            <input type="number" value={diskSize} onChange={e => setDiskSize(e.target.value)}
              onFocus={() => setFocused('d')} onBlur={() => setFocused(null)}
              placeholder="200" style={focusStyle('d')} />
          </div>
        </div>

        {/* Direction */}
        <div>
          {label('Scan Direction')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['right', 'left'].map(d => (
              <button key={d} onClick={() => setDirection(d)} style={{
                padding: '11px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                ...(direction === d
                  ? { background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#000', border: 'none', boxShadow: '0 0 18px rgba(0,212,255,0.35)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }
                ),
              }}>
                {d === 'right' ? '→ Right' : '← Left'}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRun}
            disabled={loading}
            style={{
              flex: 1, padding: '13px', borderRadius: '12px', fontWeight: 700,
              color: '#000', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#00d4ff,#7c3aed)',
              boxShadow: '0 0 20px rgba(0,212,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.6 : 1, fontSize: '0.9rem',
            }}
          >
            {loading
              ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/></svg>
              : <Play size={15} />
            }
            {loading ? 'Analyzing...' : 'Detect Optimal Algorithm'}
            {!loading && <ChevronRight size={14} style={{ opacity: 0.7 }} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setQueue('98, 183, 37, 122, 14, 124, 65, 67'); setHead('53'); setDiskSize('200'); setDirection('right'); }}
            title="Reset to defaults"
            style={{ width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', cursor: 'pointer' }}
          >
            <RotateCcw size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
