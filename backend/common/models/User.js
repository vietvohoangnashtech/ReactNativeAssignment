const { DataTypes } = require("sequelize");
const { roles } = require("../../config");

const UserModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: roles.USER
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};

module.exports = {
  initialise: (sequelize) => {
    module.exports.model = sequelize.define("user", UserModel);
  },

  createUser: (user) => {
    return module.exports.model.create(user);
  },

  findUser: (query) => {
    return module.exports.model.findOne({
      where: query,
    });
  },

  findOrCreateUser: (query, defaults) => {
    return module.exports.model.findOrCreate({
      where: query,
      defaults,
    });
  },

  updateUser: (query, updatedValue) => {
    return module.exports.model.update(updatedValue, {
      where: query,
    });
  },

  findAllUsers: (query) => {
    return module.exports.model.findAll({
      where: query
    });
  },

  deleteUser: (query) => {
    return module.exports.model.destroy({
      where: query
    });
  }
};
