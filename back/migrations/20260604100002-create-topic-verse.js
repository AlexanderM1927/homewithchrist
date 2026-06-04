'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('topic_verses', {
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
      verse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'verses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weight: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
      }
    });

    await queryInterface.addIndex('topic_verses', ['topic_id', 'verse_id'], {
      unique: true,
      name: 'topic_verses_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('topic_verses');
  }
};
