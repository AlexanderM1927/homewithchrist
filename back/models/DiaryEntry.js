'use strict'

module.exports = (sequelize, DataTypes) => {
  const DiaryEntry = sequelize.define(
    'DiaryEntry',
    {
      diary_entry_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
      image_path: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: 'diary_entries',
      timestamps: true
    }
  )

  return DiaryEntry
}
