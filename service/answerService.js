const { Answer } = require('../models');

module.exports = {
    // 유저가 가지고 있는 답변을 질문과 함께 연결하기
    getOne : async (user_id) => {
        try {
            const answers = await Answer.findAll({
                where : {
                    user_id,
                }
            });
            return answers;
        } catch (error) {
            console.error(err)
            throw err;
        }
    }
}