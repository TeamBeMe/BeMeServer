const { Answer, Question, Category } = require('../models');


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
                attributes: ['id', 'answer_idx', 'content', 'created_at', 'answer_date'],
                where: {
                    user_id: user_id
                }
            })

            return result

        } catch (error) {
            throw error;
        }
    },

    // 답변과 유저 존재 검사
    checkExiAnswerAndUser : async(answer_id, user_id) => {
        try {
            const answer = Answer.findByPk(answer_id);
            // 존재하는 answer인지 확인
            if (! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }

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
            return latAnswer

        } catch (error) {
            throw error;
        }


    },

}