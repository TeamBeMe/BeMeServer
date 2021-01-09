const express = require('express');
const router = express.Router();
const exController = require('../../controller/explorationController');
const authUtil = require('../../middleware/authUtil');

router.get('/another', authUtil.checkToken, exController.getAnotherAnswers);
router.get('/category', authUtil.checkToken, exController.getCategories);
router.get('/answer', authUtil.checkToken, exController.getFirstQuestion);
router.get('/', authUtil.checkToken, exController.getExpAnswers);
router.get('/:questionId', authUtil.checkToken, exController.getSpecificAnswers);
router.put('/:answerId', authUtil.checkToken, exController.doOrCancelScrap);


module.exports = router;