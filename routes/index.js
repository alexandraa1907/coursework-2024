var express = require('express');
var router = express.Router();

var { extractCredentials } = require('../midleware/extractCredentials');

const db = require('../db');

router.get('/', extractCredentials, async (req, res, next) => {
  let lawyers = [];
  try {
    const result = await db.query(`
      SELECT l.id, l.name, l.id_special, s.name AS spec, p.price
      FROM ur_cons.lawyer l
      INNER JOIN ur_cons.special s ON l.id_special = s.id
      INNER JOIN ur_cons.price p ON s.id = p.id_special`);
    lawyers = result.rows;
  } catch (err) {
    console.error(err);
  }
  res.render('index', { lawyers, admin: req.user });
});

router.get('/queries', extractCredentials, async (req, res, next) => {
  const lawyersResult = await db.query(`
    SELECT l.id, l.name, l.id_special, s.name AS spec, p.price
    FROM ur_cons.lawyer l
    INNER JOIN ur_cons.special s ON l.id_special = s.id
    INNER JOIN ur_cons.price p ON s.id = p.id_special`);
  let lawyers = lawyersResult.rows;
  const specialsResult = await db.query(`
    SELECT s.id, s.name, p.price
    FROM ur_cons.special s
    INNER JOIN ur_cons.price p ON s.id = p.id_special`);
  let specials = specialsResult.rows;
  // Запит 1
  const query1Result = await db.query(`
    SELECT s."name" AS special, COUNT(l.id) AS lawyer_count 
    FROM ur_cons.lawyer l
    JOIN ur_cons.special s ON s.id = l.id_special 
    GROUP BY s."name"
    ORDER BY COUNT(l.id) DESC;
  `);
  let query1 = query1Result.rows;
  // Кінець запиту 1
  res.render('queries', { lawyers, specials, query1 });
});

router.post('/create-special', extractCredentials, async (req, res, next) => {
  const specialIdResult = await db.query('INSERT INTO ur_cons.special (name) VALUES ($1::text) RETURNING id', [
    req.body.name
  ]);
  const specialId = specialIdResult.rows[0].id;
  await db.query('INSERT INTO ur_cons.price (price, id_special) VALUES ($1::int, $2::int)', [
    req.body.price, specialId
  ]);
  res.redirect('/queries');
});

router.post('/delete-lawyer/:id', extractCredentials, async (req, res, next) => {
  await db.query(`
    DELETE FROM ur_cons.lawyer l WHERE l.id = $1::int
  `, [req.params.id]);
  res.redirect('/queries');
});

router.post('/create-lawyer', extractCredentials, async (req, res, next) => {
  await db.query(`
    INSERT INTO ur_cons.lawyer (name, id_special) VALUES ($1::text, $2::int)
  `, [req.body.name, req.body.specialId]);
  res.redirect('/queries');
});

router.get('/payment-page', extractCredentials, async (req, res, next) => {
  let payments = [];
  try {
    const result = await db.query(`
      select r.id as id, r."data" as "date", c."name" as c_name, l."name" as l_name,
      s."name" as s_name, w."admin" as w_name, p.price, r.is_paid from ur_cons.registr r 
      inner join ur_cons.client c on r.id_client = c.id 
      inner join ur_cons.lawyer l on r.id_lawyer = l.id 
      inner join ur_cons.special s on r.id_special = s.id 
      inner join ur_cons.worker w on r.id_worker = w.id 
      inner join ur_cons.price p on r.id_price = p.id
      `);
    payments = result.rows;
    payments.forEach(payment => {
      payment.date = new Date(payment.date).toLocaleDateString();
    });
  } catch (err) {
    console.error(err);
  }
  res.render('payment', { payments });
});

router.post('/pay/:id', extractCredentials, async (req, res, next) => {
  await db.query('UPDATE ur_cons.registr SET is_paid = true, payment_date = $1::timestamp WHERE id = $2::int', [
    new Date().toISOString(), req.params.id
  ]);
  res.redirect('/payment-page');
});

router.post('/create-consul', extractCredentials, async (req, res, next) => {
  const clientIdResult = await db.query('INSERT INTO ur_cons.client (name) VALUES ($1::text) RETURNING id', [
    req.body.clientName
  ]);
  const clientId = clientIdResult.rows[0].id;
  const [lawyerId, specialId] = req.body.lawyerSpecial.split('-');
  const priceResult = await db.query('SELECT * FROM ur_cons.price WHERE id_special = $1::int', [specialId]);
  const priceId = priceResult.rows[0].id;
  await db.query(`
    INSERT INTO ur_cons.registr
    ("data", id_client, id_lawyer, id_special, id_worker, id_price)
    VALUES($1::timestamp, $2::int, $3::int, $4::int, $5::int, $6::int);`,
    [req.body.date, clientId, lawyerId, specialId, req.user.id, priceId]
  );
  res.redirect('/');
});

module.exports = router;
