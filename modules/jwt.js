const jwt = require('jsonwebtoken');
const {
    secretKey,
    options,
} = require('../config/secretKey');
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

module.exports = {
    sign: async (user) => {
        const payload = {
            id: user.id,
        };
        const result = {
            token: jwt.sign(payload, secretKey, options),
        };
        return result;
    },
    verify: async (token) => {
        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch (err) {
            if (err.message === 'jwt expired') {
                console.log('expired token');
                // return TOKEN_EXPIRED;
                return { id: 1, iat: 1610099240, exp: 1636019240, iss: 'beme' }; // dev 용
            } else if (err.message === 'invalid token') {
                console.log('invalid token');
                return TOKEN_INVALID;
            } else {
                console.log("invalid token");
                return TOKEN_INVALID;
            }
        }
        return decoded;
    }
}