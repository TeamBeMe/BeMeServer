const { Answer, Comment, User, Question, AnswerSearch } = require('../models');
const answerService= require('./answerService');
const { Op } = require('sequelize');

// 최근 검색어에 기록하기
const recordSearch =  async (query, user_id) => {
    try {
        const created = await AnswerSearch.create({
            user_id,
            query
        });
        console.log(created);
        return true;
    } catch (err) {
        throw err;
    }
}

module.exports={
    // 최근 검색어에 기록하기
    recordSearch,
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
    getScrapByQuery: async (query, user_id, category_id, public, page) => {
        try {
            const limit = 10;
            const category_attr = {};
            if ( category_id ) {
                category_attr[Op.eq]= category_id;
            } else {
                category_attr[Op.not]= null;
            }

            const public_attr = {};
            if ( public == 'all') {
                public_attr[Op.not] = null;
            } else if (public == 'unpublic') {
                public_attr[Op.is]= false;
            } else {
                public_attr[Op.is] = true;
            }

            const answers = await Answer.findAll({
                where: {
                    content: {
                        [Op.not]: null,
                    },
                    [Op.or]: [{'$Question.title$' : {
                        [Op.like]: `%${query}%`}},
                        {content : {
                            [Op.like]: `%${query}%`
                        }}
                    ],
                    public_flag: public_attr,
                },
                include : [{
                    model : Question,
                    attributes: [],
                    where: {
                        category_id: category_attr
                    }
                },{
                    model: User,
                    as : 'Scrapper',
                    where : {
                        id : user_id,
                    },
                    attributes: [],
                }],
                raw : true,
                order :[['answer_date', 'DESC']],
                limit,
                offset : (page - 1) * 10,
            });

            const count = await Answer.count({
                where: {
                    content: {
                        [Op.not]: null,
                    },
                    [Op.or]: [{'$Question.title$' : {
                        [Op.like]: `%${query}%`}},
                        {content : {
                            [Op.like]: `%${query}%`
                        }}
                    ],
                    '$Question.category_id$': category_attr,
                    public_flag: public_attr,
                },
                include : [{
                    model : Question,
                    attributes: [],
                },{
                    model: User,
                    as : 'Scrapper',
                    where : {
                        id : user_id,
                    },
                    attributes: [],
                }],
                raw : true,
                order :[['answer_date', 'DESC']],
                limit,
                offset : (page - 1) * 10,
            });


            return {count, answers};

        } catch (err) {
            throw err;
        }
    },
   
}