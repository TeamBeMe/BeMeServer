const { Answer, Question, Comment, Category, User }  = require('../models/');
const models = require('../models/index');
const message = require('../modules/responseMessage');
const { sequelize } = require('../models/index');
const { Op } = require('sequelize');

module.exports = {

    getLatSeven : async(user_id, limit) => {
        try {
            //const offset = (page - 1) * limit

            const result = await Answer.findAll({
                offset: 0,
                limit: limit,
                order: [['created_at', 'DESC'], ], // 가장 최근 것 부터 가져와야 함
                include: [{
                    model: Question,
                    include: [{
                        model: Category,
                        attributes: ['id', 'name']
                    }],
                    attributes: ['id', 'title']
                }],
                where: {
                    user_id: user_id,
                    content : {
                        [Op.not]: null,
                    }
                },
                attributes: [],
                raw: true,
            })

            if (result.length < 1) {
                return message.NO_ANSWERED_QUESTION;
            }

            //console.dir(`홈화면 엔서들 ${result}`)
            return result

        } catch (error) {
            throw error;
        }
    },

    // 7개 각 질문의 가장 인기가 많은 답변 하나씩 가져오기
    getSevenAnswers : async(latSevenAnswer) => {
        try {
            let answersArr = [];
            
            for await (answer of latSevenAnswer) {
                const question_id = answer['Question.id'];
                

 
                const popAnswer = await Answer.findAll({
                    include: [{
                        model: Comment,
                        attributes: []
                    },
                    {
                        model: Question,
                        attributes:['id', 'title']
                    }],
                    attributes: ['id', 'content',
                    [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                    where: {
                        question_id: question_id
                    },
                    group: ['id'], // 아직 이해 x
                    order: [[sequelize.literal('comment_count'), 'DESC']],
                    raw: true,
                });
                answersArr.push(popAnswer[0]);
            };

            return answersArr

        } catch (error) {
            throw error;
        }
    },

    // 특정 질문의 답변 배열을 최신순으로 sorting 하는 함수
    sortNewAnswerByQid : async(question_id) => {
        try {
            const filteredAnswers = await Answer.findAll({
                attributes: ['id'],
                where: {
                    question_id: question_id,
                    content: {
                        [Op.not]: null,
                    }
                },
                order: [['answer_date', 'DESC']]
            });
            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    // 전체 배열을 최신순으로 sorting 하는 함수
    sortNewAnswers : async(user_id, category_attr) => {
        try {
            
            let userAnswers = await Answer.findAll({
                include:[{
                    model: Question,
                    attributes: [],
                }],
                where: {
                    user_id: user_id,
                    content: {
                        [Op.not]: null,
                    },
                    '$Question.category_id$': category_attr,
                },
                attributes: ['user_id', 'id', 'question_id'],
                raw: true,
            })

            if (userAnswers.length < 1) {
                return message.NO_ANSWERED_QUESTION;
            }
            userAnswers = userAnswers.map(a => a.question_id);

            const filteredAnswers = await Answer.findAll({
                    
                attributes: ['id'],
                order: [['answer_date', 'DESC']],
                where: {
                    content: {
                        [Op.not]: null,
                    },
                    question_id: {
                        [Op.or]: userAnswers,
                    },
                }
            });

            
            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    // 특정 질문의 답변 배열을 흥미순으로 sorting 하는 함수
    sortIntAnswerByQid : async(question_id) => {
        try {
            
            const filteredAnswers = await Answer.findAll({
                include: [{
                    model: Comment,
                    attributes: []
                }],
                attributes: ['id',
                [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                where: {
                    question_id: question_id,
                    content: {
                        [Op.not]: null,
                    }
                },
                order: [[sequelize.literal('comment_count'), 'DESC']]
            });

            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    // 전체 배열을 흥미순으로 sorting 하는 함수
    sortIntAnswers : async(user_id, category_attr) => {
        try {

            let userAnswers = await Answer.findAll({
                include:[{
                    model: Question,
                    attributes: [],
                }],
                where: {
                    user_id: user_id,
                    content: {
                        [Op.not]: null,
                    },
                    '$Question.category_id$': category_attr,
                },
                attributes: ['user_id', 'id', 'question_id'],
                raw: true,
            })

            if (userAnswers.length < 1) {
                return message.NO_ANSWERED_QUESTION;
            }
            userAnswers = userAnswers.map(a => a.question_id);
            
            const filteredAnswers = await Answer.findAll({
                include: [{
                    model: Comment,
                    attributes: []
                }],
                attributes: ['id',
                [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                order: [[sequelize.literal('comment_count'), 'DESC']],
                group: ['id'],
                where: {
                    content: {
                        [Op.not]: null,
                    },
                    question_id: {
                        [Op.or]: userAnswers,
                    },
                }
            });

            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },
}