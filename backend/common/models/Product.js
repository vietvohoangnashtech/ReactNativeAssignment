const { DataTypes } = require("sequelize");
const { productPriceUnits } = require("../../config");

const ProductModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceUnit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: productPriceUnits.DOLLAR,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
};

module.exports = {
  initialise: (sequelize) => {
    module.exports.model = sequelize.define("product", ProductModel)
  },

  createProduct: (user) => {
    return module.exports.model.create(user);
  },

  findProduct: (query) => {
    return module.exports.model.findOne({
      where: query,
    });
  },

  updateProduct: (query, updatedValue) => {
    return module.exports.model.update(updatedValue, {
      where: query,
    });
  },

  findAllProducts: (query) => {
    return module.exports.model.findAll({
      where: query
    });
  },

  deleteProduct: (query) => {
    return module.exports.model.destroy({
      where: query
    });
  }
}
