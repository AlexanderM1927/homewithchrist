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
      max: 20,
      min: 2,
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
const VerseEmbedding = require('./VerseEmbedding')(sequelize, DataTypes)
const AiUsageEvent = require('./AiUsageEvent')(sequelize, DataTypes)
const DailyVerse = require('./DailyVerse')(sequelize, DataTypes)
const Chat = require('./Chat')(sequelize, DataTypes)
const ChatMessage = require('./ChatMessage')(sequelize, DataTypes)
const DiaryEntry = require('./DiaryEntry')(sequelize, DataTypes)
const TrainingReflection = require('./TrainingReflection')(sequelize, DataTypes)
const UserSession = require('./UserSession')(sequelize, DataTypes)
const PushNotificationToken = require('./PushNotificationToken')(sequelize, DataTypes)
const DailyNotificationDelivery = require('./DailyNotificationDelivery')(sequelize, DataTypes)

// Associations
Role.hasMany(User, { foreignKey: 'role_id' })
User.belongsTo(Role, { foreignKey: 'role_id' })

User.hasMany(Chat, { foreignKey: 'user_id' })
Chat.belongsTo(User, { foreignKey: 'user_id' })

Chat.hasMany(ChatMessage, { as: 'messages', foreignKey: 'chat_id', onDelete: 'CASCADE' })
ChatMessage.belongsTo(Chat, { foreignKey: 'chat_id' })

User.hasMany(DiaryEntry, { as: 'diaryEntries', foreignKey: 'user_id', onDelete: 'CASCADE' })
DiaryEntry.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(AiUsageEvent, { as: 'aiUsageEvents', foreignKey: 'user_id', onDelete: 'SET NULL' })
AiUsageEvent.belongsTo(User, { foreignKey: 'user_id' })
User.hasMany(UserSession, { as: 'sessions', foreignKey: 'user_id', onDelete: 'CASCADE' })
UserSession.belongsTo(User, { foreignKey: 'user_id' })
User.hasMany(PushNotificationToken, { as: 'pushTokens', foreignKey: 'user_id', onDelete: 'CASCADE' })
PushNotificationToken.belongsTo(User, { foreignKey: 'user_id' })
UserSession.hasMany(PushNotificationToken, { as: 'pushTokens', foreignKey: 'session_id', onDelete: 'CASCADE' })
PushNotificationToken.belongsTo(UserSession, { as: 'session', foreignKey: 'session_id' })
PushNotificationToken.hasMany(DailyNotificationDelivery, { as: 'deliveries', foreignKey: 'push_token_id', onDelete: 'CASCADE' })
DailyNotificationDelivery.belongsTo(PushNotificationToken, { foreignKey: 'push_token_id' })
DailyVerse.hasMany(DailyNotificationDelivery, { as: 'notificationDeliveries', foreignKey: 'daily_verse_id', onDelete: 'SET NULL' })
DailyNotificationDelivery.belongsTo(DailyVerse, { foreignKey: 'daily_verse_id' })

Topic.belongsToMany(Verse, { through: TopicVerse, foreignKey: 'topic_id', otherKey: 'verse_id' })
Verse.belongsToMany(Topic, { through: TopicVerse, foreignKey: 'verse_id', otherKey: 'topic_id' })
TopicVerse.belongsTo(Topic, { foreignKey: 'topic_id' })
TopicVerse.belongsTo(Verse, { foreignKey: 'verse_id' })
User.hasMany(TopicVerse, { as: 'createdTopicVerses', foreignKey: 'created_by' })
TopicVerse.belongsTo(User, { as: 'creator', foreignKey: 'created_by' })
User.hasMany(Verse, { as: 'createdVerses', foreignKey: 'created_by' })
Verse.belongsTo(User, { as: 'creator', foreignKey: 'created_by' })
User.hasMany(Verse, { as: 'updatedVerses', foreignKey: 'updated_by' })
Verse.belongsTo(User, { as: 'modifier', foreignKey: 'updated_by' })
User.hasMany(DailyVerse, { as: 'createdDailyVerses', foreignKey: 'created_by' })
DailyVerse.belongsTo(User, { as: 'creator', foreignKey: 'created_by' })
Topic.hasMany(TrainingReflection, { as: 'trainingReflections', foreignKey: 'topic_id', onDelete: 'CASCADE' })
TrainingReflection.belongsTo(Topic, { foreignKey: 'topic_id' })
User.hasMany(TrainingReflection, { as: 'createdTrainingReflections', foreignKey: 'created_by' })
TrainingReflection.belongsTo(User, { as: 'creator', foreignKey: 'created_by' })
Verse.hasMany(VerseEmbedding, { as: 'embeddings', foreignKey: 'verse_id', onDelete: 'CASCADE' })
VerseEmbedding.belongsTo(Verse, { foreignKey: 'verse_id' })

module.exports = {
  sequelize,
  Role,
  User,
  UserSession,
  PushNotificationToken,
  DailyNotificationDelivery,
  Topic,
  Verse,
  TopicVerse,
  VerseEmbedding,
  AiUsageEvent,
  DailyVerse,
  Chat,
  ChatMessage,
  DiaryEntry,
  TrainingReflection
}
