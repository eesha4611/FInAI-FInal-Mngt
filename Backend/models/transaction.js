module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",   // maps JS → DB column
      },

      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "transactions",
      timestamps: true,
      underscored: true   // 🔥 THIS FIXES created_at + updated_at
    }
  );

  return Transaction;
};