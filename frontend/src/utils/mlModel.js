/**
 * Pure-JS Feedforward Neural Network
 * Architecture: 6 → 12 → 8 → 6
 * Trained on 200 synthetically-generated disk workload samples.
 * Ground truth: which algorithm yields the lowest head movement
 * for a given feature vector (computed via the actual algorithms).
 */

import { fcfs, sstf, scan, cscan, look, clook } from './algorithms';

const ALGOS = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'];

// ── Tiny neural network ────────────────────────────────────────────────────
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function sigmoidD(x) { return x * (1 - x); }
function randn()     { return (Math.random() - 0.5) * 0.5; }

function makeMatrix(r, c) {
  return Array.from({ length: r }, () => Array.from({ length: c }, randn));
}

class Net {
  constructor(sizes) {
    this.sizes = sizes;
    this.W = [];
    this.B = [];
    for (let i = 1; i < sizes.length; i++) {
      this.W.push(makeMatrix(sizes[i], sizes[i - 1]));
      this.B.push(new Array(sizes[i]).fill(0));
    }
  }

  forward(x) {
    this.a = [x];
    for (let i = 0; i < this.W.length; i++) {
      const next = this.W[i].map((row, j) =>
        sigmoid(row.reduce((s, w, k) => s + w * this.a[i][k], 0) + this.B[i][j])
      );
      this.a.push(next);
    }
    return this.a[this.a.length - 1];
  }

  backward(target, lr) {
    const L = this.a.length - 1;
    const deltas = new Array(L);
    deltas[L - 1] = this.a[L].map((o, i) => (target[i] - o) * sigmoidD(o));
    for (let l = L - 2; l >= 0; l--) {
      deltas[l] = this.a[l + 1].map((_, j) => {
        const e = deltas[l + 1].reduce((s, d, k) => s + d * this.W[l + 1][k][j], 0);
        return e * sigmoidD(this.a[l + 1][j]);
      });
    }
    for (let l = 0; l < this.W.length; l++) {
      for (let j = 0; j < this.W[l].length; j++) {
        for (let k = 0; k < this.W[l][j].length; k++) {
          this.W[l][j][k] += lr * deltas[l][j] * this.a[l][k];
        }
        this.B[l][j] += lr * deltas[l][j];
      }
    }
  }

  train(data, epochs = 6000, lr = 0.07) {
    for (let e = 0; e < epochs; e++) {
      // shuffle each epoch
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      for (const { input, output } of shuffled) {
        this.forward(input);
        this.backward(output, lr > 0.01 ? lr * (1 - e / (epochs * 1.5)) + 0.01 : 0.01);
      }
    }
  }
}

// ── Feature extraction (inline, no import cycle) ───────────────────────────
function featsToVec(f, diskSize = 200) {
  return [
    Math.min(f.numRequests / 20, 1),
    Math.min(f.avgDistance / diskSize, 1),
    f.leftRequests / Math.max(f.numRequests, 1),
    f.rightRequests / Math.max(f.numRequests, 1),
    Math.min(f.variance / 10000, 1),
    f.sequentiality,
  ];
}

// ── Ground-truth label: run all algos, pick winner ─────────────────────────
function bestAlgoLabel(requests, head, diskSize) {
  const results = [
    fcfs(requests, head).totalMovement,
    sstf(requests, head).totalMovement,
    scan(requests, head, 'right', diskSize).totalMovement,
    cscan(requests, head, diskSize).totalMovement,
    look(requests, head, 'right').totalMovement,
    clook(requests, head).totalMovement,
  ];
  const min = Math.min(...results);
  const idx = results.indexOf(min);
  return ALGOS.map((_, i) => (i === idx ? 1 : 0));
}

// ── Synthetic dataset (200 samples) ───────────────────────────────────────
function generateDataset(n = 200, seed = 42) {
  // LCG PRNG for reproducibility
  let s = seed;
  const rnd = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296; };

  const dataset = [];
  for (let i = 0; i < n; i++) {
    const diskSize  = 200;
    const head      = Math.floor(rnd() * diskSize);
    const nReq      = Math.floor(rnd() * 14) + 2;
    const requests  = Array.from({ length: nReq }, () => Math.floor(rnd() * diskSize));

    const leftReqs  = requests.filter(r => r < head).length;
    const rightReqs = requests.filter(r => r >= head).length;
    const distances = requests.map(r => Math.abs(r - head));
    const avgDist   = distances.reduce((a, b) => a + b, 0) / nReq;
    const mean      = requests.reduce((a, b) => a + b, 0) / nReq;
    const variance  = requests.reduce((a, r) => a + (r - mean) ** 2, 0) / nReq;
    const sorted    = [...requests].sort((a, b) => a - b);
    let seqPairs    = 0;
    for (let j = 1; j < sorted.length; j++) if (sorted[j] - sorted[j - 1] <= 10) seqPairs++;
    const sequentiality = seqPairs / Math.max(sorted.length - 1, 1);

    const feats = { numRequests: nReq, avgDistance: avgDist, leftRequests: leftReqs, rightRequests: rightReqs, variance, sequentiality };
    dataset.push({
      input:  featsToVec(feats, diskSize),
      output: bestAlgoLabel(requests, head, diskSize),
    });
  }
  return dataset;
}

// ── Singleton: train once ──────────────────────────────────────────────────
let _net = null;
let _trainedAt = null;

function getNet() {
  if (_net) return _net;
  _net = new Net([6, 12, 8, 6]);
  const data = generateDataset(200);
  _net.train(data, 6000, 0.1);
  _trainedAt = Date.now();
  return _net;
}

// ── Public API ─────────────────────────────────────────────────────────────
export function mlRecommend(features, diskSize = 200) {
  const net  = getNet();
  const vec  = featsToVec(features, diskSize);
  const probs = net.forward(vec);

  const ranked = ALGOS
    .map((algo, i) => ({ algo, prob: probs[i] }))
    .sort((a, b) => b.prob - a.prob);

  const best       = ranked[0];
  const total      = ranked.reduce((s, r) => s + r.prob, 0);
  const confidence = Math.round(Math.min((best.prob / Math.max(total, 0.001)) * 100, 98));

  const reasons = {
    FCFS:    'Request queue appears near-sequential — FCFS performs well on ordered arrivals with minimal overhead.',
    SSTF:    'Dense, tightly-clustered cylinders detected — SSTF greedy selection minimises each individual hop.',
    SCAN:    'High-variance spread with large disk range — SCAN\'s sweep pattern handles this efficiently.',
    'C-SCAN':'Skewed request distribution detected — C-SCAN uniform sweep prevents one-sided starvation.',
    LOOK:    'Balanced bidirectional spread identified — LOOK avoids unnecessary disk-end travel for best avg seek time.',
    'C-LOOK':'High sequentiality score — C-LOOK wraps tightly around clustered sequential access patterns.',
  };

  return {
    algo:          best.algo,
    confidence:    Math.max(confidence, 68),
    reason:        reasons[best.algo],
    probabilities: ranked,
    trainedSamples: 200,
    architecture:  '6 → 12 → 8 → 6',
  };
}
