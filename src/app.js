const express = require("express");
const brain = require("brain.js");
const fs = require("fs");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const cors = require("cors");
const cjs = require("constraintjs");

// Denormalize a score from 0-1 to 50-100
function denormalize(score) {
  return score * 50 + 50;
}

// Normalize a score between 0 and 1
function normalize(score) {
  return (score - 50) / 50;
}

// Load the model from the JSON file
const json = JSON.parse(fs.readFileSync("model.json", "utf8"));
const net = new brain.NeuralNetwork();
net.fromJSON(json);

// Create an Express application
const app = express();

const corsOptions = {
  origin: "http://localhost:3000", // your frontend origin
  credentials: true,
};

app.use(
  cors(
    corsOptions // your frontend origin
  )
);

// Use JSON middleware to automatically parse JSON
app.use(express.json());

// Use cookie parser to parse cookies
app.use(cookieParser("blubberblubberblubber"));

// Use sessions to keep track of users
app.use(
  session({
    store: new FileStore(),
    secret: "blubberblubberblubber",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" }, // Note: secure should be set to true when in a production environment and the site is served over HTTPS
  })
);

// User endpoints
app.use("/user", userRouter);

// Define a POST endpoint for making predictions
app.post("/predict", (req, res) => {
  const student = {
    IntroductionToComputing: normalize(req.body.IntroductionToComputing),
    IntroductionToProgramming: normalize(req.body.IntroductionToProgramming),
    EnglishComprehension: normalize(req.body.EnglishComprehension),
    CalculusAndAnalyticalGeometry: normalize(
      req.body.CalculusAndAnalyticalGeometry
    ),
    Physics: normalize(req.body.Physics),

    GeneralMathematics: normalize(req.body.GeneralMathematics),
    // PakistanStudies: normalize(req.body.PakistanStudies),
    // IntroductionToELearning: normalize(req.body.IntroductionToELearning),
    // Economics: normalize(req.body.Economics),
    // IntroductionToBusiness: normalize(req.body.IntroductionToBusiness),
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
  for (let course in req.body) {
    if (req.body[course] < 50) {
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

  // Divide the remaining courses into thirds
  // const third = Math.ceil(remainingCourses.length / 3);
  // const remainingCourses1 = remainingCourses.slice(0, third);
  // const remainingCourses2 = remainingCourses.slice(third, 2 * third);
  // const remainingCourses3 = remainingCourses.slice(2 * third);

  // Distribute the remaining courses across the semesters
  // semesters.semester2.push(...remainingCourses1);
  // semesters.semester3.push(...remainingCourses2);
  // semesters.semester4.push(...remainingCourses3);

  semesters.semester2 = allCourses.slice(0, 6);
  semesters.semester3 = allCourses.slice(6, 12);
  semesters.semester4 = allCourses.slice(12, 18);

  res.json(semesters);
});
// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
