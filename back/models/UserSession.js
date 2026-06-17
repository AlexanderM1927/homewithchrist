'use strict'

module.exports = (sequelize, DataTypes) => sequelize.define(
  'UserSession',
  {
    session_id: {
      type: DataTypes.STRING(64),
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    refresh_token_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    platform: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'web'
    },
    device_name: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'user_sessions',
    timestamps: true
  }
)
