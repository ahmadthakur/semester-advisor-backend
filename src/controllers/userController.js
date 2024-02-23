const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const brain = require("brain.js");
const fs = require("fs");

// Create a new SQLite database in memory
const db = new sqlite3.Database("./students.db");

// Normalize a score between 0 and 1
function normalize(score) {
  return (score - 50) / 50;
}

// Load the model from the JSON file
const json = JSON.parse(fs.readFileSync("model.json", "utf8"));
const net = new brain.NeuralNetwork();
net.fromJSON(json);

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

  const {
    IntroductionToComputing,
    IntroductionToProgramming,
    EnglishComprehension,
    CalculusAndAnalyticalGeometry,
    Physics,
  } = req.body;

  db.run(
    `
        INSERT INTO grades (student_id, IntroductionToComputing, IntroductionToProgramming, EnglishComprehension, CalculusAndAnalyticalGeometry, Physics)
        VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      IntroductionToComputing,
      IntroductionToProgramming,
      EnglishComprehension,
      CalculusAndAnalyticalGeometry,
      Physics,
    ],
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

  const {
    IntroductionToComputing,
    IntroductionToProgramming,
    EnglishComprehension,
    CalculusAndAnalyticalGeometry,
    Physics,
  } = req.body;

  const fieldsToUpdate = [];
  const values = [];

  if (IntroductionToComputing) {
    fieldsToUpdate.push("IntroductionToComputing = ?");
    values.push(IntroductionToComputing);
  }

  if (IntroductionToProgramming) {
    fieldsToUpdate.push("IntroductionToProgramming = ?");
    values.push(IntroductionToProgramming);
  }

  if (EnglishComprehension) {
    fieldsToUpdate.push("EnglishComprehension = ?");
    values.push(EnglishComprehension);
  }

  if (CalculusAndAnalyticalGeometry) {
    fieldsToUpdate.push("CalculusAndAnalyticalGeometry = ?");
    values.push(CalculusAndAnalyticalGeometry);
  }

  if (Physics) {
    fieldsToUpdate.push("Physics = ?");
    values.push(Physics);
  }

  values.push(userId);

  if (fieldsToUpdate.length > 0) {
    const sql = `UPDATE grades SET ${fieldsToUpdate.join(
      ", "
    )} WHERE student_id = ?`;

    db.run(sql, values, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Grades updated successfully!" });
    });
  } else {
    res.json({ message: "No fields to update!" });
  }
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

    const student = {
      IntroductionToComputing: normalize(user.IntroductionToComputing),
      IntroductionToProgramming: normalize(user.IntroductionToProgramming),
      EnglishComprehension: normalize(user.EnglishComprehension),
      CalculusAndAnalyticalGeometry: normalize(
        user.CalculusAndAnalyticalGeometry
      ),
      Physics: normalize(user.Physics),
    };

    const scores = net.run(student);

    console.log(scores);

    // Extract the courses for each semester
    const semesters = {
      semester2: [],
      semester3: [],
      semester4: [],
    };

    // Determine failed courses
    const failedCourses = [];
    for (let course in user) {
      if (user[course] < 50) {
        failedCourses.push(course);
      }
    }

    // Add failed courses to the next semester
    semesters.semester2.push(...failedCourses);

    // Get the remaining courses
    const remainingCourses = Object.keys(scores).filter(
      (course) => !failedCourses.includes(course)
    );

    // Combine failed and remaining courses
    const allCourses = [...failedCourses, ...remainingCourses];

    // Prerequisite mapping
    const prerequisites = {
      BusinessAndTechnicalEnglishWriting: "EnglishComprehension",
      DiscreteMathematics: "CalculusAndAnalyticalGeometry",
      LinearAlgebra: "CalculusAndAnalyticalGeometry",
      DataStructures: "IntroductionToProgramming",
      ObjectOrientedProgramming: "IntroductionToProgramming",
      DataCommunication: "IntroductionToComputing",
      DatabaseManagementSystems: "IntroductionToProgramming",
      SoftwareEngineeringI: "IntroductionToProgramming",
      OperatingSystems: "DataStructures",
      ComputerNetworks: "DataCommunication",
    };

    // Check if a failed course is a prerequisite for any other course
    for (let course of failedCourses) {
      const futureCourses = Object.keys(prerequisites).filter(
        (key) => prerequisites[key] === course
      );
      for (let futureCourse of futureCourses) {
        const index = allCourses.indexOf(futureCourse);
        if (index !== -1) {
          allCourses.splice(index, 1);
          allCourses.push(futureCourse);
        }
      }
    }

    semesters.semester2 = allCourses.slice(0, 6);
    semesters.semester3 = allCourses.slice(6, 12);
    semesters.semester4 = allCourses.slice(12, 18);

    res.json(semesters);
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
