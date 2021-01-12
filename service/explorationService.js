const { Answer, Question, Comment, Category, User }  = require('../models/');
const models = require('../models/index');
const message = require('../modules/responseMessage');
const { sequelize } = require('../models/index');
const { Op } = require('sequelize');
const moment = require('moment');
const { filterAnswer } = require('./profileService');

const getTodayDate = async () => {
    const td = Date.now();
    const today = new Date(td);
    return new Date(moment.tz(today, 'Asia/Seoul').format());
};

// 정리.....정리....
// 1. is_answered 트루인 것만 보내주면 됨
// 2. 크게 다른글 둘러보기 최신, 흥미 / 한 질문에 대한 최신, 흥미

const getFormattedAnswer= async (answer_id, user_id) => {
    try {

        let answer = await Answer.findOne({
            where : {
                id : answer_id,
                content : {
                    [Op.not]: null,
                }
            },
            attributes: { exclude: ['createdAt', 'updatedAt']},
            raw : true,
        });
        if (! answer) {
            return
        }
        
        if (user_id) {
            answer.is_author = user_id == answer.user_id;
        }
        answer.public_flag = Boolean(answer.public_flag);
        answer.comment_blocked_flag = Boolean(answer.comment_blocked_flag);
        // 내가 스크랩한 질문인지 확인하기
        const isScrapped = await Scrap.findOne({
            where : {
                user_id,
                answer_id,
            }
        });
        if (! isScrapped) {
            answer.is_scrapped = false;
        } else {
            answer.is_scrapped = true;
        }


        // 내가 답변한 질문인지 확인하기
        const isAnswered = await Answer.findAll({
            where : {
                user_id,
                id : answer_id,
                content : {
                    [Op.not]: null,
                },
            },
            attributes : ['id']
        });
        const checkIfNull = (arr) => {
            if (arr.length > 0) {
                return true
            }
            return false
        }
        const is_answered = checkIfNull(isAnswered);

        // user, question, category 정보 넣어주기
        const user = await User.findByPk(answer.user_id);
        const question = await Question.findByPk(answer.question_id);
        const category = await Category.findByPk(question.category_id);
        
        answer.user_profile = user.profile_img;
        answer.user_nickname = user.nickname;
        answer.question_id = question.id;
        answer.question = question.title;
        answer.category = category.name;
        answer.category_id = category.id;
        
        answer.is_answered = is_answered;
        answer.answer_date = await userService.formatAnswerDate(answer.answer_date);
        return answer;
    } catch (err) {
        throw err;
    }
};

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
            //console.log(result);

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
    getSevenAnswers : async(user_id, latSevenAnswer) => {
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
                        question_id: question_id,
                        public_flag: true,
                        content : {
                            [Op.not]: null,
                        },
                        user_id: {
                            [Op.not]: user_id,
                        }
                    },
                    group: ['id'], // 아직 이해 x
                    order: [[sequelize.literal('comment_count'), 'DESC']],
                    raw: true,
                });
                if (popAnswer.length > 0) {
                    answersArr.push(popAnswer[0]);
                } 
            };

            return answersArr

        } catch (error) {
            throw error;
        }
    },

    // 특정 질문의 답변 배열을 최신순으로 sorting 하는 함수
    sortNewAnswerByQid : async(question_id, user_id) => {
        try { 
            const filteredAnswers = await Answer.findAll({
                attributes: ['id'],
                where: {
                    user_id: {
                        [Op.not]: user_id,
                    },
                    question_id: question_id,
                    content: {
                        [Op.not]: null,
                    },
                    public_flag: true,
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
            //console.log(userAnswers);

            // 사용자가 답변한 질문이 존재하지 않을 때
            if (userAnswers.length < 1) {
                return message.NO_ANSWERED_QUESTION;
            }
            userAnswers = userAnswers.map(a => a.question_id);
            //console.log(userAnswers);

            const filteredAnswers = await Answer.findAll({
                    
                attributes: ['id'],
                order: [['answer_date', 'DESC']],
                where: {
                    user_id: {
                        [Op.not]: user_id,
                    },
                    content: {
                        [Op.not]: null,
                    },
                    question_id: {
                        [Op.or]: userAnswers,
                    },
                    public_flag: true,
                },
            });

            // 탐색 결과가 없을 때
            if(filteredAnswers.length < 1) {
                return message.NO_RESULT;
            }
            
            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    // 특정 질문의 답변 배열을 흥미순으로 sorting 하는 함수
    sortIntAnswerByQid : async(question_id, user_id) => {
        try {
            
            const filteredAnswers = await Answer.findAll({
                include: [{
                    model: Comment,
                    attributes: []
                }],
                attributes: ['id',
                [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                where: {
                    user_id: {
                        [Op.not]: user_id,
                    },
                    question_id: question_id,
                    content: {
                        [Op.not]: null,
                    },
                    public_flag: true,
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
                    user_id: {
                        [Op.not]: user_id,
                    },
                    content: {
                        [Op.not]: null,
                    },
                    question_id: {
                        [Op.or]: userAnswers,
                    },
                    public_flag: true,
                }
            });

            // 탐색 결과가 없을 때
            if(filteredAnswers.length < 1) {
                return message.NO_RESULT;
            }

            return filteredAnswers

        } catch (error) {
            throw error;
        }
    },

    isToday : async(answer) => {
        try {
            const today = await getTodayDate();
            let today_flag = false;
            let td = today;
            //console.log(answer.created_at);
            const diff = td.getTime()- answer.created_at.getTime();
            const hrDiff = diff / 3600000;
            if (hrDiff < 24) {
                today_flag = true;
            } else {
                today_flag = false;
            }

            return {today_flag, answer}

        } catch (error) {
            throw error;
        }

    },
}