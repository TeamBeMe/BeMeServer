const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, User, Comment, Question } = require('../models');
const { homeService, userService } = require('../service');
const explorationService = require('../service/explorationService');

module.exports = {
    // '나와 다른 생각들' 대표 7개
    getAnotherAnswers: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            const page = 1; // 가장 최근 7개 답변
            const limit = 7;

            if (!user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const latSevenAnswer = await homeService.getUserAnswersByPage(user_id, page, limit);
            const anotherAnswers = await explorationService.getSevenAnswers(latSevenAnswer);

            console.log(message.GET_ANOTHER_ANSWERS_SUCCESS);
            res.status(code.OK).send(util.success(code.OK, message.GET_ANOTHER_ANSWERS_SUCCESS, anotherAnswers));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
}