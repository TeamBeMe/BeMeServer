const { User, Answer, Question } = require('../models');
const message = require('../modules/responseMessage');
const crypto = require('crypto');
const moment = require('moment');
const answer = require('../models/answer');

//비밀번호 hash 시키는 함수
const hashPassword =  async (password, salt = null) => {
    try {
        if (!salt) {
            salt = crypto.randomBytes(64).toString('base64');
        }
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
        return {salt, hashedPassword};
    } catch (err) {
        console.error(err);
    }
}
// 오늘 날짜 구하는 함수
const getTodayDatesOnly = async () => {
    const td = Date.now();
    const today = new Date(td);
    return new Date(moment.tz(today, 'Asia/Seoul').format('YYYY-MM-DD'));
}
const getTodayDate = async () => {
    const td = Date.now();
    const today = new Date(td);
    return new Date(moment.tz(today, 'Asia/Seoul').format());
}

const getLocalTime = async (date) => {
    return new Date(moment.tz(date, 'Asia/Seoul').format());
}

// 연속된 날짜인지 비교
const isContinuedDates= async (last_visit) => {
    const today = await getTodayDatesOnly();
    // // last_visit에 의해 계산된 다음 날짜
    const next_visit = new Date(last_visit.setDate(last_visit.getDate() + 1));
    last_visit.setDate(last_visit.getDate() - 1)
    return today.getTime() == next_visit.getTime();
}
 // Date 객체 가공 
const formatAnswerDate = async (date) => {
    
    try {
        const today = await getTodayDate();
        let td = today;
        if (! date) {
            return null
        }
    
        const diff = td.getTime()- date.getTime();
        const minDiff = diff / 60000;
        
        if (minDiff < 60) {
            return parseInt(minDiff) + '분 전';
        }
        const hrDiff = diff / 3600000;
        if (hrDiff < 24) {
            return parseInt(hrDiff) + '시간 전';
        }
        const dayDiff = hrDiff / 24;
        if (dayDiff < 365) {
            return (moment.tz(date, 'Asia/Seoul').format('M월 D일'));
        }
        return (moment.tz(date, 'Asia/Seoul').format('YYYY년 M월 D일'));

    } catch (err) {
        console.error(err);
        throw err;
    }

}

module.exports = {
    // 이미 존재하는 email, nickname 인지 확인
    isEmailNicknameExist: async (email, nickname) => {

        try {

            const alreadyEmail = await User.findOne({
                where : {
                    email
                }
            });
    
            if (alreadyEmail) {
                return message.ALREADY_EMAIL;
            }
    
            const alreadyNickname = await User.findOne({
                where : {
                    nickname
                }
            });
    
            if (alreadyNickname) {
                console.log(message.ALREADY_NICKNAME);
                return message.ALREADY_NICKNAME;
            }
            return null;
        } catch (err) {
            console.error(err);
        }
    },
    // 비밀번호 hash
    hashPassword,
    getImageUrl: async (file) => {
        try {
            if (file) {
                const image = file.location;
                return image;
            }
            return null;
        } catch (err) {
            console.error(err);
        }
    },
    isValidPassword: async (user, password) => {
        try {
            const { salt, password : hashedPassword } = user;
            const {hashedPassword : inputPassword} = await hashPassword(password, salt);
            if (inputPassword == hashedPassword) {
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
        }
    },
    getTodayDatesOnly, getTodayDate, formatAnswerDate,
    updateVisit: async (user_id) => {

        try {
            const today = await getTodayDatesOnly();
            const user = await User.findByPk(user_id);
            let { last_visit, continued_visit } = user;
            last_visit = new Date(last_visit);
            
            const isContinued = await isContinuedDates(last_visit);
            // console.log(isContinued)
            // last_visit 데이터가 없으면 == 회원가입 후 첫 로그인
            if (!last_visit) {
                continued_visit = 1;
            } else if ( isContinued ) {
                continued_visit += 1;
            } else if (today.getTime()!=last_visit.getTime()){
                continued_visit = 1;
            } 
            last_visit = today;
            const changedNum = await User.update(
                { last_visit, continued_visit},
                {
                    where : {
                        id : user.id
                    }
                }
            );
            return changedNum;
        } catch (err) {
            throw err;
        }
    },
    formatRecentActivity: async (datas, type, user_id = null) => {
        try {

            const results = []
            switch (type) {
                case 'comment':
                    for (data of datas) {
                        const question = await Question.findOne({
                            include : {
                                model : Answer,
                                where : {
                                    id : data.answer_id,
                                },
                                attributes: []
                            }
                        });
                        let type = 'comment'
                        if (data.parent_id) {
                            type = 'cocomment'
                        }
                        results.push({ type, user_id: data.user_id, question_title: question.title, user_nickname: data.User.nickname, profile_img: data.User.profile_img, createdAt: data.createdAt})
                    }
                    break;
                case 'follow':
                    for (data of datas) {
                        results.push({ type: 'follow', user_id: data.id, user_nickname: data.nickname, profile_img: data.profile_img, question_title: null, createdAt: data['Follower.Follow.createdAt']})
                    }
                    break;
                }
                return results;
        } catch (err) {
            throw err;
        }
    },
    makeActivityPagination : async (activities, page) => {
        // 페이지 총 수
        const page_len = parseInt(activities.length / 20) + 1;

        const idx_start = 0 + (page - 1) * 20;
        const idx_end = idx_start + 19;

        // 페이지네이션
        activities = activities.filter((item, idx) => {
            return (idx >= idx_start && idx <= idx_end);
        })
        return {page_len, activities}
   },

}