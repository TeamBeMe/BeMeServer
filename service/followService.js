const message = require('../modules/responseMessage');
const { userService } = require('.');
const {User, Follow} = require('../models');

module.exports = {
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
}