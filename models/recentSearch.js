const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('RecentSearch', {

        user_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        search_id: {
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