"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn(
        "users",
        "inactive",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "users",
        "activationToken",
        {
          type: Sequelize.STRING,
          defaultValue: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("users", "inactive",{transaction});
      await queryInterface.removeColumn("users", "activationToken",{transaction});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }
  },
};
