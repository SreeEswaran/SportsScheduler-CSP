const Sequelize = require("sequelize");
const database = "capstone_dev";
const username = "postgres";
const password = "4919";
const sequelize = new Sequelize(database, username, password, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});
const connect = async () => {
  return sequelize.authenticate();
};
module.exports = {
  connect,
  sequelize,
};
