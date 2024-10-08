var express = require('express');
var router = express.Router();

const db = require('../db');

router.get('/login', async (req, res, next) => {
  if (!req.cookies.login)
    res.render('login');
  else
    res.redirect('/');
});

router.post('/login', async (req, res, next) => {
  const login = req.body.login;
  const password = req.body.password;
  const result = await db.query('SELECT * FROM ur_cons.worker WHERE login = $1::text AND password = $2::text', [
    login, password
  ]);
  console.log(result.rows);
  if (result.rowCount < 1) {
    res.redirect('/login');
  } else {
    res.cookie('login', result.rows[0].login);
    res.cookie('password', result.rows[0].password);
    res.cookie('name', result.rows[0].admin);
    res.cookie('id', result.rows[0].id);
    res.redirect('/');
  }
});

module.exports = router;
