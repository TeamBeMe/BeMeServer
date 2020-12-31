const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, User } = require('../models');

const { answerService } = require('../service');


module.exports = {

    // 답변 등록하기
    postAnswer: async (req, res) => {
        // const id = req.decoded.id;
        try {
            const user_id = 1;
            const { question_id, content, is_comment_blocked : comment_blocked_flag, is_public : public_flag } = req.body;
    
            if (! question_id || ! content ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (typeof comment_blocked_flag !== 'boolean' || typeof public_flag !== 'boolean') {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }

            const answer = await Answer.create({
                user_id,
                question_id,
                content,
                comment_blocked_flag,
                public_flag,
            });

            console.log(answerService.getOne(1));

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
        try {
            // const { answer_id, content }

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}