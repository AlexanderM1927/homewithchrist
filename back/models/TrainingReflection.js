'use strict'

module.exports = (sequelize, DataTypes) => sequelize.define(
  'TrainingReflection',
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'training_reflections',
    timestamps: true
  }
)
