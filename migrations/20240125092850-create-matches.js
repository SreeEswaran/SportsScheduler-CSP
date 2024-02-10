"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("matches", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sport: {
        type: Sequelize.STRING,
      },
      admin: {
        type: Sequelize.STRING,
      },
      match: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      teamsize: {
        type: Sequelize.INTEGER,
      },
      venue: {
        type: Sequelize.STRING,
      },
      timein: {
        type: Sequelize.STRING,
      },
      timeout: {
        type: Sequelize.STRING,
      },
      reason: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("matches");
  },
};
