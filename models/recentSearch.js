const { User } = require("./index");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('RecentSearch', {

        user_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        searched_id: {
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