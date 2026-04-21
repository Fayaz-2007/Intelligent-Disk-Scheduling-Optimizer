import { motion } from 'framer-motion';
import { Hash, Ruler, ArrowLeft, ArrowRight, Activity, GitBranch } from 'lucide-react';

const STATS = [
  { key: 'numRequests',   label: 'Num Requests',  icon: Hash,       color: '#00d4ff', bg: 'rgba(0,212,255,0.07)',   border: 'rgba(0,212,255,0.18)'   },
  { key: 'avgDistance',   label: 'Avg Distance',  icon: Ruler,      color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.18)', unit: ' cyl' },
  { key: 'leftRequests',  label: 'Left Requests', icon: ArrowLeft,  color: '#22d3ee', bg: 'rgba(34,211,238,0.07)',  border: 'rgba(34,211,238,0.18)'  },
  { key: 'rightRequests', label: 'Right Requests',icon: ArrowRight, color: '#818cf8', bg: 'rgba(129,140,248,0.07)', border: 'rgba(129,140,248,0.18)' },
  { key: 'variance',      label: 'Variance',      icon: Activity,   color: '#34d399', bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.18)'  },
  { key: 'sequentiality', label: 'Sequentiality', icon: GitBranch,  color: '#fb923c', bg: 'rgba(251,146,60,0.07)',  border: 'rgba(251,146,60,0.18)'  },
];

export default function FeaturesPanel({ features }) {
  if (!features) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
      {STATS.map(({ key, label, icon: Icon, color, bg, border, unit = '' }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          whileHover={{ y: -5, transition: { duration: 0.18 } }}
          style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: '16px',
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            cursor: 'default',
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, marginBottom: '12px' }}>
            <Icon size={18} color={color} />
          </div>
          <div style={{ fontWeight: 900, fontSize: '1.6rem', lineHeight: 1, color, marginBottom: '8px', fontVariantNumeric: 'tabular-nums' }}>
            {features[key]}{unit}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.72rem', lineHeight: 1.3 }}>{label}</div>
        </motion.div>
      ))}
    </div>
  );
}
