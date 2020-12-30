module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Answer', {

        comment_blocked_flag: { // 댓글막기여부
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        content: { // 답변 내용
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        public_flag : { // 답변 공개 여부
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        answer_idx: { // 
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: true, // arrivedDate는 createdAt, answerDate는 updatedAt으로 대체?
    });
};