const express = require('express');
const router = express.Router();
const homeController = require('../../controller/homeController');

// 답변 불러오기
router.get('/:page', homeController.getAnswers);
//router.get('/:questionId', homeController.getNewQuestions);
router.put('/public', homeController.changePublicFlag);

module.exports = router;