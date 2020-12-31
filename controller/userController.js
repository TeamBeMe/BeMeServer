const util = require('../modules/util');
const message = require('../modules/responseMessage');
const code = require('../modules/statusCode');
const { User } = require('../models');
const jwt = require('../modules/jwt');
const { userService } = require('../service');


module.exports = {
    signup: async (req, res) => {
        const { email, nickname, password} = req.body;
        
        if (! email || ! password || ! nickname) {
            console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }

        try {
            // 이미 존재하는 email, nickname 인지 확인
            const paramsExist = await userService.isEmailNicknameExist(email, nickname);
            if ( paramsExist ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, paramsExist));
            }

            // hashedPassword 생성
            const {salt, hashedPassword} = await userService.generateToken(password);
            
            
            const image = await userService.getImageUrl(req.file);
             
            const user = await User.create({
                email,
                password : hashedPassword,
                nickname,
                salt,
                profile_img : image
            });
            
            return res.status(code.OK).send(util.success(code.OK, message.SIGN_UP_SUCCESS, {id : user.id, email : user.email, nickname : user.nickname, profile_img : user.profile_img}));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}