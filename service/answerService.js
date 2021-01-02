const { Answer, Comment } = require('../models');
const message = require('../modules/responseMessage');
const userService = require('./userService');

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
    // comment 포함하는 answer 객체 내부의 datetime format
    getFormattedAnswerwithPK: async (answer_id, user_id = null) => {
        let answer = await Answer.findOne({
            where : {
                id : answer_id,
            },
            attributes: { exclude: ['createdAt', 'updatedAt']},
            raw: true,
        });
        if (! answer) {
            return null;
        }

        if (user_id) {
            answer.is_author = user_id == answer.user_id;
        }

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
        
        answer.answer_date = await userService.formatAnswerDate(answer.answer_date);
        answer.Comment = comments;
        return answer;
    },


}