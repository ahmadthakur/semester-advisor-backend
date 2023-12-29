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
    ProgrammingFundamentals: normalize(item.input.ProgrammingFundamentals),
    IntroductionToComputing: normalize(item.input.IntroductionToComputing),
    Calculus1: normalize(item.input.Calculus1),
  },
  output: {
    WebDevelopment: normalize(item.output.WebDevelopment),
    MobileAppDevelopment: normalize(item.output.MobileAppDevelopment),
    SoftwareEngineering: normalize(item.output.SoftwareEngineering),
    DatabaseManagement: normalize(item.output.DatabaseManagement),
    OperatingSystems: normalize(item.output.OperatingSystems),
    ComputerNetworks: normalize(item.output.ComputerNetworks),
    ArtificialIntelligence: normalize(item.output.ArtificialIntelligence),
    MachineLearning: normalize(item.output.MachineLearning),
    DataStructures: normalize(item.output.DataStructures),
    Algorithms: normalize(item.output.Algorithms),
  },
}));

// Create a new instance of brain.NeuralNetwork
const net = new brain.NeuralNetwork({ hiddenLayers: [20, 20, 20] });

// Train the model
net.train(trainingData);

// Export the trained model to a JSON file
const json = net.toJSON();
fs.writeFileSync("model.json", JSON.stringify(json));
