const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Category', {

        name: { // 카테고리 종류
            type: DataTypes.STRING(10),
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
};