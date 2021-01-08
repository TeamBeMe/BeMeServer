const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, User, Comment, Question, Scrap, Category } = require('../models');
const { homeService, userService } = require('../service');
const explorationService = require('../service/explorationService');
const answerService = require('../service/answerService');
const { Op } = require('sequelize');
const { sortNewAnswers, sortIntAnswers } = require('../service/explorationService');

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
            // 조건을 더해야함 - 아직 답하지 않은 질문, 즉 content가 null인 질문은 포함 x

            const latSevenAnswer = await explorationService.getLatSeven(user_id, limit);
            if(latSevenAnswer == message.NO_ANSWERED_QUESTION) {
                res.status(code.OK).send(util.success(code.OK, message.NO_ANSWERED_QUESTION));
            }
            const anotherAnswers = await explorationService.getSevenAnswers(latSevenAnswer);

            console.log(message.GET_ANOTHER_ANSWERS_SUCCESS);
            res.status(code.OK).send(util.success(code.OK, message.GET_ANOTHER_ANSWERS_SUCCESS, anotherAnswers));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 특정 question에 해당하는 answer들 (카테고리 x)
    getSpecificAnswers: async (req, res) => {
        try {
            let { page, sorting } = req.query;
            let question_id = req.params.questionId;
            const user_id = req.decoded.id;
            if (page == 0) {
                page = 1;
            }
            if (!question_id || !page) {
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

    // 다른 글 둘러보기 (카테고리 o)
    getExpAnswers: async (req, res) => {
        try {
            let { page, category, sorting } = req.query;
            const user_id = req.decoded.id;
            console.log(user_id)
            if (page == 0) {
                page = 1;
            }
            if (!page) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            if (!sorting) {
                sorting = "최신";
            }

            const category_attr = {};
            if ( category ) {
                category_attr[Op.eq]= category;
            } else {
                category_attr[Op.not]= null;
            }

            let answers;

            if (sorting == "최신") {
                answers = await explorationService.sortNewAnswers(user_id, category_attr);
                
            } else if (sorting == "흥미") {
                answers = await explorationService.sortIntAnswers(user_id, category_attr);

            } else {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_SORTING_QUERY));
            }

            if (sortNewAnswers == message.NO_ANSWERED_QUESTION || sortIntAnswers == message.NO_ANSWERED_QUESTION) {
                res.status(code.OK).send(util.success(code.OK, message.NO_ANSWERED_QUESTION));
            }

            answers = await answerService.getFormattedAnswersWithoutComment(answers, user_id);
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
    // 카테고리 리스트 가져오기
    getCategories: async (req, res) => {
        try {
            const categories = await Category.findAll({});
            return res.status(code.OK).send(util.success(code.OK, message.GET_CATEGORY_SUCCESS, categories));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}