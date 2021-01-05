const { Answer, Comment, User, Question, Category } = require('../models');
const message = require('../modules/responseMessage');
const answerService= require('./answerService');
const { Op } = require('sequelize');

module.exports={
    // 타인 프로필에서 다른 사람의 공개된 답변 가져오기
    getPublicOtherAnswers: async (target_id, user_id) => {
        let answers = await answerService.getPublicAnswersByUserId(target_id);

        const getFormatted = async (answers) => {
            const result = []
            for (answer of answers) {
                result.push(await answerService.getFormattedAnswerwithPK(answer.id, user_id));
            }
            return result;
        }
        answers = await getFormatted(answers);
        return answers;
    },
    // 답변을 카테고리, public 에 맞춰 필터링
    filterAnswer : async (answers, category, public) => {
        if (public == 'unpublic') {
            answers = answers.filter(item => item.public_flag == false);
        } else if (public == 'public') {
            answers = answers.filter(item => item.public_flag == true);
        } 
        if (category ) {
            answers = answers.filter(item => item.category_id == category);
        }
       return answers; 
        
    },
    // 유저의 답변 개수 가져오기
    getAnswerCountByUserId: async (user_id) => {
        const answers = await Answer.findAll({
            where : {
                user_id,
                content : {
                    [Op.not] : null,
                }
            },
            raw : true,
        });
        return answers.length;
    }
}