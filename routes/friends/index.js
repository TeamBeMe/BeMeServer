const express = require('express');
const router = express.Router();
const authUtil = require('../../middleware/authUtil');
const friendController = require('../../controller/friendController');

// 다른 유저 팔로우하기
router.post('/',authUtil.checkToken, friendController.postFollow );

module.exports = router;