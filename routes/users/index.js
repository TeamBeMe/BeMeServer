const express = require('express');
const router = express.Router();
const userController = require('../../controller/userController');
const upload = require('../../modules/multer');
const authUtil = require('../../middleware/authUtil');

router.post('/signup', upload.single('image'), userController.signup);
router.post('/signin', userController.signin);
router.get('/activities', authUtil.checkToken, userController.getActivity)

module.exports = router;