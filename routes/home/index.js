const express = require('express');
const router = express.Router();
const homeController = require('../../controller/homeController');
const authUtil = require('../../middleware/authUtil');

// 답변 불러오기
router.get('/:page', authUtil.checkToken, homeController.getAnswers);
router.put('/public', authUtil.checkToken, homeController.changePublicFlag);
router.delete('/:answerId', authUtil.checkToken, homeController.deleteAnswer);

module.exports = router;