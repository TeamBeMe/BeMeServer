const { Answer, Question, Category } = require('../models');

module.exports = {
    getUserAnswersByPage : async(user_id, page, limit) => {
        //const {id: question_id, title: question_title} = Question;
        //const {id: category_id, name: category_name} = Category;
        try {
            const offset = (page - 1) * limit

            const result = await Answer.findAll({
                offset: offset,
                limit: limit,
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

            return answer

        } catch (error) {
            throw error;
        }


    }
}