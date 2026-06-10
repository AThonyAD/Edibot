import express from 'express';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(express.json());

const db = new Database('database.sqlite');

const defaultOpportunityOptions = {
  types: [
    { value: 'media', label: 'Media' },
    { value: 'media_topic', label: 'Media topic' },
    { value: 'event', label: 'Event' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'sponsorship', label: 'Sponsorship' },
    { value: 'conference', label: 'Conference' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'award', label: 'Award' },
    { value: 'trade_fair', label: 'Trade fair' },
    { value: 'other', label: 'Other' },
  ],
  channels: [
    'Print',
    'On-line',
    'Rádio',
    'TV',
    'Podcast',
    'Newsletter',
    'Sociální sítě',
    'OOH',
    'Indoor screen',
    'Event booth',
    'Stage',
  ],
  categories: [
    'concert',
    'sport',
    'culture',
    'business',
    'technology',
    'health',
    'lifestyle',
    'finance',
    'education',
    'family',
    'travel',
    'food',
    'sustainability',
    'other',
  ],
};

function normalizeOpportunityChannel(value?: string) {
  if (!value) return '';

  const normalized = value
    .trim()
    .toLocaleLowerCase('cs-CZ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const aliases: Record<string, string> = {
    print: 'Print',
    online: 'On-line',
    'on-line': 'On-line',
    radio: 'Rádio',
    tv: 'TV',
    podcast: 'Podcast',
    newsletter: 'Newsletter',
    socialni: 'Sociální sítě',
    'socialni site': 'Sociální sítě',
    ooh: 'OOH',
    outdoor: 'OOH',
    indoor: 'Indoor screen',
    'indoor screen': 'Indoor screen',
    stage: 'Stage',
    event: 'Stage',
    'event booth': 'Event booth',
  };

  return aliases[normalized] || value.trim();
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT
  );
  CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'publisher',
    website TEXT,
    contact_email TEXT,
    owner_user_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS media_titles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publisher_id INTEGER,
    organization_id INTEGER,
    name TEXT,
    type TEXT DEFAULT 'magazine',
    contact TEXT,
    default_price INTEGER,
    default_reach INTEGER,
    default_target_audience TEXT,
    default_collaboration_type TEXT,
    website TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(organization_id) REFERENCES organizations(id),
    FOREIGN KEY(publisher_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_opportunity_id INTEGER,
    owner_user_id INTEGER,
    organization_id INTEGER,
    media_title_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'media_topic',
    category TEXT,
    audience TEXT,
    location TEXT,
    reach INTEGER,
    price INTEGER,
    format TEXT,
    collaboration_type TEXT,
    contact TEXT,
    website TEXT,
    source_topic_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_opportunity_id) REFERENCES opportunities(id),
    FOREIGN KEY(owner_user_id) REFERENCES users(id),
    FOREIGN KEY(organization_id) REFERENCES organizations(id),
    FOREIGN KEY(media_title_id) REFERENCES media_titles(id),
    FOREIGN KEY(source_topic_id) REFERENCES topics(id)
  );
  CREATE TABLE IF NOT EXISTS opportunity_occurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER NOT NULL,
    publication_date TEXT,
    start_date TEXT,
    end_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_occurrence_id INTEGER NOT NULL,
    deadline_type TEXT NOT NULL DEFAULT 'advertising',
    deadline_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(opportunity_occurrence_id) REFERENCES opportunity_occurrences(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS opportunity_tags (
    opportunity_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (opportunity_id, tag_id),
    FOREIGN KEY(opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS opportunity_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS opportunity_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS opportunity_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN organization_id INTEGER');
} catch (err) {}
try {
  db.exec("ALTER TABLE media_titles ADD COLUMN type TEXT DEFAULT 'magazine'");
} catch (err) {}
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN website TEXT');
} catch (err) {}
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP');
} catch (err) {}
try {
  db.exec('ALTER TABLE media_titles ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP');
} catch (err) {}

// Migration: Add is_active column to users if it doesn't exist
try {
  db.exec('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1');
} catch (err) {}

// Migration: Add labels column to topics if it doesn't exist
try {
  db.exec('ALTER TABLE topics ADD COLUMN labels TEXT');
} catch (err) {}

try {
  db.exec('ALTER TABLE opportunities ADD COLUMN parent_opportunity_id INTEGER');
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

function syncLegacyTopicsToOpportunities() {
  const createPublisherOrganizations = db.prepare(`
    INSERT INTO organizations (name, type, contact_email, owner_user_id)
    SELECT u.name, 'publisher', u.email, u.id
    FROM users u
    WHERE u.role = 'publisher'
      AND NOT EXISTS (
        SELECT 1 FROM organizations o WHERE o.owner_user_id = u.id
      )
  `);

  const linkMediaTitles = db.prepare(`
    UPDATE media_titles
    SET organization_id = (
      SELECT o.id
      FROM organizations o
      WHERE o.owner_user_id = media_titles.publisher_id
      LIMIT 1
    )
    WHERE organization_id IS NULL
  `);

  const copyTopics = db.prepare(`
    INSERT INTO opportunities (
      owner_user_id,
      organization_id,
      media_title_id,
      title,
      description,
      type,
      audience,
      reach,
      price,
      format,
      collaboration_type,
      contact,
      source_topic_id
    )
    SELECT
      t.publisher_id,
      mt.organization_id,
      t.media_title_id,
      t.title,
      t.description,
      'media_topic',
      t.target_audience,
      t.reach,
      t.price,
      t.format,
      t.collaboration_type,
      t.contact,
      t.id
    FROM topics t
    LEFT JOIN media_titles mt ON mt.id = t.media_title_id
    WHERE NOT EXISTS (
      SELECT 1 FROM opportunities o WHERE o.source_topic_id = t.id
    )
  `);

  const copyOccurrences = db.prepare(`
    INSERT INTO opportunity_occurrences (opportunity_id, publication_date)
    SELECT o.id, t.publication_date
    FROM opportunities o
    JOIN topics t ON t.id = o.source_topic_id
    WHERE NOT EXISTS (
      SELECT 1 FROM opportunity_occurrences oo WHERE oo.opportunity_id = o.id
    )
  `);

  const copyDeadlines = db.prepare(`
    INSERT INTO deadlines (opportunity_occurrence_id, deadline_type, deadline_date)
    SELECT oo.id, 'advertising', t.deadline_date
    FROM opportunity_occurrences oo
    JOIN opportunities o ON o.id = oo.opportunity_id
    JOIN topics t ON t.id = o.source_topic_id
    WHERE t.deadline_date IS NOT NULL
      AND t.deadline_date != ''
      AND NOT EXISTS (
        SELECT 1 FROM deadlines d WHERE d.opportunity_occurrence_id = oo.id
      )
  `);

  db.transaction(() => {
    createPublisherOrganizations.run();
    linkMediaTitles.run();
    copyTopics.run();
    copyOccurrences.run();
    copyDeadlines.run();
  })();
}

syncLegacyTopicsToOpportunities();

function seedOpportunityTaxonomy() {
  const seedTypes = db.prepare(`
    INSERT OR IGNORE INTO opportunity_types (value, label, sort_order)
    VALUES (?, ?, ?)
  `);
  const seedChannels = db.prepare(`
    INSERT OR IGNORE INTO opportunity_channels (value, label, sort_order)
    VALUES (?, ?, ?)
  `);
  const seedCategories = db.prepare(`
    INSERT OR IGNORE INTO opportunity_categories (value, label, sort_order)
    VALUES (?, ?, ?)
  `);

  db.transaction(() => {
    defaultOpportunityOptions.types.forEach((item, index) => {
      seedTypes.run(item.value, item.label, index + 1);
    });

    defaultOpportunityOptions.channels.forEach((value, index) => {
      seedChannels.run(normalizeOpportunityChannel(value), value, index + 1);
    });

    defaultOpportunityOptions.categories.forEach((value, index) => {
      seedCategories.run(value, value, index + 1);
    });
  })();
}

function listTaxonomyTable(tableName: 'opportunity_types' | 'opportunity_channels' | 'opportunity_categories', includeInactive = false) {
  let query = `SELECT id, value, label, description, is_active, sort_order FROM ${tableName}`;
  if (!includeInactive) {
    query += ' WHERE is_active = 1';
  }
  query += ' ORDER BY sort_order ASC, label ASC';
  return db.prepare(query).all();
}

function getOpportunityOptions(includeInactive = false) {
  return {
    types: listTaxonomyTable('opportunity_types', includeInactive),
    channels: listTaxonomyTable('opportunity_channels', includeInactive),
    categories: listTaxonomyTable('opportunity_categories', includeInactive),
  };
}

seedOpportunityTaxonomy();

function taxonomyTableFor(kind: string) {
  const tables: Record<string, 'opportunity_types' | 'opportunity_channels' | 'opportunity_categories'> = {
    types: 'opportunity_types',
    channels: 'opportunity_channels',
    categories: 'opportunity_categories',
  };
  return tables[kind];
}

function isAdminRequest(req: express.Request) {
  const userId = req.header('x-user-id') || req.query.admin_user_id || req.body?.admin_user_id;
  if (!userId) return false;

  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(Number(userId)) as any;
  return user?.role === 'admin';
}

function getDefaultOrganizationIdForOwner(ownerUserId: number | string) {
  const organization = db.prepare('SELECT id FROM organizations WHERE owner_user_id = ? LIMIT 1').get(Number(ownerUserId)) as any;
  return organization?.id || null;
}

function syncOpportunityTags(opportunityId: number | string, labels: string[]) {
  db.prepare('DELETE FROM opportunity_tags WHERE opportunity_id = ?').run(opportunityId);

  labels.forEach((label: string) => {
    const normalized = label.trim();
    if (!normalized) return;

    db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(normalized);
    const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(normalized) as any;
    if (tag) {
      db.prepare('INSERT OR IGNORE INTO opportunity_tags (opportunity_id, tag_id) VALUES (?, ?)').run(opportunityId, tag.id);
    }
  });
}

function syncTopicToOpportunity(topicId: number | string) {
  const topic = db.prepare(`
    SELECT
      t.*,
      mt.organization_id
    FROM topics t
    LEFT JOIN media_titles mt ON mt.id = t.media_title_id
    WHERE t.id = ?
  `).get(topicId) as any;

  if (!topic) return;

  const existing = db.prepare('SELECT id FROM opportunities WHERE source_topic_id = ?').get(topic.id) as any;
  let opportunityId = existing?.id as number | undefined;

  if (opportunityId) {
    db.prepare(`
      UPDATE opportunities
      SET
        owner_user_id = ?,
        organization_id = ?,
        media_title_id = ?,
        title = ?,
        description = ?,
        audience = ?,
        reach = ?,
        price = ?,
        format = ?,
        collaboration_type = ?,
        contact = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      topic.publisher_id,
      topic.organization_id,
      topic.media_title_id,
      topic.title,
      topic.description,
      topic.target_audience,
      topic.reach,
      topic.price,
      topic.format,
      topic.collaboration_type,
      topic.contact,
      opportunityId,
    );
  } else {
    const info = db.prepare(`
      INSERT INTO opportunities (
        owner_user_id,
        organization_id,
        media_title_id,
        title,
        description,
        type,
        audience,
        reach,
        price,
        format,
        collaboration_type,
        contact,
        source_topic_id
      )
      VALUES (?, ?, ?, ?, ?, 'media_topic', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      topic.publisher_id,
      topic.organization_id,
      topic.media_title_id,
      topic.title,
      topic.description,
      topic.target_audience,
      topic.reach,
      topic.price,
      topic.format,
      topic.collaboration_type,
      topic.contact,
      topic.id,
    );
    opportunityId = Number(info.lastInsertRowid);
  }

  let occurrence = db.prepare('SELECT id FROM opportunity_occurrences WHERE opportunity_id = ? ORDER BY id ASC LIMIT 1').get(opportunityId) as any;
  if (occurrence) {
    db.prepare(`
      UPDATE opportunity_occurrences
      SET publication_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(topic.publication_date, occurrence.id);
  } else {
    const info = db.prepare(`
      INSERT INTO opportunity_occurrences (opportunity_id, publication_date)
      VALUES (?, ?)
    `).run(opportunityId, topic.publication_date);
    occurrence = { id: Number(info.lastInsertRowid) };
  }

  if (topic.deadline_date) {
    const deadline = db.prepare('SELECT id FROM deadlines WHERE opportunity_occurrence_id = ? ORDER BY id ASC LIMIT 1').get(occurrence.id) as any;
    if (deadline) {
      db.prepare(`
        UPDATE deadlines
        SET deadline_type = 'advertising', deadline_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(topic.deadline_date, deadline.id);
    } else {
      db.prepare(`
        INSERT INTO deadlines (opportunity_occurrence_id, deadline_type, deadline_date)
        VALUES (?, 'advertising', ?)
      `).run(occurrence.id, topic.deadline_date);
    }
  } else {
    db.prepare('DELETE FROM deadlines WHERE opportunity_occurrence_id = ?').run(occurrence.id);
  }

  const labels = topic.labels ? JSON.parse(topic.labels) : [];
  syncOpportunityTags(opportunityId, labels);
}

function syncTopicsForMediaTitle(mediaTitleId: number | string) {
  const topics = db.prepare('SELECT id FROM topics WHERE media_title_id = ?').all(mediaTitleId) as any[];
  topics.forEach(topic => syncTopicToOpportunity(topic.id));
}

function deleteOpportunityForTopic(topicId: number | string) {
  const opportunity = db.prepare('SELECT id FROM opportunities WHERE source_topic_id = ?').get(topicId) as any;
  if (!opportunity) return;

  db.prepare(`
    DELETE FROM deadlines
    WHERE opportunity_occurrence_id IN (
      SELECT id FROM opportunity_occurrences WHERE opportunity_id = ?
    )
  `).run(opportunity.id);
  db.prepare('DELETE FROM opportunity_occurrences WHERE opportunity_id = ?').run(opportunity.id);
  db.prepare('DELETE FROM opportunity_tags WHERE opportunity_id = ?').run(opportunity.id);
  db.prepare('DELETE FROM opportunities WHERE id = ?').run(opportunity.id);
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
    let organization = db.prepare('SELECT id FROM organizations WHERE owner_user_id = ? LIMIT 1').get(Number(publisher_id)) as any;
    if (!organization) {
      const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(Number(publisher_id)) as any;
      const orgInfo = db.prepare(`
        INSERT INTO organizations (name, type, contact_email, owner_user_id)
        VALUES (?, 'publisher', ?, ?)
      `).run(user?.name || name, user?.email || contact || '', Number(publisher_id));
      organization = { id: Number(orgInfo.lastInsertRowid) };
    }

    const stmt = db.prepare('INSERT INTO media_titles (publisher_id, organization_id, name, contact, default_price, default_reach, default_target_audience, default_collaboration_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(Number(publisher_id), organization.id, name, contact || '', default_price || 0, default_reach || 0, default_target_audience || '', default_collaboration_type || 'Klasická inzerce');
    console.log("Title added to DB, ID:", info.lastInsertRowid);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error("Database error adding title:", err);
    res.status(500).json({ error: 'Chyba databáze při přidávání titulu' });
  }
});

app.delete('/api/media-titles/:id', (req, res) => {
  const topicIds = db.prepare('SELECT id FROM topics WHERE media_title_id = ?').all(req.params.id) as any[];
  topicIds.forEach(topic => deleteOpportunityForTopic(topic.id));
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

      syncTopicsForMediaTitle(titleId);
    });

    transaction();
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating title and propagating to topics:", err);
    res.status(500).json({ error: 'Chyba při aktualizaci titulu a témat' });
  }
});

app.get('/api/opportunity-options', (req, res) => {
  res.json(getOpportunityOptions(req.query.includeInactive === 'true'));
});

app.post('/api/admin/opportunity-taxonomy/:kind', (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const tableName = taxonomyTableFor(req.params.kind);
  if (!tableName) {
    return res.status(404).json({ error: 'Unknown taxonomy kind' });
  }

  const { value, label, description = '', sort_order = 0, is_active = 1 } = req.body;
  if (!value || !label) {
    return res.status(400).json({ error: 'Missing value or label' });
  }

  try {
    const normalizedValue = tableName === 'opportunity_channels'
      ? normalizeOpportunityChannel(value)
      : String(value).trim();

    const info = db.prepare(`
      INSERT INTO ${tableName} (value, label, description, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(normalizedValue, label, description, Number(sort_order), is_active ? 1 : 0);

    res.json({ id: info.lastInsertRowid });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Taxonomy value already exists' });
    }
    console.error('Error creating taxonomy item:', err);
    res.status(500).json({ error: 'Error creating taxonomy item' });
  }
});

app.put('/api/admin/opportunity-taxonomy/:kind/:id', (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const tableName = taxonomyTableFor(req.params.kind);
  if (!tableName) {
    return res.status(404).json({ error: 'Unknown taxonomy kind' });
  }

  const { value, label, description = '', sort_order = 0, is_active = 1 } = req.body;
  if (!value || !label) {
    return res.status(400).json({ error: 'Missing value or label' });
  }

  try {
    const normalizedValue = tableName === 'opportunity_channels'
      ? normalizeOpportunityChannel(value)
      : String(value).trim();

    db.prepare(`
      UPDATE ${tableName}
      SET value = ?, label = ?, description = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(normalizedValue, label, description, Number(sort_order), is_active ? 1 : 0, req.params.id);

    res.json({ success: true });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Taxonomy value already exists' });
    }
    console.error('Error updating taxonomy item:', err);
    res.status(500).json({ error: 'Error updating taxonomy item' });
  }
});

app.delete('/api/admin/opportunity-taxonomy/:kind/:id', (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const tableName = taxonomyTableFor(req.params.kind);
  if (!tableName) {
    return res.status(404).json({ error: 'Unknown taxonomy kind' });
  }

  db.prepare(`
    UPDATE ${tableName}
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(req.params.id);

  res.json({ success: true });
});

app.get('/api/opportunities', (req, res) => {
  const {
    search,
    type,
    category,
    channel,
    parent_opportunity_id,
    organization_id,
    owner_user_id,
    media_title_id,
    minPrice,
    maxPrice,
    format,
    collaboration_type,
    location,
    deadlineFrom,
    deadlineTo,
    dateFrom,
    dateTo,
    tag,
  } = req.query;

  let query = `
    SELECT
      o.*,
      parent.title as parent_opportunity_title,
      org.name as organization_name,
      org.type as organization_type,
      mt.name as media_title_name,
      oo.id as occurrence_id,
      oo.publication_date,
      oo.start_date,
      oo.end_date,
      d.id as deadline_id,
      d.deadline_type,
      d.deadline_date,
      GROUP_CONCAT(tags.name) as tag_names
    FROM opportunities o
    LEFT JOIN opportunities parent ON parent.id = o.parent_opportunity_id
    LEFT JOIN organizations org ON org.id = o.organization_id
    LEFT JOIN media_titles mt ON mt.id = o.media_title_id
    LEFT JOIN opportunity_occurrences oo ON oo.opportunity_id = o.id
    LEFT JOIN deadlines d ON d.opportunity_occurrence_id = oo.id
    LEFT JOIN opportunity_tags ot ON ot.opportunity_id = o.id
    LEFT JOIN tags ON tags.id = ot.tag_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    const searchTerms = (search as string).split(/[,\s]+/).filter(Boolean);
    if (searchTerms.length > 0) {
      query += ' AND (';
      query += searchTerms.map(() => `
        (
          o.title LIKE ?
          OR o.description LIKE ?
          OR o.category LIKE ?
          OR o.audience LIKE ?
          OR o.location LIKE ?
          OR org.name LIKE ?
          OR mt.name LIKE ?
          OR tags.name LIKE ?
        )
      `).join(' OR ');
      query += ')';

      searchTerms.forEach(term => {
        const searchParam = `%${term}%`;
        params.push(
          searchParam,
          searchParam,
          searchParam,
          searchParam,
          searchParam,
          searchParam,
          searchParam,
          searchParam,
        );
      });
    }
  }

  if (type) {
    query += ' AND o.type = ?';
    params.push(type);
  }
  if (category) {
    query += ' AND o.category = ?';
    params.push(category);
  }
  if (parent_opportunity_id) {
    query += ' AND o.parent_opportunity_id = ?';
    params.push(Number(parent_opportunity_id));
  }
  if (organization_id) {
    query += ' AND o.organization_id = ?';
    params.push(Number(organization_id));
  }
  if (owner_user_id) {
    query += ' AND o.owner_user_id = ?';
    params.push(Number(owner_user_id));
  }
  if (media_title_id) {
    query += ' AND o.media_title_id = ?';
    params.push(Number(media_title_id));
  }
  if (minPrice) {
    query += ' AND o.price >= ?';
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    query += ' AND o.price <= ?';
    params.push(Number(maxPrice));
  }
  if (format) {
    query += ' AND o.format = ?';
    params.push(normalizeOpportunityChannel(format as string));
  }
  if (channel) {
    query += ' AND o.format = ?';
    params.push(normalizeOpportunityChannel(channel as string));
  }
  if (collaboration_type) {
    query += ' AND o.collaboration_type = ?';
    params.push(collaboration_type);
  }
  if (location) {
    query += ' AND o.location LIKE ?';
    params.push(`%${location}%`);
  }
  if (deadlineFrom) {
    query += ' AND d.deadline_date >= ?';
    params.push(deadlineFrom);
  }
  if (deadlineTo) {
    query += ' AND d.deadline_date <= ?';
    params.push(deadlineTo);
  }
  if (dateFrom) {
    query += ' AND COALESCE(oo.start_date, oo.publication_date) >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    query += ' AND COALESCE(oo.end_date, oo.publication_date) <= ?';
    params.push(dateTo);
  }
  if (tag) {
    query += ' AND tags.name = ?';
    params.push(tag);
  }

  query += `
    GROUP BY o.id, oo.id, d.id
    ORDER BY
      CASE WHEN d.deadline_date IS NULL OR d.deadline_date = '' THEN 1 ELSE 0 END,
      d.deadline_date ASC,
      COALESCE(oo.start_date, oo.publication_date) ASC,
      o.title ASC
  `;

  const opportunities = db.prepare(query).all(...params).map((row: any) => {
    const { tag_names, ...opportunity } = row;
    return {
      ...opportunity,
      tags: tag_names ? String(tag_names).split(',') : [],
    };
  });

  res.json(opportunities);
});

app.get('/api/opportunities/:id', (req, res) => {
  const opportunity = db.prepare(`
    SELECT
      o.*,
      parent.title as parent_opportunity_title,
      org.name as organization_name,
      org.type as organization_type,
      org.website as organization_website,
      org.contact_email as organization_contact_email,
      mt.name as media_title_name
    FROM opportunities o
    LEFT JOIN opportunities parent ON parent.id = o.parent_opportunity_id
    LEFT JOIN organizations org ON org.id = o.organization_id
    LEFT JOIN media_titles mt ON mt.id = o.media_title_id
    WHERE o.id = ?
  `).get(req.params.id) as any;

  if (!opportunity) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  const occurrences = db.prepare(`
    SELECT * FROM opportunity_occurrences
    WHERE opportunity_id = ?
    ORDER BY COALESCE(start_date, publication_date) ASC
  `).all(req.params.id);

  const deadlines = db.prepare(`
    SELECT d.*
    FROM deadlines d
    JOIN opportunity_occurrences oo ON oo.id = d.opportunity_occurrence_id
    WHERE oo.opportunity_id = ?
    ORDER BY d.deadline_date ASC
  `).all(req.params.id);

  const tags = db.prepare(`
    SELECT tags.name
    FROM tags
    JOIN opportunity_tags ot ON ot.tag_id = tags.id
    WHERE ot.opportunity_id = ?
    ORDER BY tags.name ASC
  `).all(req.params.id).map((row: any) => row.name);

  const children = db.prepare(`
    SELECT
      o.*,
      org.name as organization_name,
      mt.name as media_title_name,
      oo.publication_date,
      oo.start_date,
      oo.end_date,
      d.deadline_type,
      d.deadline_date
    FROM opportunities o
    LEFT JOIN organizations org ON org.id = o.organization_id
    LEFT JOIN media_titles mt ON mt.id = o.media_title_id
    LEFT JOIN opportunity_occurrences oo ON oo.opportunity_id = o.id
    LEFT JOIN deadlines d ON d.opportunity_occurrence_id = oo.id
    WHERE o.parent_opportunity_id = ?
    ORDER BY o.price DESC, o.title ASC
  `).all(req.params.id);

  res.json({
    ...opportunity,
    occurrences,
    deadlines,
    tags,
    children,
  });
});

app.post('/api/opportunities', (req, res) => {
  const {
    owner_user_id,
    parent_opportunity_id,
    organization_id,
    media_title_id,
    title,
    description,
    type = 'media',
    category,
    audience,
    location,
    reach,
    price,
    format,
    channel,
    collaboration_type,
    contact,
    website,
    publication_date,
    start_date,
    end_date,
    deadline_type = 'advertising',
    deadline_date,
    deadline_notes,
    tags,
  } = req.body;

  if (!owner_user_id || !title) {
    return res.status(400).json({ error: 'Missing owner_user_id or title' });
  }

  try {
    const transaction = db.transaction(() => {
      const resolvedOrganizationId = organization_id
        ? Number(organization_id)
        : getDefaultOrganizationIdForOwner(owner_user_id);

      const info = db.prepare(`
        INSERT INTO opportunities (
          parent_opportunity_id,
          owner_user_id,
          organization_id,
          media_title_id,
          title,
          description,
          type,
          category,
          audience,
          location,
          reach,
          price,
          format,
          collaboration_type,
          contact,
          website
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        parent_opportunity_id ? Number(parent_opportunity_id) : null,
        Number(owner_user_id),
        resolvedOrganizationId,
        media_title_id ? Number(media_title_id) : null,
        title,
        description || '',
        type,
        category || '',
        audience || '',
        location || '',
        reach || 0,
        price || 0,
        normalizeOpportunityChannel(channel || format),
        collaboration_type || '',
        contact || '',
        website || '',
      );

      const opportunityId = Number(info.lastInsertRowid);
      let occurrenceId: number | null = null;

      if (publication_date || start_date || end_date) {
        const occurrenceInfo = db.prepare(`
          INSERT INTO opportunity_occurrences (opportunity_id, publication_date, start_date, end_date)
          VALUES (?, ?, ?, ?)
        `).run(opportunityId, publication_date || null, start_date || null, end_date || null);
        occurrenceId = Number(occurrenceInfo.lastInsertRowid);
      }

      if (deadline_date) {
        if (!occurrenceId) {
          const occurrenceInfo = db.prepare(`
            INSERT INTO opportunity_occurrences (opportunity_id)
            VALUES (?)
          `).run(opportunityId);
          occurrenceId = Number(occurrenceInfo.lastInsertRowid);
        }

        db.prepare(`
          INSERT INTO deadlines (opportunity_occurrence_id, deadline_type, deadline_date, notes)
          VALUES (?, ?, ?, ?)
        `).run(occurrenceId, deadline_type, deadline_date, deadline_notes || '');
      }

      syncOpportunityTags(opportunityId, tags || []);
      return opportunityId;
    });

    const id = transaction();
    res.json({ id });
  } catch (err) {
    console.error('Error creating opportunity:', err);
    res.status(500).json({ error: 'Error creating opportunity' });
  }
});

app.put('/api/opportunities/:id', (req, res) => {
  const {
    owner_user_id,
    parent_opportunity_id,
    organization_id,
    media_title_id,
    title,
    description,
    type = 'media',
    category,
    audience,
    location,
    reach,
    price,
    format,
    channel,
    collaboration_type,
    contact,
    website,
    publication_date,
    start_date,
    end_date,
    deadline_type = 'advertising',
    deadline_date,
    deadline_notes,
    tags,
  } = req.body;

  if (!owner_user_id || !title) {
    return res.status(400).json({ error: 'Missing owner_user_id or title' });
  }

  try {
    db.transaction(() => {
      const resolvedOrganizationId = organization_id
        ? Number(organization_id)
        : getDefaultOrganizationIdForOwner(owner_user_id);

      db.prepare(`
        UPDATE opportunities
        SET
          parent_opportunity_id = ?,
          owner_user_id = ?,
          organization_id = ?,
          media_title_id = ?,
          title = ?,
          description = ?,
          type = ?,
          category = ?,
          audience = ?,
          location = ?,
          reach = ?,
          price = ?,
          format = ?,
          collaboration_type = ?,
          contact = ?,
          website = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        parent_opportunity_id ? Number(parent_opportunity_id) : null,
        Number(owner_user_id),
        resolvedOrganizationId,
        media_title_id ? Number(media_title_id) : null,
        title,
        description || '',
        type,
        category || '',
        audience || '',
        location || '',
        reach || 0,
        price || 0,
        normalizeOpportunityChannel(channel || format),
        collaboration_type || '',
        contact || '',
        website || '',
        req.params.id,
      );

      let occurrence = db.prepare('SELECT id FROM opportunity_occurrences WHERE opportunity_id = ? ORDER BY id ASC LIMIT 1').get(req.params.id) as any;
      if (publication_date || start_date || end_date || deadline_date) {
        if (occurrence) {
          db.prepare(`
            UPDATE opportunity_occurrences
            SET publication_date = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(publication_date || null, start_date || null, end_date || null, occurrence.id);
        } else {
          const occurrenceInfo = db.prepare(`
            INSERT INTO opportunity_occurrences (opportunity_id, publication_date, start_date, end_date)
            VALUES (?, ?, ?, ?)
          `).run(req.params.id, publication_date || null, start_date || null, end_date || null);
          occurrence = { id: Number(occurrenceInfo.lastInsertRowid) };
        }
      }

      if (occurrence) {
        if (deadline_date) {
          const deadline = db.prepare('SELECT id FROM deadlines WHERE opportunity_occurrence_id = ? ORDER BY id ASC LIMIT 1').get(occurrence.id) as any;
          if (deadline) {
            db.prepare(`
              UPDATE deadlines
              SET deadline_type = ?, deadline_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(deadline_type, deadline_date, deadline_notes || '', deadline.id);
          } else {
            db.prepare(`
              INSERT INTO deadlines (opportunity_occurrence_id, deadline_type, deadline_date, notes)
              VALUES (?, ?, ?, ?)
            `).run(occurrence.id, deadline_type, deadline_date, deadline_notes || '');
          }
        } else {
          db.prepare('DELETE FROM deadlines WHERE opportunity_occurrence_id = ?').run(occurrence.id);
        }
      }

      syncOpportunityTags(req.params.id, tags || []);
    })();

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating opportunity:', err);
    res.status(500).json({ error: 'Error updating opportunity' });
  }
});

app.delete('/api/opportunities/:id', (req, res) => {
  try {
    db.transaction(() => {
      db.prepare(`
        DELETE FROM deadlines
        WHERE opportunity_occurrence_id IN (
          SELECT id FROM opportunity_occurrences WHERE opportunity_id = ?
        )
      `).run(req.params.id);
      db.prepare('DELETE FROM opportunity_occurrences WHERE opportunity_id = ?').run(req.params.id);
      db.prepare('DELETE FROM opportunity_tags WHERE opportunity_id = ?').run(req.params.id);
      db.prepare('DELETE FROM opportunities WHERE id = ?').run(req.params.id);
    })();

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting opportunity:', err);
    res.status(500).json({ error: 'Error deleting opportunity' });
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
  const transaction = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO topics (publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(publisher_id, media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels ? JSON.stringify(labels) : null);
    syncTopicToOpportunity(info.lastInsertRowid as number);
    return info.lastInsertRowid;
  });

  const id = transaction();
  res.json({ id });
});

app.put('/api/topics/:id', (req, res) => {
  const { media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels } = req.body;
  db.transaction(() => {
    const stmt = db.prepare(`
      UPDATE topics SET media_title_id = ?, media_name = ?, title = ?, description = ?, publication_date = ?, deadline_date = ?, price = ?, format = ?, collaboration_type = ?, contact = ?, target_audience = ?, reach = ?, labels = ?
      WHERE id = ?
    `);
    stmt.run(media_title_id, media_name, title, description, publication_date, deadline_date, price, format, collaboration_type, contact, target_audience, reach, labels ? JSON.stringify(labels) : null, req.params.id);
    syncTopicToOpportunity(req.params.id);
  })();
  res.json({ success: true });
});

app.delete('/api/topics/:id', (req, res) => {
  db.transaction(() => {
    deleteOpportunityForTopic(req.params.id);
    db.prepare('DELETE FROM topics WHERE id = ?').run(req.params.id);
  })();
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

app.post('/api/admin/users', (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const {
    email,
    password,
    role = 'publisher',
    name,
    organization_type = 'publisher',
    website = '',
    contact_email = '',
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing email, password or name' });
  }

  const allowedRoles = new Set(['publisher', 'client', 'admin']);
  if (!allowedRoles.has(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const newUserId = db.transaction(() => {
      const userInfo = db.prepare(`
        INSERT INTO users (email, password, role, name, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(email, password, role, name);

      const userId = Number(userInfo.lastInsertRowid);
      if (role === 'publisher') {
        db.prepare(`
          INSERT INTO organizations (name, type, website, contact_email, owner_user_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(name, organization_type || 'publisher', website || '', contact_email || email, userId);
      }

      return userId;
    })();

    res.json({ id: newUserId });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    console.error('Error creating admin user:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
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
