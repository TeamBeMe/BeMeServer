const { Answer, Comment } = require('../models');
const message = require('../modules/responseMessage');

module.exports = {
    // 유저가 가지고 있는 답변을 질문과 함께 연결하기
    checkBeforeCommenting : async (answer_id, parent_id, public_flag) => {
        const answer = await Answer.findByPk(answer_id);

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

    },
    checkBeforeModifying : async (comment_id, user_id, public_flag) => {

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
    }

}