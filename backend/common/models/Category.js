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
    this.model = sequelize.define("category", CategoryModel);
  },

  createCategory: (data) => {
    return this.model.create(data);
  },

  findCategory: (query) => {
    return this.model.findOne({ where: query });
  },

  findAllCategories: (query = {}) => {
    return this.model.findAll({ where: query });
  },

  updateCategory: (query, updatedValue) => {
    return this.model.update(updatedValue, { where: query });
  },

  deleteCategory: (query) => {
    return this.model.destroy({ where: query });
  },
};
