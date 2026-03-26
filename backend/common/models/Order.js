const { DataTypes } = require("sequelize");
const { orderStatuses } = require("../../config");

const OrderModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: orderStatuses.PENDING,
  },
  idempotencyKey: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
};

module.exports = {
  initialise: (sequelize) => {
    module.exports.model = sequelize.define("order", OrderModel);
  },

  createOrder: (order) => {
    return module.exports.model.create(order);
  },

  findOrder: (query) => {
    return module.exports.model.findOne({
      where: query,
    });
  },

  updateOrder: (query, updatedValue) => {
    return module.exports.model.update(updatedValue, {
      where: query,
    });
  },

  findAllOrders: (query) => {
    return module.exports.model.findAll({
      where: query,
    });
  },
};
