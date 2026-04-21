import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import { Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-4 py-3 rounded-xl text-sm"
      style={{ border: '1px solid rgba(0,212,255,0.35)', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
      <p className="text-slate-400 text-xs mb-1">Step {label}</p>
      <p className="text-cyan-400 font-bold text-base">Cylinder {payload[0]?.value}</p>
    </div>
  );
};

const ALGO_COLORS = {
  FCFS: '#00d4ff', SSTF: '#a78bfa', SCAN: '#34d399',
  'C-SCAN': '#fb923c', LOOK: '#f472b6', 'C-LOOK': '#facc15',
};

export default function DiskChart({ results, head }) {
  const [selected, setSelected] = useState(0);
  if (!results || results.length === 0) return null;

  const current = results[selected];
  const color = ALGO_COLORS[current.name] || '#00d4ff';
  const chartData = current.sequence.map((pos, i) => ({ step: i, cylinder: pos }));

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.1)' }}>
          <Activity size={15} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">Head Movement Visualization</h2>
          <p className="text-slate-500 text-xs">Step-by-step disk head traversal path</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Algorithm tabs */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-white font-semibold">{current.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {current.sequence.length - 1} steps · {current.totalMovement} cylinders total
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {results.map((r, i) => {
              const c = ALGO_COLORS[r.name] || '#00d4ff';
              return (
                <motion.button
                  key={r.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(i)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                  style={
                    selected === i
                      ? { background: `${c}22`, color: c, border: `1px solid ${c}55`, boxShadow: `0 0 10px ${c}33` }
                      : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {r.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ height: 320 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <defs>
                    <linearGradient id={`grad-${selected}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="step"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Step', position: 'insideBottom', fill: '#475569', fontSize: 11, dy: 14 }}
                  />
                  <YAxis
                    tick={{ fill: '#475569', fontSize: 11 }}
                    label={{ value: 'Cylinder', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11, dx: -5 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={head}
                    stroke="rgba(167,139,250,0.45)"
                    strokeDasharray="5 4"
                    label={{ value: `Head: ${head}`, fill: '#a78bfa', fontSize: 10, position: 'right' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cylinder"
                    stroke={color}
                    strokeWidth={2.5}
                    fill={`url(#grad-${selected})`}
                    dot={{ fill: color, r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 1.5,
                      style: { filter: `drop-shadow(0 0 6px ${color})` } }}
                    style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
