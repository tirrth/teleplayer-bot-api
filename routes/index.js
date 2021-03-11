var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TelePlayer Bot' });
});

router.get('/health-check', function(req, res, next) {
  res.render('health-check', { title: 'TelePlayer Bot Health Check' });
});

module.exports = router;
