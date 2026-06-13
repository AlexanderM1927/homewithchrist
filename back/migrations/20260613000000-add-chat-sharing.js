'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('chats', 'share_token', {
      type: Sequelize.STRING(64),
      allowNull: true
    })
    await queryInterface.addColumn('chats', 'shared_at', {
      type: Sequelize.DATE,
      allowNull: true
    })
    await queryInterface.addIndex('chats', ['share_token'], {
      unique: true,
      name: 'chats_share_token_unique'
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('chats', 'chats_share_token_unique')
    await queryInterface.removeColumn('chats', 'shared_at')
    await queryInterface.removeColumn('chats', 'share_token')
  }
}
