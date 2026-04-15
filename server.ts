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
  try {
    const { email, password } = req.body;

    // Zamezení DoS (TypeError při bindování objektů místo stringů)
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Neplatný formát dat' });
    }

    const user = db.prepare('SELECT id, email, role, name FROM users WHERE email = ? AND password = ?').get(email, password);
    if (user) {
      res.json({ user });
    } else {
      res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.get('/api/media-titles', (req, res) => {
  try {
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
  } catch (err) {
    console.error("GET /api/media-titles error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.post('/api/media-titles', (req, res) => {
  try {
    const { publisher_id, name, contact, default_price, default_reach, default_target_audience, default_collaboration_type } = req.body;
    console.log("POST /api/media-titles received:", { publisher_id, name, contact, default_price, default_reach, default_target_audience, default_collaboration_type });
    if (!publisher_id || !name || typeof name !== 'string') {
      console.warn("Missing publisher_id or name in request body");
      return res.status(400).json({ error: 'Chybí ID vydavatele nebo název titulu' });
    }
    const stmt = db.prepare('INSERT INTO media_titles (publisher_id, name, contact, default_price, default_reach, default_target_audience, default_collaboration_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
    // Ensuring basic types to avoid parameter binding errors
    const info = stmt.run(
      Number(publisher_id),
      name,
      typeof contact === 'string' ? contact : '',
      Number(default_price) || 0,
      Number(default_reach) || 0,
      typeof default_target_audience === 'string' ? default_target_audience : '',
      typeof default_collaboration_type === 'string' ? default_collaboration_type : 'Klasická inzerce'
    );
    console.log("Title added to DB, ID:", info.lastInsertRowid);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error("Database error adding title:", err);
    res.status(500).json({ error: 'Chyba databáze při přidávání titulu' });
  }
});

app.delete('/api/media-titles/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM media_titles WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/media-titles error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.put('/api/media-titles/:id', (req, res) => {
  try {
    const { name, contact, default_price, default_reach, default_target_audience, default_collaboration_type } = req.body;
    const titleId = Number(req.params.id);

    const transaction = db.transaction(() => {
      // Update the title itself
      const updateTitle = db.prepare(`
        UPDATE media_titles 
        SET name = ?, contact = ?, default_price = ?, default_reach = ?, default_target_audience = ?, default_collaboration_type = ?
        WHERE id = ?
      `);
      updateTitle.run(
        typeof name === 'string' ? name : null,
        typeof contact === 'string' ? contact : null,
        default_price !== undefined ? Number(default_price) : null,
        default_reach !== undefined ? Number(default_reach) : null,
        typeof default_target_audience === 'string' ? default_target_audience : null,
        typeof default_collaboration_type === 'string' ? default_collaboration_type : null,
        titleId
      );

      // Propagate to all topics
      const updateTopics = db.prepare(`
        UPDATE topics 
        SET contact = ?, price = ?, reach = ?, target_audience = ?, collaboration_type = ?
        WHERE media_title_id = ?
      `);
      updateTopics.run(
        typeof contact === 'string' ? contact : null,
        default_price !== undefined ? Number(default_price) : null,
        default_reach !== undefined ? Number(default_reach) : null,
        typeof default_target_audience === 'string' ? default_target_audience : null,
        typeof default_collaboration_type === 'string' ? default_collaboration_type : null,
        titleId
      );
    });

    transaction();
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating title and propagating to topics:", err);
    res.status(500).json({ error: 'Chyba při aktualizaci titulu a témat' });
  }
});

app.get('/api/topics', (req, res) => {
  try {
    const { search, minPrice, maxPrice, format, collaboration_type, deadlineFrom, deadlineTo, media_title_id } = req.query;
    let query = 'SELECT * FROM topics WHERE 1=1';
    const params: any[] = [];

    if (search && typeof search === 'string') {
      // Limit length to avoid long regex evaluation
      const safeSearch = search.slice(0, 200);
      const searchTerms = safeSearch.split(/[,\s]+/).filter(Boolean);
      
      // Limit number of search terms to prevent query expansion DoS
      const maxTerms = 10;
      const limitedSearchTerms = searchTerms.slice(0, maxTerms);

      if (limitedSearchTerms.length > 0) {
        query += ' AND (';
        const termConditions = limitedSearchTerms.map(() => '(title LIKE ? OR media_name LIKE ? OR description LIKE ? OR labels LIKE ?)');
        query += termConditions.join(' OR ');
        query += ')';

        limitedSearchTerms.forEach(term => {
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
  } catch (err) {
    console.error("GET /api/topics error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.get('/api/publishers/:id/topics', (req, res) => {
  try {
    const topics = db.prepare('SELECT * FROM topics WHERE publisher_id = ? ORDER BY deadline_date ASC').all(Number(req.params.id)).map((t: any) => ({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : []
    }));
    res.json(topics);
  } catch (err) {
    console.error("GET /api/publishers/:id/topics error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.post('/api/topics', (req, res) => {
  try {
    const { publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels } = req.body;
    const stmt = db.prepare(`
      INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      Number(publisher_id),
      Number(media_title_id),
      typeof media_name === 'string' ? media_name : null,
      typeof title === 'string' ? title : null,
      typeof description === 'string' ? description : null,
      typeof publication_date === 'string' ? publication_date : null,
      typeof deadline_date === 'string' ? deadline_date : null,
      price !== undefined ? Number(price) : null,
      typeof format === 'string' ? format : null,
      typeof collaboration_type === 'string' ? collaboration_type : null,
      typeof contact === 'string' ? contact : null,
      typeof target_audience === 'string' ? target_audience : null,
      reach !== undefined ? Number(reach) : null,
      Array.isArray(labels) ? JSON.stringify(labels) : null
    );
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error("POST /api/topics error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.put('/api/topics/:id', (req, res) => {
  try {
    const { media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels } = req.body;
    const stmt = db.prepare(`
      UPDATE topics SET media_title_id = ?, media_name = ?, title = ?, description = ?, publication_date = ?, deadline_date = ?, price = ?, format = ?, collaboration_type = ?, contact = ?, target_audience = ?, reach = ?, labels = ?
      WHERE id = ?
    `);
    stmt.run(
      Number(media_title_id),
      typeof media_name === 'string' ? media_name : null,
      typeof title === 'string' ? title : null,
      typeof description === 'string' ? description : null,
      typeof publication_date === 'string' ? publication_date : null,
      typeof deadline_date === 'string' ? deadline_date : null,
      price !== undefined ? Number(price) : null,
      typeof format === 'string' ? format : null,
      typeof collaboration_type === 'string' ? collaboration_type : null,
      typeof contact === 'string' ? contact : null,
      typeof target_audience === 'string' ? target_audience : null,
      reach !== undefined ? Number(reach) : null,
      Array.isArray(labels) ? JSON.stringify(labels) : null,
      Number(req.params.id)
    );
    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/topics/:id error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.delete('/api/topics/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM topics WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/topics/:id error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const { name } = req.body;
    if (typeof name !== 'string') return res.status(400).json({ error: 'Neplatný formát jména' });
    const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
    stmt.run(name, Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/users/:id error:", err);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Global Error:", err);
  res.status(500).json({ error: 'Došlo k interní chybě serveru' });
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
