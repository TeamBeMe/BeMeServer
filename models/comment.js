const { User, Answer } = require('./index');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Comment', {

        comment: { // 질문 제목
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        public_flag : { // 공개여부
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },

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
        underscored: true,
    });
};