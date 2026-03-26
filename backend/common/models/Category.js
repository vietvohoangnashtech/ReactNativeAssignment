const { DataTypes } = require("sequelize");

const CategoryModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
};

module.exports = {
  initialise: (sequelize) => {
    module.exports.model = sequelize.define("category", CategoryModel);
  },

  createCategory: (data) => {
    return module.exports.model.create(data);
  },

  findCategory: (query) => {
    return module.exports.model.findOne({ where: query });
  },

  findAllCategories: (query = {}) => {
    return module.exports.model.findAll({ where: query });
  },

  updateCategory: (query, updatedValue) => {
    return module.exports.model.update(updatedValue, { where: query });
  },

  deleteCategory: (query) => {
    return module.exports.model.destroy({ where: query });
  },
};
