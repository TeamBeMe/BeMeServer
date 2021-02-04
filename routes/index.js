var express = require('express');
var router = express.Router();

router.use('/home', require('./home'));
router.use('/answers', require('./answers'));
router.use('/follow', require('./follow'));
router.use('/users', require('./users'));
router.use('/exploration', require('./exploration'));
router.use('/profiles', require('./profiles'));
router.get('/health', (req, res) => {
    return res.status(code.OK).send(util.success(code.OK, message.FOLLOWING_LIST_SUCCESS));
});

module.exports = router;