const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "mysql",
    logging: false,
  }
);

// Import models
const ReceiptScan = require("./ReceiptScan")(sequelize, DataTypes);
const User = require("./user")(sequelize, DataTypes);
const Transaction = require('./transaction')(sequelize, DataTypes);

// Collect models
const db = {
  sequelize,
  Sequelize,
  ReceiptScan,
  User,
  Transaction
};

module.exports = db;