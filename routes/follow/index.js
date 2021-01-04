const express = require('express');
const router = express.Router();
const authUtil = require('../../middleware/authUtil');
const followController = require('../../controller/followController');

// 다른 유저 팔로우하기
router.put('/',authUtil.checkToken, followController.makeOrDeleteFollow );
// 팔로잉, 팔로워 가져오기
router.get('/', authUtil.checkToken, followController.getFollowerFollowee);
// 팔로워 삭제하기
router.delete('/:user_id', authUtil.checkToken, followController.deleteFollower);
// 팔로잉, 팔로워가 쓴 글 가져오기
router.get('/answers', authUtil.checkToken, followController.getFollowAnswers);
module.exports = router;