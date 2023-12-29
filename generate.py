import json
import random

courses = [
    "WebDevelopment",
    "MobileAppDevelopment",
    "SoftwareEngineering",
    "DatabaseManagement",
    "OperatingSystems",
    "ComputerNetworks",
    "ArtificialIntelligence",
    "MachineLearning",
    "DataStructures",
    "Algorithms"
]

data = []

for _ in range(1500):
    pf_score = random.randint(50, 100)
    itc_score = random.randint(50, 100)
    c1_score = random.randint(50, 100)

    input_data = {
        "ProgrammingFundamentals": pf_score,
        "IntroductionToComputing": itc_score,
        "Calculus1": c1_score
    }

    output_data = {}
    for course in courses:
        if course in ["ArtificialIntelligence", "MachineLearning"]:
            output_data[course] = c1_score + random.randint(-10, 10)
        elif course in ["WebDevelopment", "SoftwareEngineering", "DataStructures", "Algorithms"]:
            output_data[course] = pf_score + random.randint(-10, 10)
        elif course in ["MobileAppDevelopment", "DatabaseManagement", "OperatingSystems", "ComputerNetworks"]:
            output_data[course] = itc_score + random.randint(-10, 10)

    data.append({
        "input": input_data,
        "output": output_data
    })

with open('training_data.json', 'w') as f:
    json.dump(data, f)