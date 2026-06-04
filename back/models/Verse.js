'use strict'

module.exports = (sequelize, DataTypes) => {
  const Verse = sequelize.define(
    'Verse',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      book: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      chapter: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      verse_start: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      verse_end: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      reference: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      version: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'RVR1960'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'verses',
      timestamps: true
    }
  )

  return Verse
}
