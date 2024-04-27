const express = require('express');

const usersController = require('../controllers/users');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', usersController.getAllUsers);

router.post('/signup', usersController.signUp);

router.post('/login', usersController.login);

router.get('/avatars', usersController.getAvatars);

router.patch('/update/profile', checkAuth, usersController.updateUserImage);

router.get('/profile/:userId', checkAuth, usersController.getProfile);


module.exports = router;