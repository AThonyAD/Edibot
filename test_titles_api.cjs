
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

const publisher_id = 2;
console.log(`--- MEDIA TITLES FOR PUBLISHER ${publisher_id} ---`);
const query = `
  SELECT mt.*, (SELECT COUNT(*) FROM topics t WHERE t.media_title_id = mt.id) as topic_count 
  FROM media_titles mt
  WHERE mt.publisher_id = ?
`;
const titles = db.prepare(query).all(publisher_id);
console.log(titles);
