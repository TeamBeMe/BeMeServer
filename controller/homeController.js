const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, Question, Category, User } = require('../models');
const { homeService } = require('../service');

const sch = require('node-schedule');
const rule = new sch.RecurrenceRule();

rule.tz = 'Asia/Seoul';
rule.dayOfWeek = [0, new sch.Range(0, 6)];
rule.hour = 0; // rule로 하면 뭔가 잘 안됨... 시간을 서울로 안맞춰서 그런가
rule.minute = 0;
// '*/7 * * * * *'

// 매일 오전 12시 마다 새로운 질문
const shedule = sch.scheduleJob(rule, async () => {
    try {
        console.log("반복!")
        const userCount = await User.count({});
        console.log(userCount);

        for (let i = 2; i <= userCount; i++) { // 인덱스 1이 이상해서 2부터 해놓음
            // 가장 최근 답변
            const latAnswer = await Answer.findOne({
                where: {
                    user_id: i
                },
                attributes: ['user_id','question_id'],
                order: [['question_id', 'DESC']]
            });

            // 가장 최근 답변의 질문 id를 통해 그 다음 질문 생성하기
            const latQuestionId = latAnswer.question_id;
            const moreQuestion = await Answer.create({
                public_flag: 0,
                user_id: i,
                question_id: (latQuestionId + 1)
            })
            
        }
    } catch (err) {
        console.log(err);
    }

})


module.exports = {

    // 모든 답변 불러오기 (페이징)
    getAnswers: async (req, res) => {
        try {
            const user_id = req.decoded.id;
            const page = req.params.page;
            const limit = 5;

            if (!user_id || !page ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const answersByPage = await homeService.getUserAnswersByPage(user_id, page, limit);

            console.log(message.GET_ANSWER_SUCCESS);
            res.status(code.OK).send(util.success(code.OK, message.GET_ANSWER_SUCCESS, answersByPage));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 열두시 질문은 스케줄로 추가만 해주면 된다, 질문 더받기는 create 후 get
    // 질문 더받기를 누르면 새로 받아와지는 질문만 받아와도 되나?
    // 전체를 get 해와야 페이징이 적용되지 않을까?
    // 질문 더 받기 (현재는 더 받은 질문만 get 하도록 되어 있음)
    getMoreQuestion: async (req, res) => {
        try {
            const user_id = req.decoded.id;

            const latAnswer = homeService.getLatAnswer(user_id);

            // 가장 최근 답변의 질문 id를 통해 그 다음 질문 생성하기
            const latQuestionId = latAnswer.question_id;
            const moreQuestion = await Answer.create({
                public_flag: 0,
                user_id: user_id,
                question_id: (latQuestionId + 1)
            })

            // 해당 유저의 가장 최근 답변(방금 불러온 답변) 가져오기
            const answer = await Answer.findOne({
                include: [{
                    model: Question,
                    include: [{
                        model: Category,
                        attributes: ['id', 'name']
                    }],
                    attributes: ['id', 'title']
                }],
                attributes: ['id', 'answer_idx', 'content', 'created_at', 'answer_date'],
                where: {
                    user_id: user_id
                },
                order: [['question_id', 'DESC']]
            })

            console.log(message.GET_QUESTION_SUCCESS);
            res.status(code.OK).send(util.success(code.OK, message.GET_QUESTION_SUCCESS, answer));

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
            console.log(user_id);
            console.log(answer_id);

            if (!user_id || !answer_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const check = homeService.checkExiAnswerAndUser(answer_id, user_id);
            const latAnswer = homeService.getLatAnswer(user_id);
            const latQuestionId = latAnswer.question_id;

            // 질문 변경
            const resultChangedNum = await Answer.update({ question_id: latQuestionId + 1 }, {
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
                attributes: ['id', 'answer_idx', 'content', 'created_at', 'answer_date']
            })

            console.log(message.CHANGE_QUESTION_SUCCESS)
            res.status(code.OK).send(util.success(code.OK, message.CHANGE_QUESTION_SUCCESS, answer));

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

            if (!user_id || !public_flag || !answer_id) {
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

            console.log(message.UPDATE_PUBLICFLAG_SUCCESS)
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
            console.log(message.DELETE_ANSWER_SUCCESS)
            res.status(code.OK).send(util.success(code.OK, message.DELETE_ANSWER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
}