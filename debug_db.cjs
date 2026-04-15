
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

console.log('--- MEDIA TITLES ---');
const titles = db.prepare('SELECT * FROM media_titles').all();
console.log(titles);

console.log('\n--- TOPICS ---');
const topics = db.prepare('SELECT id, media_title_id, media_name, title FROM topics').all();
console.log(topics);

console.log('\n--- TOPIC COUNTS PER TITLE ---');
const counts = db.prepare(`
  SELECT mt.id, mt.name, (SELECT COUNT(*) FROM topics t WHERE t.media_title_id = mt.id) as count
  FROM media_titles mt
`).all();
console.log(counts);
