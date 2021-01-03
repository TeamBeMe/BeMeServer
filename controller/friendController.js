const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, User, Comment, Question, Follow } = require('../models');

const { answerService } = require('../service');
const userService = require('../service/userService');

module.exports = {
    postFollow: async (req, res) => {
        const followed_id = req.body.user_id;
        const user_id = req.decoded.id;
        if (! followed_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            // followed_id 가 나랑 같으면 fail
            if (followed_id == user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.FOLLOWING_MYSELF));
            }
            // valid 한 followed_id 인지 확인
            const followed_user = await User.findByPk(followed_id);
            if (! followed_user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            // 이미 following 한 id 인지 확인
            const existFollow = await Follow.findAll({
                where : {
                    follower_id : user_id,
                    followed_id,
                }
            });
            if (existFollow.length > 0) {
                console.log(message.FOLLOWING_EXIST);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.FOLLOWING_EXIST));
            }

            const follow = await Follow.create({
                follower_id : user_id,
                followed_id,
            });

            console.log(follow);
            return res.status(code.OK).send(util.success(code.OK, message.FOLLOWING_SUCCESS, follow));


        } catch (err) {
            console.error(err)
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}