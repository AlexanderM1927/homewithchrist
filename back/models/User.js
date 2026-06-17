'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      preferred_locale: {
        type: DataTypes.STRING(10),
        allowNull: true
      }
    },
    {
      tableName: 'users',
      timestamps: true
    }
  )

  return User
}
