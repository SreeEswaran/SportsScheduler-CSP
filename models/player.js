"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class player extends Model {
    static associate(models) {}
  }
  player.init(
    {
      first: DataTypes.STRING,
      last: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      fullname: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "player",
    }
  );
  return player;
};
