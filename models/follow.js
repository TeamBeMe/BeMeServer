const { User } = require('./user')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Follow', {

        follower_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        followed_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: true,
    });
};