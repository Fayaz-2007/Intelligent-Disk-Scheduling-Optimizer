import { useState, useCallback } from 'react';
import axios from 'axios';
import ParticleBackground from './components/ParticleBackground';
import HeroSection from './components/HeroSection';
import InputPanel from './components/InputPanel';
import MLPredictionCard from './components/MLPredictionCard';
import AlgorithmTable from './components/AlgorithmTable';
import DiskChart from './components/DiskChart';
import FeaturesPanel from './components/FeaturesPanel';
import HistorySection from './components/HistorySection';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { runAllAlgorithms, extractFeatures } from './utils/algorithms';
import { mlRecommend } from './utils/mlModel';
import './index.css';

let toastId = 0;
const DEFAULT_REQUESTS = [98, 183, 37, 122, 14, 124, 65, 67];
const DEFAULT_HEAD = 53;

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-4" style={{ margin: '0 0 28px 0' }}>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.18))' }} />
      <span style={{
        fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: '#00d4ff', fontWeight: 700,
        background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.18)',
        padding: '4px 14px', borderRadius: '99px',
      }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(0,212,255,0.18),transparent)' }} />
    </div>
  );
}

const initFeats = extractFeatures(DEFAULT_REQUESTS, DEFAULT_HEAD);

export default function App() {
  const [loading, setLoading]               = useState(false);
  const [results, setResults]               = useState(() => runAllAlgorithms(DEFAULT_REQUESTS, DEFAULT_HEAD, 'right', 200));
  const [features, setFeatures]             = useState(initFeats);
  const [recommendation, setRecommendation] = useState(() => mlRecommend(initFeats));
  const [head, setHead]                     = useState(DEFAULT_HEAD);
  const [history, setHistory]               = useState([]);
  const [toasts, setToasts]                 = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const fetchHistory = useCallback(async () => {
    try { const res = await axios.get('/api/history'); setHistory(res.data); } catch { /* offline */ }
  }, []);

  const handleRun = useCallback(async ({ requests, head: h, diskSize, direction }) => {
    setLoading(true);
    setHead(h);
    await new Promise(r => setTimeout(r, 500));

    const algResults = runAllAlgorithms(requests, h, direction, diskSize);
    const feats      = extractFeatures(requests, h);
    const rec        = mlRecommend(feats, diskSize);   // ← real neural network

    setResults(algResults);
    setFeatures(feats);
    setRecommendation(rec);

    const best = algResults.reduce((a, b) => a.totalMovement < b.totalMovement ? a : b);
    const payload = { requests: requests.join(', '), head_position: h, best_algorithm: best.name, seek_time: best.totalMovement };

    try {
      await axios.post('/api/history', payload);
      fetchHistory();
    } catch {
      setHistory(prev => [{ id: Date.now(), created_at: new Date().toISOString(), ...payload }, ...prev].slice(0, 20));
    }

    setLoading(false);
    showToast('Neural network analysis complete.');
  }, [fetchHistory, showToast]);

  const handleClearHistory = useCallback(async () => {
    try { await axios.delete('/api/history'); } catch { /* ignore */ }
    setHistory([]);
    showToast('History cleared.');
  }, [showToast]);

  const best = results?.reduce((a, b) => a.totalMovement < b.totalMovement ? a : b);

  return (
    <div style={{ background: '#07071a', minHeight: '100vh' }}>
      <ParticleBackground />
      <Toast toasts={toasts} />
      <HeroSection />

      <main id="input-section" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px 100px' }}>

          {/* ── CONFIGURE ── */}
          <div style={{ marginBottom: '60px' }}>
            <SectionDivider label="01 · Configure" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
              <InputPanel onRun={handleRun} loading={loading} />
              <MLPredictionCard recommendation={recommendation} />
            </div>
          </div>

          {/* ── FEATURE EXTRACTION ── */}
          <div style={{ marginBottom: '60px' }}>
            <SectionDivider label="02 · Feature Extraction" />
            <FeaturesPanel features={features} />
          </div>

          {/* ── ALGORITHM COMPARISON ── */}
          <div style={{ marginBottom: '60px' }}>
            <SectionDivider label="03 · Algorithm Comparison" />
            <AlgorithmTable results={results} bestAlgo={best?.name} />
          </div>

          {/* ── VISUALIZATION ── */}
          <div style={{ marginBottom: '60px' }}>
            <SectionDivider label="04 · Head Movement" />
            <DiskChart results={results} head={head} />
          </div>

          {/* ── HISTORY ── */}
          <div>
            <SectionDivider label="05 · Run History" />
            <HistorySection history={history} onClear={handleClearHistory} />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
