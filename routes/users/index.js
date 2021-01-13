const express = require('express');
const router = express.Router();
const userController = require('../../controller/userController');
const upload = require('../../modules/multer');
const authUtil = require('../../middleware/authUtil');

router.post('/signup', upload.single('image'), userController.signup);
router.post('/signin', userController.signin);
router.get('/activities', authUtil.checkToken, userController.getActivity);
router.get('/search', authUtil.checkToken, userController.getIdSearch)
router.get('/search/history', authUtil.checkToken, userController.getRecentSearch);
router.delete('/search/:searchedId', authUtil.checkToken, userController.deleteRecentSearch);
router.get('/', userController.nicknameCheck);
router.post('/fb-token', authUtil.checkToken, userController.postToken);

module.exports = router;