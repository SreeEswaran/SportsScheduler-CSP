"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sports extends Model {
    displayableString() {
      return `${this.sport} Admin: ${this.admin}`;
    }
  }
  sports.init(
    {
      sport: DataTypes.STRING,
      admin: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "sports",
    }
  );
  return sports;
};
