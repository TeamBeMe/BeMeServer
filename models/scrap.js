const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Scrap', {

        user_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        answer_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: Answer,
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: true,
    });
};