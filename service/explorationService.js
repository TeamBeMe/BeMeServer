const { Answer, Question, Comment, Scrap }  = require('../models/');
const models = require('../models/index');
const { sequelize } = require('../models/index');

module.exports = {

    // 7개 각 질문의 가장 인기가 많은 답변 하나씩 가져오기
    getSevenAnswers : async(latSevenAnswer) => {
        try {
            let answersArr = [];
            
            for await (answer of latSevenAnswer) {
                const question_id = answer.Question.id;
                console.log(question_id)

 
                const popAnswer = await Answer.findAll({
                    include: [{
                        model: Comment,
                        attributes: []
                    }],
                    attributes: ['id', 'question_id', 'content',
                    [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                    where: {
                        question_id: question_id
                    },
                    group: ['id'], // 아직 이해 x
                    order: [[sequelize.literal('comment_count'), 'DESC']]
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
                    question_id: question_id
                },
                order: [['answer_date', 'DESC']]
            });
            console.dir('sorting 된 답변 id', filteredAnswers)
            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    // 전체 배열을 최신순으로 sorting 하는 함수
    sortNewAnswers : async() => {
        try {
            
            const filteredAnswers = await Answer.findAll({
                attributes: ['id'],
                order: [['answer_date', 'DESC']]
            });
            console.dir('sorting 된 답변 id', filteredAnswers)
            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    // 특정 질문의 답변 배열을 흥미순으로 sorting 하는 함수
    sortIntAnswerByQid : async() => {
        try {
            
            const filteredAnswers = await Answer.findAll({
                include: [{
                    model: Comment,
                    attributes: []
                }],
                attributes: ['id',
                [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                where: {
                    question_id: question_id
                },
                order: [[sequelize.literal('comment_count'), 'DESC']]
            });

            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    // 전체 배열을 흥미순으로 sorting 하는 함수
    sortIntAnswers : async() => {
        try {
            
            const filteredAnswers = await Answer.findAll({
                include: [{
                    model: Comment,
                    attributes: []
                }],
                attributes: ['id',
                [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                order: [[sequelize.literal('comment_count'), 'DESC']]
            });

            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },
}