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
        answer_date: { // 최초 답변 날짜
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        answer_idx: { // 
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: true, // arrived_date는 created_at로 대체
        underscored: true,
    });
};