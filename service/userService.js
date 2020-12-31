const { User } = require('../models');
const message = require('../modules/responseMessage');
const crypto = require('crypto');

module.exports = {
    // 이미 존재하는 email, nickname 인지 확인
    isEmailNicknameExist: async (email, nickname) => {
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
    },
    generateToken: async (password) => {
        const salt = crypto.randomBytes(64).toString('base64');
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
        return {salt, hashedPassword};
    },
    getImageUrl: async (file) => {
        if (file) {
            const image = file.location;
            return image;
        }
        return null;
    },

}