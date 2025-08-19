const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const dbPath = path.join(__dirname, '..', 'users.db');

console.log('Initializing SQLite database...');
console.log('Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

async function initializeTables() {
  try {
    // Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Users table created successfully');

    // Check if admin user exists
    const adminUser = await getQuery('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (!adminUser) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await runQuery(
        'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@example.com', hashedPassword, 'System Administrator', 'admin']
      );
      console.log('Default admin user created:');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create indexes for better performance
    await runQuery('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    
    console.log('Database indexes created successfully');
    console.log('Database initialization completed!');
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Helper function to run queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper function to get single row
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
} 