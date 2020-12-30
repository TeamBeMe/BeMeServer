const { User } = require('./user');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Block', {

        user_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        blocked_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
};