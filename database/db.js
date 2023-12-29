const sqlite3 = require("sqlite3").verbose();

// Create a new SQLite database in memory
const db = new sqlite3.Database("./students.db");

// Or, if you want to connect to an existing SQLite database file
// const db = new sqlite3.Database('path/to/your/database/file.db');

// Example: Creating tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY,
      student_id INTEGER,
      course_name TEXT NOT NULL,
      grade TEXT NOT NULL,
      semester INTEGER NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);
});

// Close the database connection when done
db.close();
