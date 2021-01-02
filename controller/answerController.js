const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');
const { Op } = require('sequelize'); 

const { Answer, User, Comment, Question } = require('../models');

const { answerService } = require('../service');
const { get } = require('http');
const userService = require('../service/userService');
const sequelize = require('sequelize');
const answer = require('../models/answer');

module.exports = {

    // 답변 등록하기
    postAnswer: async (req, res) => {
        // const id = req.decoded.id;
        try {
            const user_id = req.decoded.id
            const { answer_id, content, is_comment_blocked : comment_blocked_flag, is_public : public_flag } = req.body;
    
            if (! answer_id || ! content ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (typeof comment_blocked_flag !== 'boolean' || typeof public_flag !== 'boolean') {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }

            // 존재하는 답변 id 인지 확인하고 답변 여부 확인
            const answer = await Answer.findByPk(answer_id);
            console.log(answer)
            if (! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            if ( answer.content ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.ALREADY_POSTED_ANSWER));
            }
            const today = await userService.getTodayDate();

            // 유저 id 가 일치하는 지 확인
            if (answer.user_id != user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.USER_UNAUTHORIZED));
            }
            
            const updated_answer = await Answer.update({content, comment_blocked_flag, public_flag, answer_date : today},{
                where : {
                    id : answer_id
                }
            })
            
            console.log(message.POST_ANSWER_SUCCESS)
            res.status(code.OK).send(util.success(code.OK, message.POST_ANSWER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 답변 수정하기
    updateAnswer: async (req, res) => {

        try {

            const { content, answer_id } = req.body;
            
            if (! content || ! answer_id ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            const changedNum = await Answer.update({ content : content}, {
                where : {
                    id : answer_id,
                    user_id : req.decoded.id,
                }
            });
            if (!changedNum[0]) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            console.log(message.UPDATE_ANSWER_SUCCESS)
            res.status(code.OK).send(util.success(code.OK, message.UPDATE_ANSWER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
        
    },
    // 댓글 등록하기
    postComment : async (req, res) => {

        const { answer_id, content, parent_id} = req.body;
        let { is_public : public_flag  } = req.body;
        if (! answer_id || ! content ) {
            console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

            const user_id = req.decoded.id;

            const hasError = await answerService.checkBeforeCommenting(answer_id, parent_id, public_flag);

            if (hasError === message.CHECK_PUBLIC_FLAG) {
                public_flag = false;
            } else if ( hasError ) {
                console.log(hasError);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, hasError));
            }
            const comment = await Comment.create({
                answer_id,
                content,
                public_flag,
                parent_id,
                user_id
            });
            

            return res.status(code.OK).send(util.success(code.CREATED, message.POST_COMMENT_SUCCESS, comment));


        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    updateComment : async (req, res) => {
        const { comment_id, content } = req.body;
        let { is_public : public_flag } = req.body;
        if (! comment_id || ! content) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        if (typeof public_flag  !== 'boolean') {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

           const hasError = await answerService.checkBeforeModifying(comment_id, req.decoded.id, public_flag);

           if (hasError === message.CHECK_PUBLIC_FLAG) {
                public_flag = false;
            } else if ( hasError ) {
                console.log(hasError);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, hasError));
            }

            // update
            const updated_count = await Comment.update({content, public_flag},{
                where : {
                    id : comment_id,
                }
            });

            return res.status(code.OK).send(util.success(code.OK, message.MODIFY_COMMENT_SUCCESS));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    deleteComment : async (req, res) => {
        const { comment_id } = req.params;

        if (! comment_id) {
            console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            // comment id 정보 확인
            const comment = await Comment.findByPk(comment_id);
            if (! comment ) {
                console.log(message.INVALID_COMMENT_ID);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_COMMENT_ID));
            }

            if (comment.user_id !== req.decoded.id) {
                console.log(message.USER_UNAUTHORIZED);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.USER_UNAUTHORIZED));
            }
            
            const deleted_count = await Comment.destroy({
                where : {
                    id : comment_id,
                }
            });
            return res.status(code.OK).send(util.success(code.OK, message.DELETE_COMMENT_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
        
    },
    getDetailAnswer: async (req, res) => {
        const { answer_id } = req.params;

        if (! answer_id) {
            console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

            const answer = await answerService.getFormattedAnswerwithPK(answer_id, req.decoded.id);
            if (! answer) {
                console.log(message.INVALID_ANSWER_ID);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }

            return res.status(code.OK).send(util.success(code.OK, message.GET_DETAIL_ANSWER_SUCCESS, answer));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }

    },
    getMyAnswers: async(req, res) => {
        try {
            const answers = await Answer.findAll({
                where : {
                    user_id : req.decoded.id,
                },
                attributes : ['id'],
                order : [['createdAt', 'ASC']],
                raw : true
            });
            console.log(answers)

            if ( answers.length==0 ) {
                return res.status(code.OK).send(util.success(code.OK, message.USER_NO_ANSWERS, []));
            }

            const results = []
            for (ans of answers) {
                const item = await answerService.getFormattedAnswerwithPK(ans.id, req.decoded.id);
                results.push(item);
            }
            return res.status(code.OK).send(util.success(code.OK, message.GET_ANSWER_SUCCESS, results));

        } catch (err) {
            console.log(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}