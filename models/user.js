module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {

        nickname: { // 유저 닉네임
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: 'nickname'
        },
        email: { // 이메일
            type: DataTypes.STRING(30),
            allowNull: false,
            unique:'email'
        },
        password: { // 비밀번호
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        salt: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        profile_img: { // 프로필 이미지
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        last_visit: { // 최근앱방문일 (연속출석에 사용)
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        continued_visit: { // 연속출석 count
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        fb_token : {
            type: DataTypes.TEXT(),
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
};