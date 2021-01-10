const { Answer, Comment, User, Question, Category, Scrap } = require('../models');
const message = require('../modules/responseMessage');
const userService = require('./userService');
const { Op } = require('sequelize');
// comment 포함하는 answer 하나 객체 내부의 datetime format
const getFormattedAnswerwithPK= async (answer_id, user_id) => {
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
        
        answer.is_author = user_id == answer.user_id;
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

        let comments = await Comment.findAll({
            where: {
                answer_id,
                parent_id : null,
            },
            include : 'Children',
            attributes: {exclude: ['parent_id']},
            order :[['createdAt', 'ASC'], [{model: Comment, as : 'Children'}, 'createdAt', 'ASC']]
        });
        comments = comments.map(i => i.dataValues);

         // 날짜 변환
         for (parent of comments) {
            parent.createdAt = await userService.formatAnswerDate(parent.createdAt);
            parent.updatedAt = await userService.formatAnswerDate(parent.updatedAt);

            parent.is_author = user_id == parent.user_id;
            parent.is_visible = parent.public_flag || parent.is_author || answer.is_author;
            const user = await User.findByPk(parent.user_id);
            parent.user_nickname = user.nickname;
            parent.profile_img = user.profile_img;

            if (parent.Children) {
                parent.Children = parent.Children.map(i => i.dataValues);
                for (child of parent.Children) {
                    if (user_id) {
                        child.is_author = user_id == child.user_id;
                    }
                    child.createdAt = await userService.formatAnswerDate(child.createdAt);
                    child.updatedAt = await userService.formatAnswerDate(child.updatedAt);
                    // 내가 볼 수 있는 댓글인지 확인
                    child.is_visible = (child.public_flag || child.is_author || answer.is_author);

                    // author 정보 넣어주기
                    const user = await User.findByPk(child.user_id);
                    child.user_nickname = user.nickname;
                    child.profile_img = user.profile_img;
                }
            }
        }
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
        answer.Comment = comments;
        return answer;
    } catch (err) {
        throw err;
    }
}
const getFormattedAnswerbyPkwithoutComment= async (answer_id, user_id) => {
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
}

module.exports = {
    // 유저가 가지고 있는 답변을 질문과 함께 연결하기
    checkBeforeCommenting : async (answer_id, parent_id, public_flag, user_id) => {
        const answer = await Answer.findByPk(answer_id);

        try {

            // 답변 존재하는 지 확인
            if (! answer) {
                return message.INVALID_PARENT_ID;
            }
    
            // 답변이 댓글 허용 답변인지 확인
            if (answer.comment_blocked_flag) {
                return message.POST_COMMENT_BLOCKED;
            }
    
            // parent_id 존재하는 지 확인
            if (parent_id) {
                const parent = await Comment.findByPk(parent_id);
                if (! parent || parent.parent_id) {
                    return message.INVALID_PARENT_ID;
                }
                // parent와 answerid 동일한지 확인
                if ( parent.answer_id != answer_id) {
                    return message.INVALID_PARENT_ID;
                }
                // parent_id 가 unpublic 인 경우, answer author 거나 comment author 여야함
                if (! parent.public_flag && answer.user_id != user_id && parent.user_id != user_id) {
                    return message.USER_UNAUTHORIZED;;
                }
                // parent_id 가 public_flag false 인 경우, child 도 flase
                if (! parent.public_flag && public_flag) {
                    return message.CHECK_PUBLIC_FLAG;
                }
                return null;
            }
            return null;
        } catch (err) {
            throw err;
        }

    },
    checkBeforeModifying : async (comment_id, user_id) => {

        try {
            const comment = await Comment.findByPk(comment_id);
    
            // comment id 확인
            if (! comment) {
                return message.INVALID_COMMENT_ID;
            }
            // user_id 일치하는 지 확인
            if (comment.user_id != user_id) {
                return message.USER_UNAUTHORIZED;
            }
    
            return null;
        } catch (err) {
            throw err;
        }
    },
    // comment 포함하는 answer 하나 객체 내부의 datetime format
    getFormattedAnswerwithPK,
    // answers list 에 해당하는 formatted answer 가져오기
    getFormattedAnswers: async (answers, user_id) => {
        try {
            const result = []
            for (answer of answers) {
                result.push(await getFormattedAnswerwithPK(answer.id, user_id))
            }
            return result;
        } catch (err) {
            throw err;
        }
    },
    getFormattedAnswersWithoutComment: async (answers, user_id) => {
        try {
            const result = []
            for (answer of answers) {
                result.push(await getFormattedAnswerbyPkwithoutComment(answer.id, user_id))
            }
            return result;
        } catch (err) {
            throw err;
        }
    },
    getAnswerByUserId : async (user_id) => {
        try {
            const answers = await Answer.findAll({
                where : {
                    user_id,
                    content : {
                        [Op.not]: null,
                    }
                },
                raw : true,
            });
            return answers;
        } catch (err) {
            throw err;
        }
    },
  
    getMyAnswersByQuery: async (query, user_id, category_id, public, page) => {
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

            const answers =  await Answer.findAll({
                where: {
                    user_id,
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
                include : {
                    model : Question,
                    attributes: [],
                },
                raw : true,
                order :[['answer_date', 'DESC']],
                limit,
                offset: (page-1)*10,
            });
            const count =  await Answer.count({
                where: {
                    user_id,
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
                include : {
                    model : Question,
                    attributes: [],
                },
                raw : true,
                order :[['answer_date', 'DESC']],
            });


            return {count, answers};
        } catch (err) {
            throw err;
        }
    },
    getPublicAnswersByUserIdWithPage : async (author_id, limit, page) => {
        try {
            const answers = await Answer.findAll({
                where : {
                    user_id: author_id,
                    public_flag : true,
                    content : {
                        [Op.not]: null,
                    }
                },
                attributes : ['id', 'answer_date'],
                limit,
                offset: (page - 1) * limit,
                order :[['answer_date', 'DESC']],
                raw : true,
            });

            const count = await Answer.count({
                where : {
                    user_id: author_id,
                    public_flag : true,
                    content : {
                        [Op.not]: null,
                    }
                },
                attributes : ['id', 'answer_date'],
                limit,
                offset: (page - 1) * limit,
                order :[['answer_date', 'DESC']],
                raw : true,
            });

            return {answers, count};
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    makePagination : async (answers, page) => {
         // 페이지 총 수
         const page_len = parseInt(answers.length / 10) + 1;

         const idx_start = 0 + (page - 1) * 10;
         const idx_end = idx_start + 9;

         // 페이지네이션
         answers = answers.filter((item, idx) => {
             return (idx >= idx_start && idx <= idx_end);
         })
         return {page_len, answers}
    },
    // 댓글 작성, 수정시 내가 쓴 댓글 format 해서 하나 보내주기 
    parseComment: async (comment) => {
        try {
            const user = await User.findByPk(comment.user_id);
            comment = comment.dataValues;
            comment.user_nickname = user.nickname;
            comment.profile_img = user.profile_img;
            comment.createdAt = await userService.formatAnswerDate(comment.createdAt);
            comment.updatedAt = await userService.formatAnswerDate(comment.updatedAt);
            comment.is_author = true;
            comment.is_visible = true;

            return comment;
        } catch (err) {
            throw err;
        }
    }
}