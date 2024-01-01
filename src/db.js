const sqlite = require('better-sqlite3');

// SQLite database setup
const db = sqlite(process.env.PATH_TO_PRODUCTS_DB || 'products.db', { verbose: console.log });

// Create or modify the 'products' table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    ingredients TEXT,
    source TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db