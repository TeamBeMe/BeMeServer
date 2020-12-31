const express = require('express');
const router = express.Router();
const userController = require('../../controller/userController');
const upload = require('../../modules/multer');

router.post('/signup', upload.single('image'), userController.signup);

module.exports = router;