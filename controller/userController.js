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
            const {salt, hashedPassword} = await userService.hashPassword(password);
            
            
            const image = await userService.getImageUrl(req.file);
             
            const user = await User.create({
                email,
                password : hashedPassword,
                nickname,
                salt,
                profile_img : image
            });
            
            return res.status(code.CREATED).send(util.success(code.CREATED, message.SIGN_UP_SUCCESS, {id : user.id, email : user.email, nickname : user.nickname, profile_img : user.profile_img}));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    signin: async (req, res) => {
        const { nickname, password } = req.body;
        if (! nickname || ! password ) {
            console.log(message.NULL_VALUE);
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            const user = await User.findOne({
                where : {
                    nickname
                },
            });

            if (! user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }

            const isValidPassword = await userService.isValidPassword(user, password)
            if (! isValidPassword) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.MISS_MATCH_PW));
            }

            const { token } = await jwt.sign(user);
            
            // 연속 출석수 갱신
            userService.updateVisit(user);

            return res.status(code.OK).send(util.success(code.OK, message.SIGN_IN_SUCCESS, { token }));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }

    },
    
}