const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');
const { User, Answer, Follow, sequelize} = require('../models');
const { answerService, profileService } = require('../service');
const { getFormattedAnswers } = require('../service/answerService');
const {Op} = require('sequelize');
const userService = require('../service/userService');

module.exports = {
    getOtherAnswers: async (req, res) => {

        const target_user_id = req.params.user_id;
        let page = req.query.page;

        if (! page) {
            page = 1
        }
        if (page == 0) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_INVALID_PAGE))
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
            let {answers, count} = await profileService.getPublicOtherAnswers(target_user_id, req.decoded.id, 10, page);

            // 페이지 총 수
            const page_len = answerService.getPageLen(count, 10);

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
            // 답변 개수 가져오기
            target_user.answer_count = await profileService.getAnswerCountByUserId(target_user_id);
            return res.status(code.OK).send(util.success(code.OK, message.GET_OTHER_PROFILE_SUCCESS, target_user));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 내가 쓴 게시글 가져오기
    getMyAnswer : async (req, res) => {
        try {
            let {public, category, page, query} = req.query;
            if (! public) {
                public = 'all'
            }
            if (public != 'public' && public != 'unpublic' && public != 'all') {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            if (! page) {
                page = 1;
            }
            if (! query) {
                query = "";
            }

            const user_id = req.decoded.id;
            
            let {count, answers} = await answerService.getMyAnswersByQuery(query, user_id, category, public, page);
            answers = await answerService.getFormattedAnswersWithoutComment(answers, user_id);
            // answers = await profileService.filterAnswer(answers,category, public);

            const page_len = answerService.getPageLen(count, 10);

            return res.status(code.OK).send(util.success(code.OK, message.GET_MY_ANSWER_SUCCESS, {page_len, answers}))

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 내 프로필 가져오기
    getMyProfile: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            const user = await User.findOne({
                where : {
                    id: user_id,
                },
                attributes: ['id', 'nickname','email', 'profile_img','continued_visit'],
                raw : true,
            });
            user.answer_count = await profileService.getAnswerCountByUserId(user_id);
            return res.status(code.OK).send(util.success(code.OK, message.GET_MY_PROFILE_SUCCESS, user));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 내가 스크랩한 글 가져오기
    getMyScrap: async (req, res) => {
        try {
            const user_id = req.decoded.id;

            let {public, category, page, query} = req.query;
            if (! public) {
                public = 'all'
            }
            if (public != 'public' && public != 'unpublic' && public != 'all') {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            if (! page) {
                page = 1;
            }
            if (! query) {
                query = "";
            }
            let { count, answers} = await profileService.getScrapByQuery(query, user_id, category, public, page);
            answers = await answerService.getFormattedAnswersWithoutComment(answers, user_id);
            // answers = await profileService.filterAnswer(answers,category, public);

            const page_len = answerService.getPageLen(count, 10);

            return res.status(code.OK).send(util.success(code.OK, message.GET_MY_SCRAP_SUCCESS, {page_len, answers}));
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 내 프로필사진 변경하기
    updateProfileImg: async (req, res) => {
        try {
            const user_id = req.decoded.id;

            const image = await userService.getImageUrl(req.file);

            const user = await User.update({ profile_img : image }, {
                where : {
                    id: user_id,
                },
                raw : true,
            });
 
            return res.status(code.OK).send(util.success(code.OK, message.UPDATE_MY_PROFILE_IMG_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    
}