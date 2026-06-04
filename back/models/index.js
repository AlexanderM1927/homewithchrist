'use strict'
const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION || 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

const Role = require('./Role')(sequelize, DataTypes)
const User = require('./User')(sequelize, DataTypes)
const Topic = require('./Topic')(sequelize, DataTypes)
const Verse = require('./Verse')(sequelize, DataTypes)
const TopicVerse = require('./TopicVerse')(sequelize, DataTypes)

// Associations
Role.hasMany(User, { foreignKey: 'role_id' })
User.belongsTo(Role, { foreignKey: 'role_id' })

Topic.belongsToMany(Verse, { through: TopicVerse, foreignKey: 'topic_id', otherKey: 'verse_id' })
Verse.belongsToMany(Topic, { through: TopicVerse, foreignKey: 'verse_id', otherKey: 'topic_id' })
TopicVerse.belongsTo(Topic, { foreignKey: 'topic_id' })
TopicVerse.belongsTo(Verse, { foreignKey: 'verse_id' })

module.exports = { sequelize, Role, User, Topic, Verse, TopicVerse }
