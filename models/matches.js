"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class matches extends Model {
    static associate(models) {}
  }
  matches.init(
    {
      sport: DataTypes.STRING,
      admin: DataTypes.STRING,
      match: DataTypes.STRING,
      date: DataTypes.DATEONLY,
      teamsize: DataTypes.INTEGER,
      venue: DataTypes.STRING,
      timein: DataTypes.STRING,
      timeout: DataTypes.STRING,
      reason: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "matches",
    }
  );
  return matches;
};
