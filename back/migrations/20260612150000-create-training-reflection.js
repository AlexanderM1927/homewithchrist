'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('training_reflections', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      topic_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'topics', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('training_reflections', ['topic_id'])
    await queryInterface.addIndex('training_reflections', ['created_by'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('training_reflections')
  }
}
