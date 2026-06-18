'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('push_notification_tokens', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
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
      session_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'user_sessions',
          key: 'session_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING(512),
        allowNull: false,
        unique: true
      },
      platform: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'android'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: false
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

    await queryInterface.addIndex('push_notification_tokens', ['user_id'])
    await queryInterface.addIndex('push_notification_tokens', ['session_id'])
    await queryInterface.addIndex('push_notification_tokens', ['enabled'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('push_notification_tokens')
  }
}
