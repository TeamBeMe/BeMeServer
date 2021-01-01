const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, User, Comment, Question } = require('../models');

const { answerService } = require('../service');
const { get } = require('http');
const userService = require('../service/userService');


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
            if (! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            if ( answer.content ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.ALREADY_POSTED_ANSWER));
            }
            const today = await userService.getToday();

            // 유저 id 가 일치하는 지 확인
            if (answer.user_id != user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            
            const updated_answer = await Answer.update({content, comment_blocked_flag, public_flag, answered_date : today},{
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

        const { answer_id, content, parent_id, is_public : public_flag } = req.body;
        if (! answer_id || ! content  || ! public_flag) {
            console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

            const user_id = req.decoded.id;

            const answer = await Answer.findByPk(answer_id);

            // 답변 존재하는 지 확인
            if (! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }

            // 답변이 댓글 허용 답변인지 확인
            if (answer.comment_blocked_flag) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.POST_COMMENT_BLOCKED));
            }

            // parent_id 존재하는 지 확인
            if (parent_id) {
                const parent = await Comment.findByPk(parent_id);
                if (! parent || parent.parent_id) {
                    return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_PARENT_ID));
                }
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
    }
}