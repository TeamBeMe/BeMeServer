const express = require('express');
const router = express.Router();
const homeController = require('../../controller/homeController');

// 답변 불러오기
router.get('/:page', homeController.getAnswers);

module.exports = router;