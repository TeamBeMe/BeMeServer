const message = require('../modules/responseMessage');
const {User, Follow, Answer} = require('../models');
const answerService = require('./answerService');

const getAnswersByUserId = async (author_id, user_id) => {
        try {
            const answers = await Answer.findAll({
                where : {
                    user_id: author_id,
                    public_flag : true,
                },
                attributes : ['id', 'answer_date'],
                raw : true,
            });

            return answers;
        } catch (err) {
            console.error(err);
            throw err;
        }
}
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
    //팔로이, 팔로워 리스트 가져오기
    findFollowerOrFollowee :async (category, user_id) => {
        if (category == 'followee') {
            return await Follow.findAll({
                where : {
                    follower_id : user_id,
                },
                attributes: [['followed_id', 'id']],
                raw : true,
            });
        }
        if (category == 'follower') {
            return await Follow.findAll({
                where : {
                    followed_id : user_id,
                },
                attributes : [['follower_id', 'id']],
                raw : true,
            });
        }
    },
    // 유저가 쓴 답변들 중 public_flag: true 인 답변들 가져오기
    getAnswers : async (users, user_id) => {
        let result = []
        for (user of users) {
            result = result.concat(await getAnswersByUserId(user.id, user_id));
        }
        return result;
    },
    // id 에 해당하는 글 가져오기
    getAnswersByUserId,
    

}