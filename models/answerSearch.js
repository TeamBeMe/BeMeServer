const { User } = require("./index");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('answerSearch', {
        user_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            } 
        },
        query: {
            type: DataTypes.TEXT(),
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        timestamps: true,
    });
};