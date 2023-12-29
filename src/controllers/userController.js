const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const brain = require("brain.js");
const fs = require("fs");

// Create a new SQLite database in memory
const db = new sqlite3.Database("./students.db");

// User registration endpoint
exports.register = (req, res) => {
  // Extract the data from the request body
  const { username, password, fullName, email } = req.body;

  // If username or email already exists, send an error otherwise create a new user

  db.get(
    `
        SELECT * FROM students WHERE username = ? OR email = ?
    `,
    [username, email],
    (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (user) {
        res.status(400).json({ error: "Username or email already exists" });
        return;
      } else {
        // Create a new user
        const user = {
          username,
          password,
          fullName,
          email,
        };

        const id = uuidv4();

        // Save the user in the database
        db.run(
          `
              INSERT INTO students (id, username, password, full_name, email)
              VALUES (?, ?, ?, ?, ?)
          `,
          [id, user.username, user.password, user.fullName, user.email],
          (err) => {
            if (err) {
              // If there's an error, it most likely means the username already exists
              res.status(400).json({ error: err.message });
              return;
            }

            // Send a success message
            res.json({
              message: "User registered successfully!",
            });
          }
        );
      }
    }
  );
};

// User login endpoint
exports.login = (req, res) => {
  // Extract the data from the request body
  const { username, password } = req.body;

  // Find the user in the database
  db.get(
    `
        SELECT * FROM students WHERE username = ? AND password = ?
    `,
    [username, password],
    (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (user) {
        // Send a success message
        req.session.userId = user.id;
        req.session.save((err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({
            message: "User logged in successfully!",
          });
        });
      } else {
        res.status(401).json({ error: "Incorrect username or password" });
      }
    }
  );
};

// User logout endpoint
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.clearCookie("connect.sid", { path: "/" });
    res.status(200).json({ message: "User logged out successfully!" });
  });
};

// Protected Routes
// User profile endpoint
exports.profile = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  db.get("SELECT * FROM students WHERE id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });
};

// User dashboard endpoint
exports.dashboard = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  db.get("SELECT * FROM students WHERE id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });
};

// User update endpoint
exports.update = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const { username, password, fullName, email } = req.body;

  db.run(
    `
        UPDATE students SET username = ?, password = ?, full_name = ?, email = ? WHERE id = ?
    `,
    [username, password, fullName, email, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "User updated successfully!" });
    }
  );
};

// First semester grades endpoint. Add grades in a grades table in the database with student id as a foreign key
exports.grades = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const { ProgrammingFundamentals, IntroductionToComputing, Calculus1 } =
    req.body;

  db.run(
    `
        INSERT INTO grades (student_id, ProgrammingFundamentals, IntroductionToComputing, Calculus1)
        VALUES (?, ?, ?, ?)
    `,
    [userId, ProgrammingFundamentals, IntroductionToComputing, Calculus1],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Grades added successfully!" });
    }
  );
};

// Updaate grades endpoint
exports.updateGrades = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const { ProgrammingFundamentals, IntroductionToComputing, Calculus1 } =
    req.body;

  db.run(
    `
        UPDATE grades SET ProgrammingFundamentals = ?, IntroductionToComputing = ?, Calculus1 = ? WHERE student_id = ?
    `,
    [ProgrammingFundamentals, IntroductionToComputing, Calculus1, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Grades updated successfully!" });
    }
  );
};

// View grades endpoint
exports.viewGrades = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  db.get("SELECT * FROM grades WHERE student_id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "Grades not found" });
    }
    res.json(user);
  });
};

// Get the grades for the student from the grades database and then make a prediction
exports.recommendCourses = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  db.get("SELECT * FROM grades WHERE student_id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "Grades not found" });
    }

    const json = JSON.parse(fs.readFileSync("model.json", "utf8"));
    const net = new brain.NeuralNetwork();
    net.fromJSON(json);

    // Denormalize a score from 0-1 to 50-100
    function denormalize(score) {
      return score * 50 + 50;
    }

    // Normalize a score between 0 and 1
    function normalize(score) {
      return (score - 50) / 50;
    }

    const student = {
      ProgrammingFundamentals: normalize(user.ProgrammingFundamentals),
      IntroductionToComputing: normalize(user.IntroductionToComputing),
      Calculus1: normalize(user.Calculus1),
    };

    const scores = net.run(student);

    // Denormalize the scores
    const denormalizedScores = {};
    for (let course in scores) {
      denormalizedScores[course] = denormalize(scores[course]);
    }

    // Convert the scores to an array of [course, score] pairs
    const courses = Object.entries(denormalizedScores);

    // Sort the courses by score in descending order
    courses.sort((a, b) => b[1] - a[1]);

    // Send the top 3 courses
    res.json(courses.slice(0, 3));
  });
};

// Check session endpoint
exports.checkSession = (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.json({ isLoggedIn: false });
  }

  return res.json({ isLoggedIn: true });
};
