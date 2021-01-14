const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, Question, Category, User } = require('../models');
const homeService = require('../service/homeService');

const sch = require('node-schedule');
const rule = new sch.RecurrenceRule();

rule.tz = 'Asia/Seoul';
//rule.dayOfWeek = [0, new sch.Range(0, 6)];
rule.hour = 0; // rule로 하면 뭔가 잘 안됨... 시간을 서울로 안맞춰서 그런가
rule.minute = 0;
rule.second = 7;
// '*/7 * * * * *' '0 0 * * 0-6'

// 매일 오전 12시 마다 새로운 질문
const shedule = sch.scheduleJob('0 0 * * 0-6', async () => {
    try {

        const users = await User.findAll({
            attributes: ['id'],
            raw : true,
            order : ['id'],
        });

        // question_id 최댓값
        const maxQuestionId = await Question.max('id');

        for (user of users) {
            const latestAnswer = await Answer.findOne({
                include: [{
                    model: Question,
                    include: [{
                        model: Category,
                        attributes: ['id'],
                    }],
                    attributes:[],
                }],
                where: {
                    user_id: user.id,
                },
                attributes: ['question_id'],
                order: [['question_id', 'DESC']],
                raw: true,
            });

            // 만약 답변 없다면, id = 1
            let question_id = 1;
            if ( latestAnswer) {
                question_id = latestAnswer.question_id + 1;
            } 
             // 마지막 질문까지 모두 답변했다면 다시 1부터
            if (question_id > maxQuestionId) {
                question_id = 1;
            }

            const question = await Question.findByPk(question_id);

            const answerIdxCount = await Answer.count({
                where : {
                    user_id: user.id,
                },
                include : {
                    model : Question,
                    where : {
                        category_id: question.category_id,
                    }
                }
            })
            
            // answer_idx +1
            const answerIdx = answerIdxCount + 1;

            

            // 가장 최근 답변의 질문 id를 통해 그 다음 질문 생성하기
            const newQuestion = await Answer.create({
                user_id: user.id,
                question_id,
                answer_idx: answerIdx,
                public_flag: false,
                commented_blocked_flag: false,
                is_routine_question: true,
            });
            
            
        }
        console.log('새로운 질문이 생성되었습니다');
        // for (let i = 1; i <= userCount; i++) { 
        //     // 가장 최근 답변
        //     const latAnswer = await Answer.findOne({
        //         where: {
        //             user_id: i
        //         },
        //         attributes: ['user_id','question_id'],
        //         order: [['question_id', 'DESC']]
        //     });

        //     // 만약 답변 없다면, id = 0
        //     if (! latAnswer) {
        //         latAnswer.question_id = 0;
        //     }
 
        //     // 마지막 질문까지 모두 답변했다면 다시 1부터
        //     const latQuestionId = latAnswer.question_id;
        //     const maxQuestionId = await Question.max('id');
        //     if (latQuestionId == maxQuestionId) {
        //         latQuestionId = 0;
        //     }

        //     // 가장 최근 답변의 질문 id를 통해 그 다음 질문 생성하기
        //     const moreQuestion = await Answer.create({
        //         public_flag: 0,
        //         user_id: i,
        //         question_id: (latQuestionId + 1)
        //     })  
        // }
    } catch (err) {
        console.log(err);
    }

});

module.exports = {

    // 모든 답변 불러오기 (페이징)
    getAnswers: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            const page = req.params.page;
            const limit = 5;
            
            if (!user_id || !page) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (page == 0) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_INVALID_PAGE))
            }

            // 페이징 결과
            const answersByPage = await homeService.getUserAnswersByPage(user_id, page, limit);
            if (answersByPage == message.NO_QUESTIONS) {
                return res.status(code.OK).send(util.success(code.OK, message.NO_QUESTIONS, []));
            }
            // 더 이상 페이지가 없을 때
            if (answersByPage.length == 0) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_MORE_PAGE));
            }

            // 오늘 질문인지
            for (answer of answersByPage) {
                const answerWithIsToday = await homeService.isToday(answer);
            }
            res.status(code.OK).send(util.success(code.OK, message.GET_ANSWER_SUCCESS, answersByPage));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 질문 더 받아오기
    getMoreQuestion: async (req, res) => {
        try {
            const user_id = req.decoded.id;

            // 가장 최근 답한 answer
            const latQuestionId = await homeService.getLatAnswer(user_id);
            if (!latQuestionId) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_MORE_QUESTION));
            }

            // 그 다음 들어올 질문의 카테고리의 개수
            const question = await Question.findByPk(latQuestionId+1);

            const answerIdxCount = await Answer.count({
                where : {
                    user_id,
                },
                include : {
                    model : Question,
                    where : {
                        category_id: question.category_id,
                    }
                }
            })
            
            // answer_idx +1
            const answerIdx = answerIdxCount + 1;

            // 받아올 질문 생성
            const moreQuestion = await Answer.create({
                public_flag: false,
                commented_blocked_flag: false,
                answer_idx: answerIdx,
                user_id: user_id,
                question_id: (latQuestionId + 1)
            })

            // 받아온 질문 가져오기
            const answer = await Answer.findOne({
                include: [{
                    model: Question,
                    include: [{
                        model: Category,
                        attributes: ['id', 'name']
                    }],
                    attributes: ['id', 'title']
                }],
                where: {
                    user_id: user_id
                },
                order: [['question_id', 'DESC']],
                attributes: ['id', 'answer_idx', 'content', 'public_flag', 'comment_blocked_flag', 
                'created_at', 'answer_date'],
                raw: true,
            })

            //오늘 질문인지
            const answerWithIsToday = await homeService.isToday(answer);

            res.status(code.OK).send(util.success(code.OK, message.GET_QUESTION_SUCCESS, answerWithIsToday));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 질문 변경하기 (현재는 변경한 질문만 get 하도록 되어 있음)
    changeQuestion: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            const answer_id = req.params.answerId;
            //console.log(`homeController 질문 변경할 user_id =  ${user_id}, 질문 변경할 answer_id = ${answer_id}`);

            if (!user_id || !answer_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const oneAnswer = await Answer.findByPk(answer_id);
            //console.log(`homeService 답변과 유저 존재 검사 answer 객체 = ${oneAnswer}`);
            // 존재하는 answer인지 확인
            if (! oneAnswer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            //console.log(`homeService 답변과 유저 존재 검사 answer 객체의 user_id = ${oneAnswer.user_id}`);
            // 불러온 answer의 유저 id와, 토큰 유저 id가 일치하는 지 확인
            if (oneAnswer.user_id != user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }

            const latQuestionId = await homeService.getLatAnswer(user_id);
            if (!latQuestionId) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_MORE_QUESTION));
            }

            // 그 다음 들어올 질문의 카테고리의 개수
            const question = await Question.findByPk(latQuestionId+1);

            const answerIdxCount = await Answer.count({
                where : {
                    user_id,
                },
                include : {
                    model : Question,
                    where : {
                        category_id: question.category_id,
                    }
                }
            })
            
            // answer_idx +1
            const answerIdx = answerIdxCount + 1;

            // 질문 변경
            const resultChangedNum = await Answer.update({

                question_id: latQuestionId + 1,
                aswer_idx: answerIdx,
            },
            {
                where: {
                    id: answer_id,
                }
            });

            if (!resultChangedNum[0]) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CHANGE_QUESTION_FAIL));
            }

            // 바뀐 질문 가져오기
            const answer = await Answer.findByPk(answer_id, {
                include: [{
                    model: Question,
                    include: [{
                        model: Category,
                        attributes: ['id', 'name']
                    }],
                    attributes: ['id', 'title']
                }],
                attributes: ['id', 'answer_idx', 'content', 'public_flag', 'comment_blocked_flag', 
                'created_at', 'answer_date'],
                raw: true,
            })

            //오늘 질문인지
            const answerWithIsToday = await homeService.isToday(answer);

            res.status(code.OK).send(util.success(code.OK, message.CHANGE_QUESTION_SUCCESS, answerWithIsToday));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 답변 공개여부 수정
    changePublicFlag: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            const { public_flag, answer_id } = req.body;

            if (!user_id || public_flag == undefined || !answer_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const check = homeService.checkExiAnswerAndUser(answer_id, user_id);

            const resultChangedNum = await Answer.update({ public_flag }, {
                where: {
                    id: answer_id,
                }
            });

            if (!resultChangedNum[0]) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.UPDATE_PUBLICFLAG_FAIL));
            }

            res.status(code.OK).send(util.success(code.OK, message.UPDATE_PUBLICFLAG_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 답변 삭제
    deleteAnswer: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            const answer_id = req.params.answerId;

            if (!user_id || !answer_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const check = homeService.checkExiAnswerAndUser(answer_id, user_id);

            const resultDestroyNum = await Answer.destroy({
                where: {
                    id: answer_id,
                }
            });

            if (!resultDestroyNum) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.DELETE_ANSWER_FAIL));
            }
            
            res.status(code.OK).send(util.success(code.OK, message.DELETE_ANSWER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
}