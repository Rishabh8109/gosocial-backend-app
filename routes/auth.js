const express = require('express');
const {
    register,
    profilePictureUpload,
    login
} = require('../controllers/auth');
const router = express.Router();

// api routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/:userid/upload').post(profilePictureUpload);

module.exports = router;