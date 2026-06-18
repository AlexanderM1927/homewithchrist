'use strict'

module.exports = (sequelize, DataTypes) => sequelize.define(
  'PushNotificationToken',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session_id: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true
    },
    platform: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'android'
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_seen_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: 'push_notification_tokens',
    timestamps: true
  }
)
