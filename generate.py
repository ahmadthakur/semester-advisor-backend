import json
import random

# Define the courses for each semester
semesters = {
    "semester1": ["IntroductionToComputing", "EnglishComprehension", "CalculusAndAnalyticalGeometry", "Physics", "Economics", "IntroductionToBusiness", "GeneralMathematics", "PakistanStudies", "IntroductionToELearning", "IntroductionToProgramming"],
    "semester2": ["BusinessAndTechnicalEnglishWriting", "DiscreteMathematics", "LinearAlgebra", "PrinciplesOfMarketing", "PrinciplesOfManagement", "SetsAndLogic"],
    "semester3": ["DataStructures", "ObjectOrientedProgramming", "DataCommunication", "ProfessionalPractices", "FinancialManagement", "HumanResourceManagement"],
    "semester4": ["DatabaseManagementSystems", "SoftwareEngineeringI", "OperatingSystems", "ComputerNetworks", "StatisticsAndProbability"]
}

# Define the prerequisites for each course
prerequisites = {
    "BusinessAndTechnicalEnglishWriting": "EnglishComprehension",
    "DiscreteMathematics": "CalculusAndAnalyticalGeometry",
    "LinearAlgebra": "CalculusAndAnalyticalGeometry",
    "DataStructures": "IntroductionToProgramming",
    "ObjectOrientedProgramming": "IntroductionToProgramming",
    "DataCommunication": "IntroductionToComputing",
    "DatabaseManagementSystems": "IntroductionToProgramming",
    "SoftwareEngineeringI": "IntroductionToProgramming",
    "OperatingSystems": "DataStructures",
    "ComputerNetworks": "DataCommunication",
}

data = []

for _ in range(1500):
    # Generate random scores for the first semester courses
    input_data = {course: random.randint(50, 100)
                  for course in semesters["semester1"]}

    all_scores = input_data.copy()
    output_data = {}
    for semester in ["semester2", "semester3", "semester4"]:
        semester_data = {}
        for course in semesters[semester]:
            prerequisite = prerequisites.get(course)
            if prerequisite and prerequisite in all_scores:
                # If the course has a prerequisite, its score is based on the score of the prerequisite
                semester_data[course] = all_scores[prerequisite] + \
                    random.randint(-10, 10)
            else:
                # If the course doesn't have a prerequisite, its score is generated randomly
                semester_data[course] = random.randint(50, 100)

        # Check if any of the courses have a score less than 50
        failed_courses = [course for course,
                          score in semester_data.items() if score < 50]

        # If there are failed courses, add them to the next semester
        if failed_courses and semester != "semester4":
            next_semester = "semester" + str(int(semester[-1]) + 1)
            semesters[next_semester] = failed_courses + \
                semesters[next_semester]

        # Add the course names for the current semester to the output data
        output_data[semester] = list(semester_data.keys())

        # Add the scores for the current semester to the all_scores dictionary
        all_scores.update(semester_data)

    data.append({
        "input": input_data,
        "output": output_data
    })

with open('training_data.json', 'w') as f:
    json.dump(data, f)
