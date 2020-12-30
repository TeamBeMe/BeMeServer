const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};
let sequelize;
if (config.use_env_variable) {
sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else { 
sequelize = new Sequelize(config.database, config.username, config.password, config);
}
 
db.sequelize = sequelize; 
db.Sequelize = Sequelize; 

db.User = require('./user')(sequelize, Sequelize);
db.Answer = require('./answer')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.Question = require('./question')(sequelize, Sequelize);
db.Scrap = require('./scrap')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Block = require('./block')(sequelize, Sequelize);
db.Follow = require('./follow')(sequelize, Sequelize);
db.RecentSearch = require('./recentSearch')(sequelize, Sequelize);

/* 1 : 1 Question : Answer */
db.Question.hasOne(db.Answer, { foreignKey: 'question_id'});
db.Answer.belongsTo(db.Question, { foreignKey: 'question_id'});

/* 1 : N Category : Question */
db.Category.hasMany(db.Question, { foreignKey: 'category_id' });
db.Question.belongsTo(db.Category, { foreignKey: 'category_id' });

/* 1 : N User : Answer */
db.User.hasMany(db.Answer, { foreignKey : 'user_id'});
db.Answer.belongsTo(db.User, { foreignKey : 'user_id'});

/* M : N User : Answer => scrap */
db.User.belongsToMany(db.Answer, { through: 'Scrap', as: 'Scrapped', foreignKey: 'user_id' });
db.Answer.belongsToMany(db.User, { through: 'Scrap', as: 'Scrapper', foreignKey: 'answer_id'});

/* M : N User : Answer => comment */
db.User.belongsToMany(db.Answer, { through: 'Comment', as: 'Commented', foreignKey : 'user_id'});
db.Answer.belongsToMany(db.User, { through: 'Comment', as: 'Commenter', foreignKey : 'answer_id'});

/* M : N User : User => block */
db.User.belongsToMany(db.User, { through: 'Block', as: 'Blocked'});
db.User.belongsToMany(db.User, { through: 'Block', as: 'Blocker'});

/* M : N User : User => follow */
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followed'});
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Follower'});

/* M : N User : User => recentSearch */
db.User.belongsToMany(db.User, { through: 'RecentSearch', as: 'Searched'});
db.User.belongsToMany(db.User, { through: 'RecentSearch', as: 'Searcher' });



module.exports = db;