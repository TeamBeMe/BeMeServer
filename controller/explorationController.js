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
    // '나와 다른 생각들' 대표 7개 (곧 삭제될 예정)
    getAnotherAnswers: async (req, res) => { 
        try {
            const user_id = req.decoded.id;
            const page = 1; // 가장 최근 7개 답변
            const limit = 7;
            //console.log(user_id);

            if (!user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            // 조건을 더해야함 - 아직 답하지 않은 질문, 즉 content가 null인 질문은 포함 x

            const latSevenAnswer = await explorationService.getLatSeven(user_id, limit);
            if(latSevenAnswer == message.NO_ANSWERED_QUESTION) {
                res.status(code.OK).send(util.success(code.OK, message.NO_ANSWERED_QUESTION));
            }
            const anotherAnswers = await explorationService.getSevenAnswers(user_id, latSevenAnswer);
            if (anotherAnswers == message.NO_RESULT) {
                res.status(code.OK).send(util.success(code.OK, message.NO_RESULT));
            }

            res.status(code.OK).send(util.success(code.OK, message.GET_ANOTHER_ANSWERS_SUCCESS, anotherAnswers));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 특정 question에 해당하는 answer들 (나중에 삭제 예정)
    getSpecificAnswers: async (req, res) => {
        try {
            let { page, sorting } = req.query;
            let question_id = req.params.questionId;
            const user_id = req.decoded.id;
            if (page == 0) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_INVALID_PAGE))
            }
            if (!question_id || !page) {
                //console.log(question_id)
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            if (!sorting) {
                sorting = "최신";
            }

            const question = await Question.findByPk(question_id);
            if(!question) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_QUESTION_ID));
            }

            let answers;

            if (sorting == "최신") {
                answers = await explorationService.sortNewAnswerByQid(question_id, user_id);
            } else if (sorting == "흥미") {
                answers = await explorationService.sortIntAnswerByQid(question_id, user_id);
            } else {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_SORTING_QUERY));
            }
            
            //console.dir(answers)
            //answer = 내가 답한 답변들의 질문 id를 통한 최신, 흥미 소팅 결과 (다른 사람들의 answer id들)
            answers = await explorationService.getFormattedAnswers(answers, user_id);
            
            const pagination = await explorationService.makePaginationWithNickname(answers,page, user_id);

            return res.status(code.OK).send(util.success(code.OK, message.GET_SPECIFIC_ANSWERS_SUCCESS, pagination))

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 특정 question에 해당하는 answer들 (흥미최신 sorting 쿼리 없는 조건 [NEW])
    getSpecificAnswersWithoutLen: async (req, res) => {
        try {
            let { page } = req.query;
            let question_id = req.params.questionId;
            const user_nickname = req.decoded.id;
            
            // 오류처리
            if (page == 0) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_INVALID_PAGE))
            }
            if (!question_id || !page) {
                //console.log(question_id)
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }

            const question = await Question.findByPk(question_id);
            if(!question) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_QUESTION_ID));
            }

            let answers = await explorationService.sortNewAnswerByQidWithPagination(question_id, user_nickname, page)
            answers = await explorationService.getFormattedAnswers(answers, user_nickname);

            return res.status(code.OK).send(util.success(code.OK, message.GET_SPECIFIC_ANSWERS_SUCCESS, {user_nickname, answers}))

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 다른 글 둘러보기 (나중에 삭제 예정)
    getExpAnswers: async (req, res) => {
        try {
            let { page, category, sorting } = req.query;
            const user_id = req.decoded.id;
            if (page == 0) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_INVALID_PAGE))
            }
            if (!page) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            if (!sorting) {
                sorting = "최신";
            }

            const category_attr = {};
            if ( category ) {
                if(category > 0 && category < 7) {
                    category_attr[Op.eq]= category;
                } else {
                    return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_CATEGORY_ID));
                }
                
            } else {
                category_attr[Op.not]= null;
            }

            let answers;

            if (sorting == "최신") {
                answers = await explorationService.sortNewAnswers(user_id, category_attr);
                
            } else if (sorting == "흥미") {
                answers = await explorationService.sortIntAnswers(user_id, category_attr);

            } else {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_SORTING_QUERY, answers));
            }
            
            // if (answers == message.NO_ANSWERED_QUESTION) {
            //     res.status(code.OK).send(util.success(code.OK, message.NO_ANSWERED_QUESTION));
            // } else if (answers == message.NO_RESULT) {
            //     res.status(code.OK).send(util.success(code.OK, message.NO_RESULT));
            // }

            if (answers == message.NO_RESULT) {
                res.status(code.OK).send(util.success(code.OK, message.NO_RESULT));
            }

            answers = await explorationService.getFormattedAnswers(answers, user_id);
            //console.log(answers)
            const pagination = await explorationService.makePaginationWithNickname(answers,page, user_id);

            return res.status(code.OK).send(util.success(code.OK, message.GET_EXPLORATION_RESULT_SUCCESS, pagination))

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 다른 글 둘러보기 (흥미최신 sorting 쿼리 없는 조건 [NEW])
    getExpAnswersWithoutLen: async (req, res) => {
        try {
            let { page, category } = req.query;
            const user_nickname = req.decoded.id;

            // page 오류 처리
            if (page == 0) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_INVALID_PAGE))
            }
            if (!page) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }

            // 카테고리
            const category_attr = {};
            if ( category ) {
                if(category > 0 && category < 7) {
                    category_attr[Op.eq]= category;
                } else {
                    return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_CATEGORY_ID));
                }
                
            } else {
                category_attr[Op.not]= null;
            }

            // 데베에서 가져오기
            let answers = await explorationService.sortNewAnswersWithPagination(user_nickname, category_attr, page)
            if (answers == message.NO_RESULT) {
                res.status(code.OK).send(util.success(code.OK, message.NO_RESULT));
            }

            // 답변 포맷팅
            answers = await explorationService.getFormattedAnswers(answers, user_nickname);

            return res.status(code.OK).send(util.success(code.OK, message.GET_EXPLORATION_RESULT_SUCCESS, {user_nickname, answers}))

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

            const answer = await Answer.findByPk(answer_id);
            if(! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }

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

    // 좋아요, 좋아요 취소
    likeOrCancel : async (req, res) => {

        const answer_id = req.params.answerId;
        const user_id = req.decoded.id;

        if (! answer_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

            const answer = await Answer.findByPk(answer_id);
            if(! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }

            // 좋아요 유무 확인
            const isLiked = await Like.findAll({
                where : {
                    answer_id,
                    user_id,
                }
            });

            // 이미 좋아요 했을 시 좋아요 취소
            if (isLiked.length > 0) {
                const like = await Like.destroy({
                    where : {
                        user_id,
                        answer_id
                    }
                });
                return res.status(code.OK).send(util.success(code.OK, message.LIKE_CANCEL_SUCCESS));
            }

            // 좋아요 안했을 시 좋아요 생성
            const like = await Like.create({
                user_id,
                answer_id
            });
            return res.status(code.OK).send(util.success(code.OK, message.LIKE_SUCCESS));

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
    },

    // 최초 답변하러 가기
    getFirstQuestion: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            // 사용자가 답변하지 않은 게시글이 총 두개 중 두개일 때 무조건 기준은 오늘의 질문

            const answers = await Answer.findAll({
                include: [{
                    model: Question,
                    attributes: ['id', 'title'],
                    include: [{
                        model: Category,
                        attributes: ['id', 'name']
                    }]
                }],
                where: {
                    user_id,
                    content: {
                        [Op.is]: null,
                    }
                },
                attributes: ['id', 'answer_idx', 'created_at'],
                raw:true,
            });

            if (answers.length > 1) { // 답변하지 않은 질문의 개수가 여러개라면 오늘의 질문 기준으로 return
                for (answer of answers) {
                    let answerWithFlag = await explorationService.isToday(answer);
                    //console.log(answer);
                    if (answerWithFlag.today_flag == true) {
                        return res.status(code.OK).send(util.success(code.OK, message.GET_TODAY_QUESTION_ID_SUCCESS,
                            answerWithFlag.answer));
                    }
                }
            }

            const oneAnswer = answers[0];

            return res.status(code.OK).send(util.success(code.OK, message.GET_QUESTION_ID_SUCCESS, oneAnswer));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}