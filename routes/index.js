var express = require('express');
var router = express.Router();

router.use('/home', require('./home'));
router.use('/answers', require('./answers'));
router.use('/friends', require('./friends'));
router.use('/users', require('./users'));
router.use('/exploration', require('./exploration'));

module.exports = router;