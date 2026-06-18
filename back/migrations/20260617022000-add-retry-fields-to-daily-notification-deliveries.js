'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('daily_notification_deliveries', 'attempt_count', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    })

    await queryInterface.addColumn('daily_notification_deliveries', 'next_retry_at', {
      type: Sequelize.DATE,
      allowNull: true
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('daily_notification_deliveries', 'next_retry_at')
    await queryInterface.removeColumn('daily_notification_deliveries', 'attempt_count')
  }
}
