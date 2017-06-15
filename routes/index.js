var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/main', function(req, res, next) {
  res.render('main', { title: 'Express' });
});

router.get('/category', function(req, res, next) {
  res.render('category', { title: 'Express' });
});

router.get('/style', function(req, res, next) {
  res.render('style', { title: 'Express' });
});

router.get('/choose', function(req, res, next) {
  res.render('choose', { title: 'Express' });
});

router.get('/eng', function(req, res, next) {
  res.render('eng', { title: 'Express' });
});
module.exports = router;
