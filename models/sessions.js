"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sessions extends Model {}
  sessions.init(
    {
      sport: DataTypes.STRING,
      admin: DataTypes.STRING,
      match: DataTypes.STRING,
      reason: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "sessions",
    }
  );
  return sessions;
};
