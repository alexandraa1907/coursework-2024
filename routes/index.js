var express = require('express');
var router = express.Router();

var { extractCredentials } = require('../midleware/extractCredentials');

const indexController = require('../controllers/index');

router.get('/', extractCredentials, indexController.index);

router.get('/queries', extractCredentials, indexController.queries);

router.post('/create-special', extractCredentials, indexController.createSpecial);

router.post('/delete-lawyer/:id', extractCredentials, indexController.deleteLawyerById);

router.post('/create-lawyer', extractCredentials, indexController.createLawyer);

router.get('/payment-page', extractCredentials, indexController.getPaymentPage);

router.post('/pay/:id', extractCredentials, indexController.pay);

router.post('/create-consul', extractCredentials, indexController.createConsul);

module.exports = router;
