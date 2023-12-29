const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// User registration endpoint
router.post("/register", userController.register);

// User login endpoint
router.post("/login", userController.login);

// User logout endpoint
router.post("/logout", userController.logout);

// User profile endpoint
router.get("/profile", userController.profile);

// User dashboard endpoint
router.get("/dashboard", userController.dashboard);

// User grades endpoint
router.post("/grades", userController.grades);

// User update grades
router.post("/updategrades", userController.updateGrades);

// User view grades endpoint
router.get("/grades/view", userController.viewGrades);

// User recommendation endpoint
router.get("/recommendation", userController.recommendCourses);

// Check session endpoint
router.get("/checksession", userController.checkSession);

module.exports = router;
