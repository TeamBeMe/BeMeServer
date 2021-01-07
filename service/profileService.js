const { Answer, Comment, User, Question, Category } = require('../models');
const answerService= require('./answerService');
const { Op } = require('sequelize');

module.exports={
    // 타인 프로필에서 다른 사람의 공개된 답변 가져오기
    getPublicOtherAnswers: async (target_id, user_id, limit, page) => {
        let {answers, count} = await answerService.getPublicAnswersByUserIdWithPage(target_id, limit, page);

        answers = await answerService.getFormattedAnswersWithoutComment(answers, user_id)
        return {answers, count};
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
        try {
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
        } catch (err) {
            throw err;
        }
    },
    // 유저가 스크랩한 글 가져오기
    getScrapByQuery: async (query, user_id) => {
        try {
            if (! query) {
                return await Answer.findAll({
                    where : {
                        content : {
                            [Op.not]: null,
                        }
                    },
                    include : {
                        model : User,
                        as : 'Scrapper',
                        where : {
                            id: user_id,
                        },
                        attributes: []
                    },
                    attributes: ['id'],
                });
            }
            let answers = await Answer.findAll({
                where : {
                    content : {
                        [Op.not]: null,
                        [Op.like]: `%${query}%`,
                    }
                },
                include : {
                    model : User,
                    as : 'Scrapper',
                    where : {
                        id: user_id,
                    },
                    attributes: []
                },
                attributes: ['id'],
            });
            let answers2 = await Answer.findAll({
                where: {
                    content: {
                        [Op.not]: null,
                    },
                },
                include: [
                    {
                        model : User,
                        as : 'Scrapper',
                        where : {
                            id: user_id,
                        },
                        attributes: []
                    },{
                        model: Question,
                        where: {
                            title: {
                                [Op.like]: `%${query}%`,
                            },
                        },
                        attributes: []
                    },
            ]
            });
            answers = answers2.concat(answers);
            // 중복 제거
            answers = answers.filter((arr, index, callback) => index === callback.findIndex(t => t.id === arr.id));
            return answers;
            

        } catch (err) {
            throw err;
        }
    },
}