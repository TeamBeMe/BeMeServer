const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');
const { User, Answer } = require('../models');
const { answerService, profileService } = require('../service');

module.exports = {
    getOtherAnswers: async (req, res) => {

        const target_user_id = req.params.user_id;
        const page = req.params.page;
        if (! page) {
            page = 1
        }
        if (! target_user_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {

            // 존재하는 유저인지 확인
            const user = await User.findByPk(target_user_id);
            if (! user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            // 게시글 가져오기
            const answers = await answerService.getPublicAnswersByUserId(target_user_id);
            


            // 페이지 총 수
            const page_len = parseInt(answers.length / 10) + 1;

            const idx_start = 0 + (page - 1) * 10;
            const idx_end = idx_start + 9;

            // 페이지네이션
            answers = answers.filter((item, idx) => {
                return (idx >= idx_start && idx <= idx_end);
            })
            return res.status(code.OK).send(util.success(code.OK, message.ISSUE_SUCCESS, answers));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}