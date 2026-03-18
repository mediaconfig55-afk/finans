import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDBPromise = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('finansdb.db');
  }
  return dbPromise;
};

const DB_VERSION = 3;

async function getMigrationVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    await db.execAsync('CREATE TABLE IF NOT EXISTS db_meta (key TEXT PRIMARY KEY, value TEXT)');
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM db_meta WHERE key = 'db_version'"
    );
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}

async function setMigrationVersion(db: SQLite.SQLiteDatabase, version: number) {
  await db.runAsync(
    "INSERT OR REPLACE INTO db_meta (key, value) VALUES ('db_version', ?)",
    [version.toString()]
  );
}

export const initDatabase = async () => {
  const db = await getDBPromise();
  try {
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // === Version 1: Initial schema ===
    await db.execAsync(`
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
        paidAmount REAL DEFAULT 0,
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

    // === Versioned Migrations ===
    const currentVersion = await getMigrationVersion(db);

    if (currentVersion < 1) {
      // Migration v1: Add paidAmount column to debts (if missing from initial create)
      try {
        await db.execAsync('ALTER TABLE debts ADD COLUMN paidAmount REAL DEFAULT 0;');
      } catch {
        // Column already exists from CREATE TABLE
      }
    }

    if (currentVersion < 2) {
      // Migration v2: Create db_meta table (already created in getMigrationVersion)
    }

    if (currentVersion < 3) {
      // Migration v3: Add tags column to transactions
      try {
        await db.execAsync('ALTER TABLE transactions ADD COLUMN tags TEXT;');
      } catch {
        // Column already exists
      }
    }

    // Add new migrations above this line following the pattern:
    // if (currentVersion < N) { ... }
    // Then increment DB_VERSION at the top.

    await setMigrationVersion(db, DB_VERSION);

    console.log(`Database initialized successfully (v${DB_VERSION})`);
  } catch (error) {
    console.error('Critical Error initializing database:', error);
    // Throw the error so the app/UI can catch it and show an ErrorBoundary or alert, 
    // rather than continuing with a broken database state.
    throw error;
  }
};

export const getDB = () => getDBPromise();
