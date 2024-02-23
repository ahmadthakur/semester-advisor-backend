const brain = require("brain.js");
const fs = require("fs");

// Normalize a score between 0 and 1
function normalize(score) {
  return (score - 50) / 50;
}

// Read the training data from the file
const rawData = JSON.parse(fs.readFileSync("training_data.json", "utf8"));

// Generate normalized training data
const trainingData = rawData.map((item) => ({
  input: {
    IntroductionToComputing: normalize(item.input.IntroductionToComputing),
    EnglishComprehension: normalize(item.input.EnglishComprehension),
    CalculusAndAnalyticalGeometry: normalize(
      item.input.CalculusAndAnalyticalGeometry
    ),
    Physics: normalize(item.input.Physics),
    Economics: normalize(item.input.Economics),
    IntroductionToBusiness: normalize(item.input.IntroductionToBusiness),
    GeneralMathematics: normalize(item.input.GeneralMathematics),
    PakistanStudies: normalize(item.input.PakistanStudies),
    IntroductionToELearning: normalize(item.input.IntroductionToELearning),
  },
  output: {
    ...item.output.semester2.reduce(
      (obj, course) => ({ ...obj, [course]: 1 }),
      {}
    ),
    ...item.output.semester3.reduce(
      (obj, course) => ({ ...obj, [course]: 1 }),
      {}
    ),
    ...item.output.semester4.reduce(
      (obj, course) => ({ ...obj, [course]: 1 }),
      {}
    ),
  },
}));

// Create a new instance of brain.NeuralNetwork
const net = new brain.NeuralNetwork({ hiddenLayers: [20, 20, 20] });

// Train the model
net.train(trainingData);

// Export the trained model to a JSON file
const json = net.toJSON();
fs.writeFileSync("model.json", JSON.stringify(json));
