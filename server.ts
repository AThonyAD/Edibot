import express from 'express';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(express.json());

const db = new Database('database.sqlite');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT
  );
  CREATE TABLE IF NOT EXISTS media_titles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publisher_id INTEGER,
    name TEXT,
    contact TEXT,
    default_price INTEGER,
    default_reach INTEGER,
    default_target_audience TEXT,
    default_collaboration_type TEXT,
    FOREIGN KEY(publisher_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publisher_id INTEGER,
    media_title_id INTEGER,
    media_name TEXT,
    title TEXT,
    description TEXT,
    publication_date TEXT,
    deadline_date TEXT,
    price INTEGER,
    format TEXT,
    collaboration_type TEXT,
    contact TEXT,
    target_audience TEXT,
    reach INTEGER,
    labels TEXT,
    FOREIGN KEY(publisher_id) REFERENCES users(id),
    FOREIGN KEY(media_title_id) REFERENCES media_titles(id)
  );
`);

// Migration: Add columns to media_titles if they don't exist
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN contact TEXT');
} catch (err) {}
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN default_price INTEGER');
} catch (err) {}
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN default_reach INTEGER');
} catch (err) {}
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN default_target_audience TEXT');
} catch (err) {}
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN default_collaboration_type TEXT');
} catch (err) {}

// Migration: Add is_active column to users if it doesn't exist
try {
  db.exec('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1');
} catch (err) {}

// Migration: Add labels column to topics if it doesn't exist
try {
  db.exec('ALTER TABLE topics ADD COLUMN labels TEXT');
} catch (err) {}

// Seed mock data
const countUser = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (countUser.count === 0) {
  db.exec(`
    INSERT INTO users (email, password, role, name) VALUES ('vydavatel1@test.cz', 'heslo123', 'publisher', 'Tech Magazín');
    INSERT INTO users (email, password, role, name) VALUES ('vydavatel2@test.cz', 'heslo123', 'publisher', 'Mafra');
    INSERT INTO users (email, password, role, name) VALUES ('klient1@test.cz', 'heslo123', 'client', 'PR Agentura X');
    INSERT INTO users (email, password, role, name) VALUES ('klient2@test.cz', 'heslo123', 'client', 'Marketing Pro');
    INSERT INTO users (email, password, role, name) VALUES ('admin@test.cz', 'admin123', 'admin', 'Administrátor');
    
    INSERT INTO media_titles (publisher_id, name, contact) VALUES (1, 'Tech Magazín', 'redakce@techmagazin.cz');
    INSERT INTO media_titles (publisher_id, name, contact) VALUES (1, 'IT Svět', 'info@itsvet.cz');
    INSERT INTO media_titles (publisher_id, name, contact) VALUES (2, 'Žena a život', 'lucie.hirschlerova@mafra.cz');
    INSERT INTO media_titles (publisher_id, name, contact) VALUES (2, 'Ona Dnes', 'ona.dnes@mafra.cz');

    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (1, 1, 'Tech Magazín', 'AI v roce 2026', 'Velký přehled umělé inteligence a jejího využití v praxi.', '2026-05-01', '2026-04-15', 15000, 'Print', 'Placené PR', 'redakce@techmagazin.cz', 'B2B, IT manažeři', 50000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (1, 1, 'Tech Magazín', 'Kyberbezpečnost', 'Jak chránit firemní data.', '2026-06-10', '2026-05-25', 12000, 'On-line', 'Redakční obsah', 'novak@techmagazin.cz', 'Široká veřejnost, Podnikatelé', 120000);
    
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Vánoční Chuťovka', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-11-04', '2026-10-09', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Hormonální rovnováha, menopauza', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-10-21', '2026-09-25', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Eko/bio', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-09-23', '2026-08-28', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Back to School', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-08-12', '2026-07-17', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Sex a Erotika', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-07-15', '2026-06-19', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Chuťovka letní koláče', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-06-03', '2026-05-07', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Děti & rodiče', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-05-20', '2026-04-24', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Krásná do plavek', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-05-06', '2026-04-10', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Velikonoční chuťovka', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-03-25', '2026-02-27', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach)
    VALUES (2, 3, 'Žena a život', 'Eko/bio/udržitelnost', 'Lifestylový časopis, který kombinuje prvky světových trendů s českou realitou v módě, kosmetice, vaření a dekoru. Titul plný inspirativních příběhů žen.', '2026-02-25', '2026-01-30', 25000, 'Print', 'Placené PR', 'lucie.hirschlerova@mafra.cz', 'ženy ve věku 25–45 let', 85000);
  `);
}

// --- API ROUTES ---

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT id, email, role, name, is_active FROM users WHERE email = ? AND password = ?').get(email, password) as any;
  if (user) {
    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Uživatelský účet je deaktivován' });
    }
    res.json({ user });
  } else {
    res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
  }
});

app.get('/api/media-titles', (req, res) => {
  const { publisher_id } = req.query;
  console.log("GET /api/media-titles requested for publisher_id:", publisher_id);
  let query = `
    SELECT mt.*, (SELECT COUNT(*) FROM topics t WHERE t.media_title_id = mt.id) as topic_count 
    FROM media_titles mt
  `;
  const params: any[] = [];
  if (publisher_id) {
    query += ' WHERE mt.publisher_id = ?';
    params.push(Number(publisher_id));
  }
  const titles = db.prepare(query).all(...params);
  console.log(`Returning ${titles.length} titles`);
  res.json(titles);
});

app.post('/api/media-titles', (req, res) => {
  const { publisher_id, name, contact, default_price, default_reach, default_target_audience, default_collaboration_type } = req.body;
  console.log("POST /api/media-titles received:", { publisher_id, name, contact, default_price, default_reach, default_target_audience, default_collaboration_type });
  if (!publisher_id || !name) {
    console.warn("Missing publisher_id or name in request body");
    return res.status(400).json({ error: 'Chybí ID vydavatele nebo název titulu' });
  }
  try {
    const stmt = db.prepare('INSERT INTO media_titles (publisher_id, name, contact, default_price, default_reach, default_target_audience, default_collaboration_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(Number(publisher_id), name, contact || '', default_price || 0, default_reach || 0, default_target_audience || '', default_collaboration_type || 'Klasická inzerce');
    console.log("Title added to DB, ID:", info.lastInsertRowid);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error("Database error adding title:", err);
    res.status(500).json({ error: 'Chyba databáze při přidávání titulu' });
  }
});

app.delete('/api/media-titles/:id', (req, res) => {
  db.prepare('DELETE FROM media_titles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/media-titles/:id', (req, res) => {
  const { name, contact, default_price, default_reach, default_target_audience, default_collaboration_type } = req.body;
  const titleId = req.params.id;

  try {
    const transaction = db.transaction(() => {
      // Update the title itself
      const updateTitle = db.prepare(`
        UPDATE media_titles 
        SET name = ?, contact = ?, default_price = ?, default_reach = ?, default_target_audience = ?, default_collaboration_type = ?
        WHERE id = ?
      `);
      updateTitle.run(name, contact, default_price, default_reach, default_target_audience, default_collaboration_type, titleId);

      // Propagate to all topics
      const updateTopics = db.prepare(`
        UPDATE topics 
        SET contact = ?, price = ?, reach = ?, target_audience = ?, collaboration_type = ?
        WHERE media_title_id = ?
      `);
      updateTopics.run(contact, default_price, default_reach, default_target_audience, default_collaboration_type, titleId);
    });

    transaction();
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating title and propagating to topics:", err);
    res.status(500).json({ error: 'Chyba při aktualizaci titulu a témat' });
  }
});

app.get('/api/topics', (req, res) => {
  const { search, minPrice, maxPrice, format, collaboration_type, deadlineFrom, deadlineTo, media_title_id } = req.query;
  let query = 'SELECT * FROM topics WHERE 1=1';
  const params: any[] = [];

  if (search) {
    const searchTerms = (search as string).split(/[,\s]+/).filter(Boolean);
    if (searchTerms.length > 0) {
      query += ' AND (';
      const termConditions = searchTerms.map(() => '(title LIKE ? OR media_name LIKE ? OR description LIKE ? OR labels LIKE ?)');
      query += termConditions.join(' OR ');
      query += ')';
      
      searchTerms.forEach(term => {
        const searchParam = `%${term}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      });
    }
  }
  if (minPrice) {
    query += ' AND price >= ?';
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(Number(maxPrice));
  }
  if (format) {
    query += ' AND format = ?';
    params.push(format);
  }
  if (collaboration_type) {
    query += ' AND collaboration_type = ?';
    params.push(collaboration_type);
  }
  if (deadlineFrom) {
    query += ' AND deadline_date >= ?';
    params.push(deadlineFrom);
  }
  if (deadlineTo) {
    query += ' AND deadline_date <= ?';
    params.push(deadlineTo);
  }
  if (media_title_id) {
    query += ' AND media_title_id = ?';
    params.push(media_title_id);
  }

  query += ' ORDER BY deadline_date ASC';

  const topics = db.prepare(query).all(...params).map((t: any) => ({
    ...t,
    labels: t.labels ? JSON.parse(t.labels) : []
  }));
  res.json(topics);
});

app.get('/api/publishers/:id/topics', (req, res) => {
  const topics = db.prepare('SELECT * FROM topics WHERE publisher_id = ? ORDER BY deadline_date ASC').all(req.params.id).map((t: any) => ({
    ...t,
    labels: t.labels ? JSON.parse(t.labels) : []
  }));
  res.json(topics);
});

app.post('/api/topics', (req, res) => {
  const { publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels } = req.body;
  const stmt = db.prepare(`
    INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels ? JSON.stringify(labels) : null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/topics/:id', (req, res) => {
  const { media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels } = req.body;
  const stmt = db.prepare(`
    UPDATE topics SET media_title_id = ?, media_name = ?, title = ?, description = ?, publication_date = ?, deadline_date = ?, price = ?, format = ?, collaboration_type = ?, contact = ?, target_audience = ?, reach = ?, labels = ?
    WHERE id = ?
  `);
  stmt.run(media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels ? JSON.stringify(labels) : null, req.params.id);
  res.json({ success: true });
});

app.delete('/api/topics/:id', (req, res) => {
  db.prepare('DELETE FROM topics WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/users/:id', (req, res) => {
  const { name } = req.body;
  const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
  stmt.run(name, req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/stats', (req, res) => {
  const usersCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const publishersCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'publisher'").get() as any).c;
  const titlesCount = (db.prepare('SELECT COUNT(*) as c FROM media_titles').get() as any).c;
  const topicsCount = (db.prepare('SELECT COUNT(*) as c FROM topics').get() as any).c;
  
  const publishers = db.prepare(`
    SELECT u.id, u.name, 
           (SELECT COUNT(*) FROM media_titles WHERE publisher_id = u.id) as titles_count,
           (SELECT COUNT(*) FROM topics WHERE publisher_id = u.id) as topics_count
    FROM users u
    WHERE u.role = 'publisher'
    ORDER BY u.name ASC
  `).all();
  
  res.json({ usersCount, publishersCount, titlesCount, topicsCount, publishers });
});

app.get('/api/admin/titles', (req, res) => {
  const titles = db.prepare(`
    SELECT mt.id, mt.name, mt.contact, u.name as publisher_name,
           (SELECT COUNT(*) FROM topics WHERE media_title_id = mt.id) as count_topics
    FROM media_titles mt
    LEFT JOIN users u ON mt.publisher_id = u.id
    ORDER BY mt.name ASC
  `).all();
  res.json(titles);
});

app.get('/api/admin/users', (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, is_active FROM users ORDER BY id DESC').all();
  res.json(users);
});

app.put('/api/admin/users/:id/toggle', (req, res) => {
  db.prepare('UPDATE users SET is_active = CASE WHEN COALESCE(is_active, 1) = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/users/:id', (req, res) => {
  db.transaction(() => {
    db.prepare('DELETE FROM topics WHERE publisher_id = ?').run(req.params.id);
    db.prepare('DELETE FROM media_titles WHERE publisher_id = ?').run(req.params.id);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  })();
  res.json({ success: true });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;

  try {
    db.exec("UPDATE media_titles SET default_collaboration_type = 'Klasická inzerce' WHERE default_collaboration_type = 'Placené PR' OR default_collaboration_type = '' OR default_collaboration_type IS NULL");
    db.exec("UPDATE topics SET collaboration_type = 'Klasická inzerce' WHERE collaboration_type = 'Placené PR' OR collaboration_type = '' OR collaboration_type IS NULL");
  } catch (err) {
    console.error("Error updating existing collaboration types:", err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
