const { Answer, Comment, User, Question, Category } = require('../models');
const message = require('../modules/responseMessage');
const answerService= require('./answerService');
const { Op } = require('sequelize');

module.exports={
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
        
    }
}