'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verse_embeddings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      verse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'verses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ollama'
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      embedding: {
        type: Sequelize.JSON,
        allowNull: false
      },
      text_hash: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })

    await queryInterface.addIndex('verse_embeddings', ['verse_id', 'provider', 'model'], {
      unique: true,
      name: 'verse_embeddings_verse_provider_model_unique'
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('verse_embeddings')
  }
}
