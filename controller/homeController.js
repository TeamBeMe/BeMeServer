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
            const data = await homeService.getUserAnswersByPage(page, limit);

            console.log(message.GET_ANSWER_SUCCESS);
            res.status(code.OK).send(util.success(code.OK, message.GET_ANSWER_SUCCESS, data));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
}