
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

console.log('--- USERS ---');
const users = db.prepare('SELECT * FROM users').all();
console.log(users);
