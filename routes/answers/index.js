const express = require('express');
const router = express.Router();
const answerController = require('../../controller/answerController');
const authUtil = require('../../middleware/authUtil');

// 답변 등록하기
router.post('/', authUtil.checkToken, answerController.postAnswer);
// 답변 수정하기
router.put('/', authUtil.checkToken, answerController.updateAnswer);

// 댓글 달기
router.post('/comments', authUtil.checkToken, answerController.postComment);
// 댓글 수정하기
router.put('/comments', authUtil.checkToken, answerController.updateComment);

module.exports = router;