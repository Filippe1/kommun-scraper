
// createdb.js
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// Load JSON file
const rawData = fs.readFileSync("output/nyheter.json"); // <-- your JSON file
const pages = JSON.parse(rawData);

// Create / open database
const db = new sqlite3.Database("./db/my_database.db");

// Create table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL,
      title TEXT,
      text TEXT,           -- combined paragraphs as single text
      headings TEXT,       -- stored as JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO pages (url, title, text, headings)
    VALUES (?, ?, ?, ?)
  `);

  pages.forEach(page => {
    const url = page.url;
    const title = page.content.title;
    const headings = JSON.stringify(page.content.headings);
    
    // Combine paragraphs into a single text string
    const text = page.content.paragraphs
      .filter(paragraph => paragraph.trim().length > 0) // Remove empty paragraphs
      .join('\n\n'); // Join with double newlines for separation

    stmt.run(url, title, text, headings);
  });

  stmt.finalize();
});

// Verify insertion
db.each("SELECT id, url, title FROM pages", (err, row) => {
  if (err) {
    console.error(err);
  } else {
    console.log(row);
  }
});

// Close database
db.close();