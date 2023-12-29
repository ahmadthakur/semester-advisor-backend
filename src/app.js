const express = require("express");
const brain = require("brain.js");
const fs = require("fs");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const cors = require("cors");

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
    ProgrammingFundamentals: normalize(req.body.ProgrammingFundamentals),
    IntroductionToComputing: normalize(req.body.IntroductionToComputing),
    Calculus1: normalize(req.body.Calculus1),
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

  // Select the three courses with the highest scores
  const recommendations = courses.slice(0, 3).map((course) => course[0]);

  // Send the recommendations as the response
  res.json(recommendations);
});

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
