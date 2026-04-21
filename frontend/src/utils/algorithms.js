// Disk scheduling algorithms — all return { sequence, totalMovement }

export function fcfs(requests, head) {
  const sequence = [head, ...requests];
  let total = 0;
  for (let i = 1; i < sequence.length; i++) total += Math.abs(sequence[i] - sequence[i - 1]);
  return { sequence, totalMovement: total };
}

export function sstf(requests, head) {
  const remaining = [...requests];
  const sequence = [head];
  let current = head;
  let total = 0;
  while (remaining.length) {
    let minDist = Infinity, minIdx = 0;
    remaining.forEach((r, i) => { const d = Math.abs(r - current); if (d < minDist) { minDist = d; minIdx = i; } });
    current = remaining[minIdx];
    sequence.push(current);
    total += minDist;
    remaining.splice(minIdx, 1);
  }
  return { sequence, totalMovement: total };
}

export function scan(requests, head, direction = 'right', diskSize = 200) {
  const sorted = [...requests].sort((a, b) => a - b);
  const left = sorted.filter(r => r < head);
  const right = sorted.filter(r => r >= head);
  let sequence = [head];
  let total = 0;
  if (direction === 'right') {
    [...right, diskSize - 1, ...left.reverse()].forEach(r => { total += Math.abs(r - sequence[sequence.length - 1]); sequence.push(r); });
  } else {
    [...left.reverse(), 0, ...right].forEach(r => { total += Math.abs(r - sequence[sequence.length - 1]); sequence.push(r); });
  }
  return { sequence, totalMovement: total };
}

export function cscan(requests, head, diskSize = 200) {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head);
  const sequence = [head];
  let total = 0;
  [...right, diskSize - 1, 0, ...left].forEach(r => { total += Math.abs(r - sequence[sequence.length - 1]); sequence.push(r); });
  return { sequence, totalMovement: total };
}

export function look(requests, head, direction = 'right') {
  const sorted = [...requests].sort((a, b) => a - b);
  const left = sorted.filter(r => r < head);
  const right = sorted.filter(r => r >= head);
  const sequence = [head];
  let total = 0;
  if (direction === 'right') {
    [...right, ...left.reverse()].forEach(r => { total += Math.abs(r - sequence[sequence.length - 1]); sequence.push(r); });
  } else {
    [...left.reverse(), ...right].forEach(r => { total += Math.abs(r - sequence[sequence.length - 1]); sequence.push(r); });
  }
  return { sequence, totalMovement: total };
}

export function clook(requests, head) {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head);
  const sequence = [head];
  let total = 0;
  [...right, ...left].forEach(r => { total += Math.abs(r - sequence[sequence.length - 1]); sequence.push(r); });
  return { sequence, totalMovement: total };
}

export function extractFeatures(requests, head) {
  const n = requests.length;
  const distances = requests.map(r => Math.abs(r - head));
  const avgDist = distances.reduce((a, b) => a + b, 0) / n;
  const leftReqs = requests.filter(r => r < head).length;
  const rightReqs = requests.filter(r => r >= head).length;
  const mean = requests.reduce((a, b) => a + b, 0) / n;
  const variance = requests.reduce((acc, r) => acc + (r - mean) ** 2, 0) / n;
  const sorted = [...requests].sort((a, b) => a - b);
  let seqPairs = 0;
  for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] <= 10) seqPairs++;
  const sequentiality = parseFloat((seqPairs / Math.max(sorted.length - 1, 1)).toFixed(2));
  return { numRequests: n, avgDistance: Math.round(avgDist), leftRequests: leftReqs, rightRequests: rightReqs, variance: Math.round(variance), sequentiality };
}

export function recommendAlgorithm(features) {
  const { numRequests, avgDistance, leftRequests, rightRequests, variance, sequentiality } = features;
  const balance = Math.abs(leftRequests - rightRequests) / Math.max(numRequests, 1);
  if (sequentiality > 0.6) return { algo: 'C-LOOK', confidence: 91, reason: 'High sequentiality detected — C-LOOK minimizes head movement on clustered requests.' };
  if (balance < 0.2 && avgDistance > 60) return { algo: 'LOOK', confidence: 94, reason: 'Balanced, spread requests — LOOK avoids disk-end overhead and outperforms SCAN.' };
  if (variance < 1500 && numRequests > 5) return { algo: 'SSTF', confidence: 88, reason: 'Low variance and dense requests — SSTF greedily selects nearest cylinder, reducing seek time.' };
  if (balance > 0.5) return { algo: 'C-SCAN', confidence: 85, reason: 'Heavily unbalanced queue — C-SCAN provides uniform wait time across cylinders.' };
  return { algo: 'LOOK', confidence: 87, reason: 'General workload — LOOK provides good average seek time without hitting disk boundaries.' };
}

export function runAllAlgorithms(requests, head, direction, diskSize) {
  return [
    { name: 'FCFS', ...fcfs(requests, head) },
    { name: 'SSTF', ...sstf(requests, head) },
    { name: 'SCAN', ...scan(requests, head, direction, diskSize) },
    { name: 'C-SCAN', ...cscan(requests, head, diskSize) },
    { name: 'LOOK', ...look(requests, head, direction) },
    { name: 'C-LOOK', ...clook(requests, head) },
  ];
}
