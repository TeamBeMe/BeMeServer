const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, Question, Category, User } = require('../models');

const { homeService } = require('../service');


module.exports = {

    // 답변 불러오기
    getAnswers: async (req, res) => {
        try {
            const page = req.params.page;
            const limit = 5;
            const data = await homeService.getAnswersByPage(page, limit);

            console.log(message.GET_ANSWER_SUCCESS);
            res.status(code.OK).send(util.success(code.OK, message.GET_ANSWER_SUCCESS, data));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    /*getNewQuestions: async (req, res) => {
        try {
            const question_id = req.params.questionId;
            const data = await homeService.getQuestions(question_id);

            console.log(message.GET_QUESTION_SUCCESS);
            res.status(code.OK).send(util.success(code.OK, message.GET_QUESTION_SUCCESS, data));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }*/

    changePublicFlag: async (req, res) => {
        try {
            const { public_flag, answer_id } = req.body;
            
            if (! answer_id ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            const resultChangedNum = await Answer.update({ public_flag }, {
                where : {
                    id : answer_id,
                }
            });
            if (!resultChangedNum[0]) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            console.log(message.UPDATE_ANSWER_SUCCESS)
            res.status(code.OK).send(util.success(code.OK, message.UPDATE_ANSWER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}