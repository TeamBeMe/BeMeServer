const express = require('express');
const router = express.Router();
const exController = require('../../controller/explorationController');
const authUtil = require('../../middleware/authUtil');

router.get('/another', authUtil.checkToken, exController.getAnotherAnswers);
router.get('/category', authUtil.checkToken, exController.getCategories);
router.get('/:questionId', authUtil.checkToken, exController.getSpecificAnswers);
router.get('/', authUtil.checkToken, exController.getExpAnswers);
router.put('/:answerId', authUtil.checkToken, exController.doOrCancelScrap);

module.exports = router;