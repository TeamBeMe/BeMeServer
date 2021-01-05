const express = require('express');
const router = express.Router();
const controller = require('../../controller/profileController');
const authUtil = require('../../middleware/authUtil');



// 내 프로필 가져오기
// router.get('profiles', authUtil, controller.getMyAnswers);
// 다른 사람 글 가져오기
router.get('/answers/:user_id', authUtil.checkToken, controller.getOtherAnswers);

module.exports = router;