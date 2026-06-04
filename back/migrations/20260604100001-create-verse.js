'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      book: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      chapter: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      verse_start: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      verse_end: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      reference: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'RVR1960'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
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
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('verses');
  }
};
