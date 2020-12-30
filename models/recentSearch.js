const { User } = require("./index");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('RecentSearch', {

        recentSearch_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
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