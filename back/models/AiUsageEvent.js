'use strict'

module.exports = (sequelize, DataTypes) => {
  const AiUsageEvent = sequelize.define(
    'AiUsageEvent',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      provider: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      operation: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      input_tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      output_tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      estimated_cost_usd: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'ai_usage_events',
      timestamps: true,
      updatedAt: false
    }
  )

  return AiUsageEvent
}
