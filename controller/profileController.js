const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');
const { User, Answer, Follow} = require('../models');
const { answerService, profileService } = require('../service');

module.exports = {
    getOtherAnswers: async (req, res) => {

        const target_user_id = req.params.user_id;
        let page = req.query.page;
        if (! page) {
            page = 1
        }
        if (! target_user_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

            // 존재하는 유저인지 확인
            const user = await User.findByPk(target_user_id);
            if (! user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            // 게시글 가져오기
            let answers = await profileService.getPublicOtherAnswers(target_user_id, req.decoded.id);

            // 페이지 총 수
            const page_len = parseInt(answers.length / 10) + 1;

            const idx_start = 0 + (page - 1) * 10;
            const idx_end = idx_start + 9;

            // 페이지네이션
            answers = answers.filter((item, idx) => {
                return (idx >= idx_start && idx <= idx_end);
            })
            return res.status(code.OK).send(util.success(code.OK, message.GET_OTHER_ANSWER_SUCCESS, { page_len, answers}));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    getOtherProfile: async (req, res) => {
        const target_user_id=req.params.user_id;
        if (! target_user_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            const target_user = await User.findOne({
                where : {
                    id : target_user_id
                },
                attributes : ['id', 'nickname', 'email', 'profile_img','continued_visit'],
                raw : true,
            });
            if (! target_user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            // 팔로우 여부
            const is_followed = await Follow.findAll({
                where : {
                    followed_id : target_user_id,
                    follower_id : req.decoded.id,
                }
            });
            if (is_followed.length < 1) {
                target_user.is_followed = false;
            } else {
                target_user.is_followed = true;
            }
            

            return res.status(code.OK).send(util.success(code.OK, message.GET_OTHER_PROFILE_SUCCESS, target_user));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}