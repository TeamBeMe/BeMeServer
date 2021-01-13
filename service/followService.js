const message = require('../modules/responseMessage');
const {User, Follow, Answer} = require('../models');
const answerService = require('./answerService');
const answer = require('../models/answer');
const {Op} = require('sequelize');
const sequelize = require('sequelize');

module.exports = {
    // id 에 해당하는 유저 정복 가져오기
    idToUser : async (user_id) => {
        try {
            const user = await User.findOne({
                where : {
                    id : user_id,
                },
                attributes : ['id', 'nickname', 'profile_img'],
            });
        
            return user
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    // 팔로워 팔로이의 게시글 가져오기
    getFollowAnswers: async (category, user_id, page) => {

        let users;
        // follwer 가져오기
        if (category=='follower') {
            users = await Follow.findAll({
                where: {
                    followed_id: user_id,
                },
                attributes: [['follower_id', 'id']],
                raw: true,
                
            });

        } else {
            users = await Follow.findAll({
                where: {
                    follower_id: user_id,
                },
                attributes: [['followed_id', 'id']],
                raw: true,
                
            });
        }
        if (users.length == 0) {
            return {answers: [], count: 0}
        }
        users = users.map(i => i.id);

        // users 가 쓴 답변 불러오기
        const answers = await Answer.findAll({
            where : {
                user_id : {
                    [Op.or] : [users],
                },
                public_flag: true,
                content: {
                    [Op.not] : null,
                }
            },
            attributes:['id'],
            order: [['answer_date', 'DESC']],
            raw : true,
            limit: 10,
            offset: (page - 1) * 10,
        });
        const count = await Answer.count({
            where : {
                user_id : {
                    [Op.or] : users,
                },
                public_flag: true,
                content: {
                    [Op.not] : null,
                }
            },
            attributes:['id'],
            order: [['answer_date', 'DESC']],
            raw : true,
            limit: 10,
            offset: (page - 1) * 10,
        })
        return {answers, count};
    },

}