import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.resolve("expenses.db");
console.error(`Database: ${dbPath}`);

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(category_id, name)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    subcategory_id INTEGER NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
  );
`);

export default db;
