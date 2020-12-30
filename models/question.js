const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Question', {

        questionTitle: { // 질문 제목
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
};