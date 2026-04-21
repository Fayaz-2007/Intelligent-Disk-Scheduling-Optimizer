import { ExternalLink, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="relative mt-20 py-10 text-center"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 60%)' }}
      />
      <div className="relative flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Cpu size={14} className="text-cyan-400" />
          <span>Powered by</span>
          <span
            className="font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg,#00d4ff,#7c3aed)' }}
          >
            Machine Learning + React
          </span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-600 hover:text-cyan-400 transition-colors text-sm"
        >
          <ExternalLink size={16} />
          <span>View on GitHub</span>
        </a>
        <p className="text-xs text-slate-700">
          Intelligent Disk Scheduling Optimizer — FCFS · SSTF · SCAN · C-SCAN · LOOK · C-LOOK
        </p>
      </div>
    </footer>
  );
}
