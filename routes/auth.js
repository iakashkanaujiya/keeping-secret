const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();
const { body } = require('express-validator');


router.post('/login', [
    body('email', "Enter a valid email").isEmail(),
    body('password',"Password cannot be blank").exists()
], authController.login)


router.post('/signup', [
    body('name', "Enter a valid name").isLength({ min: 3 }),
    body('email',"Enter a valid email").isEmail(),
    body('password', "Enter a valid password").isLength({ min: 3 }),   
], authController.signup)

module.exports = router;