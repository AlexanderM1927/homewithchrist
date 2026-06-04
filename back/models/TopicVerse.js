'use strict'

module.exports = (sequelize, DataTypes) => {
  const TopicVerse = sequelize.define(
    'TopicVerse',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      verse_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'topic_verses',
      timestamps: true,
      updatedAt: false
    }
  )

  return TopicVerse
}
