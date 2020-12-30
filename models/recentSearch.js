const { User } = require("./index");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('RecentSearch', {

        recentSearch_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
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