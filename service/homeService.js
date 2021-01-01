const { Answer, Question, Category } = require('../models');

module.exports = {
    getAnswersByPage : async(page, limit) => {
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
            })

            return result

        } catch (error) {
            throw error;
        }
    },
    /*getQuestions : async(question_id) => {
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
            })

            return result

        } catch (error) {
            throw error;
        }
    }*/
}