'use strict'

module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    'Chat',
    {
      chat_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      share_token: {
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: true
      },
      shared_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'chats',
      timestamps: true
    }
  )

  return Chat
}
