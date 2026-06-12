'use strict'

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('chat_messages', ['chat_id', 'message_order'], {
      unique: true,
      name: 'chat_messages_chat_order_unique'
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('chat_messages', 'chat_messages_chat_order_unique')
  }
}
