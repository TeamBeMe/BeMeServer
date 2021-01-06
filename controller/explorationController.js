const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, User, Comment, Question, Scrap } = require('../models');
const { homeService, userService } = require('../service');
const explorationService = require('../service/explorationService');
const answerService = require('../service/answerService');
const question = require('../models/question');

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

    // 특정 question에 해당하는 answer들 
    getSpecificAnswers: async (req, res) => {
        try {
            let { page, sorting } = req.query;
            let question_id = req.params.questionId;
            const user_id = req.decoded.id;
            if (!page) {
                page = 1;
            }
            if (!question_id) {
                console.log(question_id)
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            if (!sorting) {
                sorting = "최신";
            }

            let answers;

            if (sorting == "최신") {
                answers = await explorationService.sortNewAnswerByQid(question_id);
            } else if (sorting == "흥미") {
                answers = await explorationService.sortIntAnswerByQid(question_id);
            } else {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_SORTING_QUERY));
            }
            //console.dir(answers)
            answers = await answerService.getFormattedAnswersWithoutComment(answers, user_id);
            console.dir(answers)
            const pagination = await answerService.makePagination(answers,page);

            return res.status(code.OK).send(util.success(code.OK, message.GET_SPECIFIC_ANSWERS_SUCCESS, pagination))

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 다른 글 둘러보기
    getExpAnswers: async (req, res) => {
        try {
            let { page, category, sorting } = req.query;
            const user_id = req.decoded.id;
            if (!page) {
                page = 1;
            }
            if (!category) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            if (!sorting) {
                sorting = "최신";
            }

            let answers;

            if (sorting == "최신") {
                answers = await explorationService.sortNewAnswers();
            } else if (sorting == "흥미") {
                answers = await explorationService.sortIntAnswers();
            } else {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_SORTING_QUERY));
            }
            //console.dir(answers)
            answers = await answerService.getFormattedAnswersWithoutComment(answers, user_id);
            console.dir(answers)
            const pagination = await answerService.makePagination(answers,page);

            return res.status(code.OK).send(util.success(code.OK, message.GET_EXPLORATION_RESULT_SUCCESS, pagination))

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 스크랩 하기 & 스크랩 취소하기
    doOrCancelScrap: async (req, res) => {
        const answer_id = req.params.answerId;
        const user_id = req.decoded.id;

        if (! answer_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            // 이미 scrap 했는지 확인
            const alreadyScrap = await Scrap.findAll({
                where : {
                    answer_id : answer_id,
                    user_id,
                }
            });
            // 이미 scrap 했으면 스크랩 취소
            if (alreadyScrap.length > 0) {
                const scrap = await Scrap.destroy({
                    where : {
                        answer_id : answer_id,
                        user_id,
                    }
                });
                return res.status(code.OK).send(util.success(code.OK, message.UNDO_SCRAP_SUCCESS))
            }

            const scrap = await Scrap.create({
                answer_id : answer_id,
                user_id,
            });

            return res.status(code.OK).send(util.success(code.OK, message.DO_SCRAP_SUCCESS));


        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
}