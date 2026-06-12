'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('verses', 'version', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'CEE'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('verses', 'version', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'RVR1960'
    })
  }
}
