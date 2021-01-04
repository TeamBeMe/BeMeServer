const express = require('express');
const router = express.Router();
const authUtil = require('../../middleware/authUtil');
const friendController = require('../../controller/followController');

// 다른 유저 팔로우하기
router.post('/',authUtil.checkToken, friendController.postFollow );
// 팔로잉, 팔로워 가져오기
router.get('/', authUtil.checkToken, friendController.getFollowerFollowee);

module.exports = router;