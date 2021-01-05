const { Answer, Comment, User, Question, Category } = require('../models');
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
        
        if (user_id) {
            answer.is_author = user_id == answer.user_id;
        }
        answer.public_flag = Boolean(answer.public_flag);
        answer.comment_blocked_flag = Boolean(answer.comment_blocked_flag);

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
            order :[['createdAt', 'DESC'], [{model: Comment, as : 'Children'}, 'createdAt', 'ASC']]
        });
        comments = comments.map(i => i.dataValues);

         // 날짜 변환
         for (parent of comments) {
            parent.createdAt = await userService.formatAnswerDate(parent.createdAt);
            parent.updatedAt = await userService.formatAnswerDate(parent.updatedAt);
            if (user_id) {
                parent.is_author = user_id == parent.user_id;
            }
            if (parent.Children) {
                parent.Children = parent.Children.map(i => i.dataValues);
                for (child of parent.Children) {
                    if (user_id) {
                        child.is_author = user_id == child.user_id;
                    }
                    child.createdAt = await userService.formatAnswerDate(child.createdAt);
                    child.updatedAt = await userService.formatAnswerDate(child.updatedAt);
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

module.exports = {
    // 유저가 가지고 있는 답변을 질문과 함께 연결하기
    checkBeforeCommenting : async (answer_id, parent_id, public_flag) => {
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
                // parent_id 가 public_flag false 인 경우, child 도 flase
                if (! parent.public_flag && public_flag) {
                    return message.CHECK_PUBLIC_FLAG;
                }
            }
            return null;
        } catch (err) {
            throw err;
        }

    },
    checkBeforeModifying : async (comment_id, user_id, public_flag) => {

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
    
            if (comment.parent_id) {
                const parent = await Comment.findByPk(comment.parent_id);
                // parent_id 가 public_flag false 인 경우, child 도 flase
                if (! parent.public_flag && public_flag) {
                    return message.CHECK_PUBLIC_FLAG;
                }
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
    getAnswerByUserId : async (user_id) => {
        try {
            const answers = await Answer.findAll({
                where : {
                    user_id
                }
            });
            return answers;
        } catch (err) {
            throw err;
        }
    },
    getPublicAnswersByUserId : async (author_id) => {
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
                order :[['answer_date', 'DESC']],
                raw : true,
            });

            return answers;
        } catch (err) {
            console.error(err);
            throw err;
        }
}

}