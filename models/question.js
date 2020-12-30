module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Question', {

        title: { // 질문 제목
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
};