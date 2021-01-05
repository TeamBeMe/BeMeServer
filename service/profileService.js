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
    }
}