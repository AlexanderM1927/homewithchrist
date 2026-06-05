'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diary_entries', {
      diary_entry_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      title: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT('long'),
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
    });

    await queryInterface.addIndex('diary_entries', ['user_id', 'createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('diary_entries');
  }
};
