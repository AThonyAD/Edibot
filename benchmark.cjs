const { performance } = require('perf_hooks');

const labelsInput = "zdraví, sport, bio, ekologie, technologie, ".repeat(10); // 50 items

function baseline() {
  const hasLength = labelsInput.split(',').map(l => l.trim()).filter(Boolean).length > 0;
  let items = [];
  if (hasLength) {
    items = labelsInput.split(',').map(l => l.trim()).filter(Boolean).map(label => label);
  }
  return items;
}

function optimized() {
  const labelsArray = labelsInput.split(',').map(l => l.trim()).filter(Boolean);
  const hasLength = labelsArray.length > 0;
  let items = [];
  if (hasLength) {
    items = labelsArray.map(label => label);
  }
  return items;
}

// warm up
for (let i = 0; i < 1000; i++) baseline();
for (let i = 0; i < 1000; i++) optimized();

let start = performance.now();
for (let i = 0; i < 10000; i++) {
  baseline();
}
const baseTime = performance.now() - start;
console.log(`Baseline: ${baseTime.toFixed(2)} ms`);

start = performance.now();
for (let i = 0; i < 10000; i++) {
  optimized();
}
const optTime = performance.now() - start;
console.log(`Optimized: ${optTime.toFixed(2)} ms`);
console.log(`Improvement: ${((baseTime - optTime) / baseTime * 100).toFixed(2)}%`);
