'use strict'

module.exports = (sequelize, DataTypes) => {
  const DailyVerse = sequelize.define(
    'DailyVerse',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reference: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: 'daily_verses',
      timestamps: true
    }
  )

  return DailyVerse
}
