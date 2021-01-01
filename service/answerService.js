const { Answer } = require('../models');
const moment = require('moment');

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
    },
    getTodayDate: async () => {
        const td = Date.now();
        const today = new Date(td);
        return new Date(moment.tz(today, 'Asia/Seoul').format());
    }

}