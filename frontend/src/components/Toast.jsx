import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ toasts }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl glass pointer-events-auto"
            style={{
              border: `1px solid ${t.type === 'success' ? 'rgba(0,212,255,0.4)' : 'rgba(239,68,68,0.4)'}`,
              boxShadow: `0 0 20px ${t.type === 'success' ? 'rgba(0,212,255,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {t.type === 'success'
              ? <CheckCircle size={16} className="text-cyan-400" />
              : <XCircle size={16} className="text-red-400" />
            }
            <span className="text-sm text-white font-medium">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
