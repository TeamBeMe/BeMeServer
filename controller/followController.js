const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');
const { User, Follow } = require('../models');
const { answerService, followService, alarmService} = require('../service');


module.exports = {
    makeOrDeleteFollow: async (req, res) => {
        const followed_id = req.body.user_id;
        const user_id = req.decoded.id;

        if (! followed_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            // followed_id 가 나랑 같으면 fail
            if (followed_id == user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.FOLLOWING_MYSELF));
            }
            // valid 한 followed_id 인지 확인
            const followed_user = await User.findByPk(followed_id);

            if (! followed_user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            // 이미 following 한 id 인지 확인
            const existFollow = await Follow.findAll({
                where : {
                    follower_id : user_id,
                    followed_id,
                }
            });
            // 이미 팔로우된 id 이면 팔로우 취소
            if (existFollow.length > 0) {
                await Follow.destroy({
                    where : {
                        follower_id : user_id,
                        followed_id,
                    }
                });
                return res.status(code.OK).send(util.success(code.OK, message.UN_FOLLOWING_SUCCESS))
            }

            await Follow.create({
                follower_id : user_id,
                followed_id,
            });
            await alarmService.alarmFollowed(followed_id, user_id);

            return res.status(code.OK).send(util.success(code.OK, message.FOLLOWING_SUCCESS));


        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    getFollowerFollowee: async (req, res) => {
        const user_id = req.decoded.id;
        try {
            // 나를 팔로우한 사람들 불러오기
            let followers = await Follow.findAll({
                where : {
                    followed_id : user_id,
                },
                attributes : [['follower_id', 'id']],
                //order :[['created_at', 'DESC']],
                raw : true,
            });
            // 내가 팔로우한 사람들 불러오기
            let followees = await Follow.findAll({
                where : {
                    follower_id : user_id,
                },
                attributes: [['followed_id', 'id']],
                //order :[['created_at', 'DESC']],
                raw : true,
            });

            const convertUsers = async(users) => {
                const result = []
                for (user of users) {
                    result.push(await followService.idToUser(user.id));
                }
                return result;
            }
            followees = await convertUsers(followees);
            followers = await convertUsers(followers);

            return res.status(code.OK).send(util.success(code.OK, message.FOLLOWING_LIST_SUCCESS, {followers, followees}));
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    getFollowAnswers: async (req, res) => {
        
        let { page } = req.query;

        
        try {
            const user_id = req.decoded.id;
            const user = await User.findByPk(user_id);

            if (! page) {
                page = 1;
            }
            const category = 'followee';

            let {answers, count} = await followService.getFollowAnswers(category, user_id, page);
            
            // 답변 formatting
            answers = await answerService.getFormattedAnswersWithoutComment(answers, user_id);
            
            // 페이지 총 수
            const page_len = answerService.getPageLen(count, 10);

            return res.status(code.OK).send(util.success(code.OK, message.GET_FOLLOW_ANSWERS_SUCCESS, {user_nickname: user.nickname, page_len, answers}));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 팔로우 삭제하기
    deleteFollower: async (req, res) => {
        const follower_id = req.params.user_id;
        if (! follower_id) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.BAD_REQUEST));
        }
        try {
            const user_id = req.decoded.id;

            const follower = await User.findByPk(follower_id);
            if (! follower) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }

            const deleted_count = await Follow.destroy({
                where : {
                    follower_id,
                    followed_id : user_id,
                }
            });
            if (deleted_count > 0) {
                return res.status(code.OK).send(util.success(code.OK, message.DELETE_FOLLOWING_SUCCESS));
            }
            // deleted 되지 않은 경우에는 follower id 
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NOT_MY_FOLLOEWR));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}