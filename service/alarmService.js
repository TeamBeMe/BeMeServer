const admin = require('firebase-admin');
const { User, Answer, Question} = require('../models');
const { Op } = require('sequelize');
const user = require('../models/user');

const sendMessage = async (user_id, title, body) => {
        const user = await User.findByPk(user_id);
        const fb_token = user.fb_token;
        if (! fb_token) {
            return
        }


        // const message = {
        //     notification: {
        //         title,
        //         body
        //     },
        //     token: fb_token,
        // }

        const message = {
            android: {
                data: {
                    title,
                    body
                }
            },
            apns: {
                payload: {
                        aps: {
                            notification: {
                                title,
                                body
                            }
                        } 
                }
                
            },
            token: fb_token,
            }

        admin
            .messaging()
            .send(message)
            .then((response) => {
                console.log('Succesfully sent message: ', response)
            })
            .catch((err) => {
                console.error(err);
            })
        return
}

module.exports = {
        // 팔로우 당했을 때 알림받기
        alarmFollowed : async (followee_id, follower_id) => {
            try {
                const title = '새로운 팔로우'
                const follower = await User.findByPk(follower_id);
                const message = `${follower.nickname}님이 회원님을 팔로우했습니다`;
                await sendMessage(followee_id,title, message);

            } catch (err) {
                throw err;
            }
        },
        // 댓글, 대댓글 달렸을 때 알림 받기
        alarmCommented: async (user_id, commenter_id, comment) => {
            try {
                const message = `"${comment}"`;
                const commenter = await User.findByPk(commenter_id);
                const title = `${commenter.nickname}님의 댓글`;
                await sendMessage(user_id, title, message);

            } catch (err) {
                throw err;
            }
        },
        // 매일 밤 10시 알람
        alarmRoutine: async () => {
            try {
                const title = '오늘의 질문'
                const users = await User.findAll({
                    where : {
                        fb_token: {[Op.not]: null}
                    }, 
                    attributes : ['id', 'fb_token'],
                    raw : true,
                });
                for (usr of users) {
                    const latestRoutineQuestion = await Answer.findOne({
                        where : {
                            user_id: usr.id,
                            is_routine_question: true,
                        },
                        raw: true,
                        include : Question,
                        order : [['createdAt', 'DESC']]
                    });
                    await sendMessage(usr.id, title, latestRoutineQuestion['Question.title']);
                }
            } catch (err) {
                console.error(err)
            }
        }
        
}