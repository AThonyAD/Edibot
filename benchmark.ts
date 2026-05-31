import { performance } from 'perf_hooks';

const numTopics = 10000;
const selectedTitleId = 1;
const topics = Array.from({ length: numTopics }, (_, i) => ({
  id: i,
  media_title_id: i % 10 === 0 ? selectedTitleId : 2,
  title: `Topic ${i}`
}));

const selectedTitle = { id: selectedTitleId };

const renderBaseline = () => {
  const t0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const count = topics.filter(t => t.media_title_id === selectedTitle.id).length;
    const empty = topics.filter(t => t.media_title_id === selectedTitle.id).length === 0;
    const mapped = topics.filter(t => t.media_title_id === selectedTitle.id).map(t => t.title);
  }
  const t1 = performance.now();
  return t1 - t0;
};

const renderOptimized = () => {
  const t0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const filteredTopics = topics.filter(t => t.media_title_id === selectedTitle.id);
    const count = filteredTopics.length;
    const empty = filteredTopics.length === 0;
    const mapped = filteredTopics.map(t => t.title);
  }
  const t1 = performance.now();
  return t1 - t0;
};

const baselineTime = renderBaseline();
const optimizedTime = renderOptimized();

console.log(`Baseline (3x filter): ${baselineTime.toFixed(2)} ms`);
console.log(`Optimized (1x filter): ${optimizedTime.toFixed(2)} ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
