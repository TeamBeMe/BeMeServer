const { User } = require("./index");
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('RecentSearch', {

        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            } 
        },
        searched_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: true,
    });
};