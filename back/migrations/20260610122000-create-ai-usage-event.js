'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_usage_events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      operation: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      input_tokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      output_tokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      estimated_cost_usd: {
        type: Sequelize.DECIMAL(12, 6),
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })

    await queryInterface.addIndex('ai_usage_events', ['provider', 'createdAt'], {
      name: 'ai_usage_events_provider_created_at'
    })
    await queryInterface.addIndex('ai_usage_events', ['user_id', 'provider', 'createdAt'], {
      name: 'ai_usage_events_user_provider_created_at'
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ai_usage_events')
  }
}
