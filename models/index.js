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

/* Question : Answer */
db.Question.hasMany(db.Answer, { foreignKey: 'question_id'});
db.Answer.belongsTo(db.Question, { foreignKey: 'question_id'});

/* Category : Question */
db.Category.hasMany(db.Question, { foreignKey: 'category_id' });
db.Question.belongsTo(db.Category, { foreignKey: 'category_id' });

/* User : Answer */
db.User.hasMany(db.Answer, { foreignKey : 'user_id'});
db.Answer.belongsTo(db.User, { foreignKey : 'user_id'});

db.User.hasMany(db.Comment, {foreignKey : 'user_id'});
db.Comment.belongsTo(db.User, {foreignKey : 'user_id'});

db.Answer.hasMany(db.Comment, {foreignKey : 'answer_id'});
db.Comment.belongsTo(db.Answer, {foreignKey : 'answer_id'});

db.Comment.hasMany(db.Comment, { as : 'Children', foreignKey : 'parent_id'});
db.Comment.belongsTo(db.Comment, { as : 'Parent', foreignKey : 'parent_id'});

/* User : Answer => scrap */
db.User.belongsToMany(db.Answer, { through: 'Scrap', as: 'Scrapped', foreignKey: 'user_id' });
db.Answer.belongsToMany(db.User, { through: 'Scrap', as: 'Scrapper', foreignKey: 'answer_id'});


/* User : User => block */
db.User.belongsToMany(db.User, { through: 'Block', as: 'Blocked', foreignKey : 'blocked_id'});
db.User.belongsToMany(db.User, { through: 'Block', as: 'Blocker', foreignKey : 'user_id'});

/* User : User => follow */
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followed', foreignKey : 'followed_id'});
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Follower', foreignKey : 'follower_id'});

/* User : User => recentSearch */
db.User.belongsToMany(db.User, { through: 'RecentSearch', as: 'Searched', foreignKey: 'searched_id'});
db.User.belongsToMany(db.User, { through: 'RecentSearch', as: 'Searcher', foreignKey : 'user_id' });



module.exports = db;