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
    this.model = sequelize.define("cart", CartModel, {
      indexes: [
        {
          unique: true,
          fields: ["userId", "productId"],
        },
      ],
    });
  },

  findUserCart: (userId) => {
    return this.model.findAll({ where: { userId } });
  },

  upsertCartItem: (userId, productId, quantity) => {
    return this.model.upsert({ userId, productId, quantity });
  },

  replaceUserCart: async (userId, items) => {
    await this.model.destroy({ where: { userId } });
    if (items.length === 0) return [];
    return this.model.bulkCreate(
      items.map((item) => ({
        userId,
        productId: item.productId,
        quantity: item.quantity,
      }))
    );
  },

  clearUserCart: (userId) => {
    return this.model.destroy({ where: { userId } });
  },
};
