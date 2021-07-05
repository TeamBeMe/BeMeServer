const Answer = require('./answer')
const User = require('./user')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Like', {
        user_id: { // 좋아요 한 사용자
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        answer_id: { // 좋아요 달린 인증게시물
            type: DataTypes.INTEGER,
            reference: {
                model: Answer,
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
    });
};