const { Answer, Question, Category } = require('../models');

module.exports = {
    getUserAnswersByPage : async(page, limit) => {
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
                raw: true,
            })

            /*const result = await Question.findAll({
                offset: offset,
                limit: limit,
                where: {
                    id: Answer.question_id, category_id: Category.category_id
                },
                attributes: ['id', 'category_name', 'answer_idx', 'question_title', 'content', 'created_at', 'answer_date']
            })*/
            return result;

        } catch (error) {
            throw error;
        }
    }
}