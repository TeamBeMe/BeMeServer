const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, Comment } = require('../models');

const { answerService, alarmService } = require('../service');
const userService = require('../service/userService');

module.exports = {

    // 답변 등록하기
    postAnswer: async (req, res) => {
        // const id = req.decoded.id;
        try {
            const user_id = req.decoded.id
            const { answer_id, content, is_public : public_flag } = req.body;
            let comment_blocked_flag = req.body.is_comment_blocked;
    
            if (! answer_id || ! content ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (typeof public_flag !== 'boolean') {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }

            // 존재하는 답변 id 인지 확인하고 답변 여부 확인
            const answer = await Answer.findByPk(answer_id);

            if (! answer) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            if ( answer.content ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.ALREADY_POSTED_ANSWER));
            }
            const today = await userService.getTodayDate();

            // 유저 id 가 일치하는 지 확인
            if (answer.user_id != user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.USER_UNAUTHORIZED));
            }
            
            // 답변 비공개이거나 comment_blocked_flag 가 null 일경우
            if (comment_blocked_flag == null || ! public_flag) {
                comment_blocked_flag = true;
            }
            
            const updated_answer = await Answer.update({content, comment_blocked_flag, public_flag, answer_date : today},{
                where : {
                    id : answer_id
                }
            })
            
            // console.log(message.POST_ANSWER_SUCCESS)
            res.status(code.OK).send(util.success(code.OK, message.POST_ANSWER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 답변 수정하기
    updateAnswer: async (req, res) => {

        try {

            const { content, answer_id, is_public: public_flag } = req.body;
            let comment_blocked_flag = req.body.is_comment_blocked;
            
            if (! content || ! answer_id ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            // 답변 비공개이거나 comment_blocked_flag 가 null 일경우
            if (typeof public_flag  == 'boolean' && ! public_flag) {
                comment_blocked_flag = true;
            }
            const new_answer = {content, answer_id, comment_blocked_flag, public_flag};

            const changedNum = await Answer.update(new_answer, {
                where : {
                    id : answer_id,
                    user_id : req.decoded.id,
                }
            });
            if (!changedNum[0]) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            // console.log(message.UPDATE_ANSWER_SUCCESS)
            res.status(code.OK).send(util.success(code.OK, message.UPDATE_ANSWER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
        
    },
    // 댓글 등록하기
    postComment : async (req, res) => {

        const { answer_id, content, parent_id} = req.body;
        let { is_public : public_flag  } = req.body;
        if (! answer_id || ! content ) {
            // console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        if (typeof public_flag !== 'boolean') {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
        }
        try {

            const user_id = req.decoded.id;

            const hasError = await answerService.checkBeforeCommenting(answer_id, parent_id, public_flag, user_id);

            if (hasError === message.CHECK_PUBLIC_FLAG) {
                public_flag = false;
            } else if ( hasError ) {
                // console.log(hasError);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, hasError));
            }
            let comment = await Comment.create({
                answer_id,
                content,
                public_flag,
                parent_id,
                user_id
            });

            // 댓글 파싱
            comment = await answerService.parseComment(comment);

            // 게시글 user 에게 알림 보내주기
            const answer = await Answer.findByPk(answer_id);
            const author_id = answer.user_id;
            // 내 게시글인지 확인
            if (author_id != user_id) {
                await alarmService.alarmCommented(author_id, comment.user_id, comment.content);
                console.log('alarm')
            }
            
            const parent = await Comment.findByPk(comment.parent_id);
            // 대댓글일 경우 댓글 user 에게 알림 보내주기
            if (comment.parent_id && parent.user_id != user_id && author_id != parent.user_id) {
                await alarmService.alarmCommented(parent.user_id, user_id, comment.content);
                console.log('alarm coco')
            }

            return res.status(code.OK).send(util.success(code.CREATED, message.POST_COMMENT_SUCCESS, comment));


        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 댓글 수정하기
    updateComment : async (req, res) => {
        const { comment_id, content } = req.body;
        if (! comment_id || ! content) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

           const hasError = await answerService.checkBeforeModifying(comment_id, req.decoded.id);

           if ( hasError ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, hasError));
            }

            // update
            const updated_count = await Comment.update({content},{
                where : {
                    id : comment_id,
                }
            });

            // updated comment parsing 해서 보내주기
            let updated_comment = await Comment.findByPk(comment_id);
            updated_comment = await answerService.parseComment(updated_comment);


            return res.status(code.OK).send(util.success(code.OK, message.MODIFY_COMMENT_SUCCESS, updated_comment));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    deleteComment : async (req, res) => {
        const { comment_id } = req.params;

        if (! comment_id) {
            // console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            // comment id 정보 확인
            const comment = await Comment.findByPk(comment_id);
            const answer = await Answer.findByPk(comment.answer_id);
            const answer_author = answer.user_id;

            if (! comment ) {
                // console.log(message.INVALID_COMMENT_ID);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_COMMENT_ID));
            }

            if (answer_author != req.decoded.id && comment.user_id !== req.decoded.id) {
                // console.log(message.USER_UNAUTHORIZED);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.USER_UNAUTHORIZED));
            }
            
            const deleted_count = await Comment.destroy({
                where : {
                    id : comment_id,
                }
            });
            return res.status(code.OK).send(util.success(code.OK, message.DELETE_COMMENT_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
        
    },
    getDetailAnswer: async (req, res) => {
        const { answer_id } = req.params;

        if (! answer_id) {
            // console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

            const answer = await answerService.getFormattedAnswerwithPK(answer_id, req.decoded.id);
            if (! answer) {
                // console.log(message.INVALID_ANSWER_ID);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_ANSWER_ID));
            }
            // public==false 인 경우 다른 유저 접근 못하도록
            if (!answer.public_flag && answer.user_id!=req.decoded.id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.USER_UNAUTHORIZED));
            }

            return res.status(code.OK).send(util.success(code.OK, message.GET_DETAIL_ANSWER_SUCCESS, answer));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }

    },
}