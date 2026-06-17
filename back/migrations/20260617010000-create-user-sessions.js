'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_sessions', {
      session_id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      refresh_token_hash: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      platform: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'web'
      },
      device_name: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.STRING(512),
        allowNull: true
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })

    await queryInterface.addIndex('user_sessions', ['user_id'])
    await queryInterface.addIndex('user_sessions', ['revoked_at'])
    await queryInterface.addIndex('user_sessions', ['expires_at'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_sessions')
  }
}
