'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diary_entries', 'share_token', {
      type: Sequelize.STRING(64),
      allowNull: true
    })
    await queryInterface.addColumn('diary_entries', 'shared_at', {
      type: Sequelize.DATE,
      allowNull: true
    })
    await queryInterface.addIndex('diary_entries', ['share_token'], {
      unique: true,
      name: 'diary_entries_share_token_unique'
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('diary_entries', 'diary_entries_share_token_unique')
    await queryInterface.removeColumn('diary_entries', 'shared_at')
    await queryInterface.removeColumn('diary_entries', 'share_token')
  }
}
