'use strict'

module.exports = (sequelize, DataTypes) => sequelize.define(
  'DailyNotificationDelivery',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    push_token_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    daily_verse_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notification_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error_message: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    attempt_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    next_retry_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'daily_notification_deliveries',
    timestamps: true
  }
)
