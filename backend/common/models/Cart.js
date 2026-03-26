const { DataTypes } = require("sequelize");

const CartModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
};

module.exports = {
  initialise: (sequelize) => {
    module.exports.model = sequelize.define("cart", CartModel, {
      indexes: [
        {
          unique: true,
          fields: ["userId", "productId"],
        },
      ],
    });
  },

  findUserCart: (userId) => {
    return module.exports.model.findAll({ where: { userId } });
  },

  upsertCartItem: (userId, productId, quantity) => {
    return module.exports.model.upsert({ userId, productId, quantity });
  },

  replaceUserCart: async (userId, items) => {
    await module.exports.model.destroy({ where: { userId } });
    if (items.length === 0) return [];
    return module.exports.model.bulkCreate(
      items.map((item) => ({
        userId,
        productId: item.productId,
        quantity: item.quantity,
      }))
    );
  },

  clearUserCart: (userId) => {
    return module.exports.model.destroy({ where: { userId } });
  },
};
