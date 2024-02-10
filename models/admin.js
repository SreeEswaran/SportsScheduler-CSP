"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class admin extends Model {
    static associate(models) {}
  }
  admin.init(
    {
      first: DataTypes.STRING,
      last: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "admin",
    }
  );
  return admin;
};
