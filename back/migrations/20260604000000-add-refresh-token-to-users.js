'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'refresh_token');
  }
};
