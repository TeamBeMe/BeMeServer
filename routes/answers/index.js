const express = require('express');
const router = express.Router();
const answerController = require('../../controller/answerController');

// 답변 등록하기
router.post('/', answerController.postAnswer);
// 답변 수정하기
router.put('/', answerController.updateAnswer);

// 댓글 달기
//router.post('/comments', answerController.postComment);

module.exports = router;