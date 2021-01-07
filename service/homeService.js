const { Answer, Question, Category } = require('../models');
const moment = require('moment');

const getTodayDate = async () => {
    const td = Date.now();
    const today = new Date(td);
    return new Date(moment.tz(today, 'Asia/Seoul').format());
};

const maxQuestionId = async () => {
    const countQuestion = await Question.max('id');
    return countQuestion
}



module.exports = {
    // 유저 답변 페이지별로 가져오기
    getUserAnswersByPage : async(user_id, page, limit) => {
        try {
            const offset = (page - 1) * limit

            const result = await Answer.findAll({
                offset: offset,
                limit: limit,
                order: [['created_at', 'DESC']], // 가장 최근 것 부터 가져와야 함
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
                attributes: ['id', 'answer_idx', 'content', 'public_flag', 'comment_blocked_flag', 
                            'created_at', 'answer_date'],
                raw: true,
            })

            //console.dir(`홈화면 엔서들 ${result}`)
            return result

        } catch (error) {
            throw error;
        }
    },

    // 답변과 유저 존재 검사
    checkExiAnswerAndUser : async(answer_id, user_id) => {
        try {
            const answer = Answer.findByPk(answer_id);
            console.log(`homeService 답변과 유저 존재 검사 answer 객체 = ${answer}`);
            // 존재하는 answer인지 확인
            if (! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            console.log(`homeService 답변과 유저 존재 검사 answer 객체의 user_id = ${Answer.user_id}`);
            // 불러온 answer의 유저 id와, 토큰 유저 id가 일치하는 지 확인
            if (answer.user_id != user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }

            return null

        } catch (error) {
            throw error;
        }


    },

    getLatAnswer : async(user_id) => {
        try {
            const latAnswer = await Answer.findOne({
                where: {
                    user_id: user_id
                },
                attributes: ['question_id'],
                order: [['question_id', 'DESC']]
            });

            const countQuestion = await maxQuestionId();
            console.log(`총 question_id = ${countQuestion}`);
            if (countQuestion == latAnswer.question_id) {
                return false;
            }

            console.log(`가장 최근 question_id = ${latAnswer.question_id}`);
            const latQuestionId = latAnswer.question_id;
            return latQuestionId

        } catch (error) {
            throw error;
        }


    },

    isToday : async(answer) => {
        try {
            const today = await getTodayDate();
            let td = today;
            console.log(answer.created_at);
            const diff = td.getTime()- answer.created_at.getTime();
            const hrDiff = diff / 3600000;
            if (hrDiff < 24) {
                answer.is_today = true;
            } else {
                answer.is_today = false;
            }

            return answer

        } catch (error) {
            throw error;
        }


    },


}