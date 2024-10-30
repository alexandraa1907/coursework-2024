var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users');

router.get('/login', usersController.loginGet);

router.post('/login', usersController.loginPost);

module.exports = router;
