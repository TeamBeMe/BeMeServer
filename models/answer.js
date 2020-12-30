module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Answer', {

        isCommentBlocked: { // 댓글막기여부
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        content: { // 답변 내용
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        isPublic: { // 답변 공개 여부
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        answer_idx: { // 연속출석 count
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: true, // arrivedDate는 createdAt, answerDate는 updatedAt으로 대체?
    });
};