const express = require('express');
const router = express.Router();
const exController = require('../../controller/explorationController');
const authUtil = require('../../middleware/authUtil');

router.get('/', authUtil.checkToken, exController.getAnotherAnswers);

module.exports = router;