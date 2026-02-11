import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDBPromise = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('finansdb.db');
  }
  return dbPromise;
};

export const initDatabase = async () => {
  const db = await getDBPromise();
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS installments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        totalAmount REAL NOT NULL,
        totalMonths INTEGER NOT NULL,
        remainingMonths INTEGER NOT NULL,
        startDate TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        installmentId INTEGER,
        FOREIGN KEY (installmentId) REFERENCES installments(id)
      );

      CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK (type IN ('debt', 'receivable')),
        personName TEXT NOT NULL,
        amount REAL NOT NULL,
        dueDate TEXT,
        isPaid INTEGER DEFAULT 0,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        dayOfMonth INTEGER NOT NULL,
        type TEXT DEFAULT 'bill'
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const getDB = () => getDBPromise();
