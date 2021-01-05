const express = require('express');
const router = express.Router();
const controller = require('../../controller/profileController');
const authUtil = require('../../middleware/authUtil');



// 내 프로필 가져오기
router.get('/', authUtil.checkToken, controller.getMyProfile);
// 내 글 가져오기/ 스크랩 가져오기
router.get('/answers', authUtil.checkToken, controller.getMyAnswer);
// 다른 사람 글 가져오기
router.get('/answers/:user_id', authUtil.checkToken, controller.getOtherAnswers);
// 마이페이지 스크랩한 글 가져오기
router.get('/scraps', authUtil.checkToken, controller.getMyScrap);
// 다른 사람 프로필 가져오기
router.get('/:user_id', authUtil.checkToken, controller.getOtherProfile);

module.exports = router;