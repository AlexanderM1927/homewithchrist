'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('daily_notification_deliveries', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      push_token_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'push_notification_tokens',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      daily_verse_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'daily_verses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      notification_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.STRING(500),
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

    await queryInterface.addIndex(
      'daily_notification_deliveries',
      ['push_token_id', 'notification_date'],
      {
        unique: true,
        name: 'daily_notification_deliveries_token_date_unique'
      }
    )
    await queryInterface.addIndex('daily_notification_deliveries', ['notification_date'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('daily_notification_deliveries')
  }
}
