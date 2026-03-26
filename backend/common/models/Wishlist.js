const { DataTypes } = require("sequelize");

const WishlistModel = {
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
};

module.exports = {
  initialise: (sequelize) => {
    module.exports.model = sequelize.define("wishlist", WishlistModel, {
      indexes: [
        {
          unique: true,
          fields: ["userId", "productId"],
        },
      ],
    });
  },

  findWishlistItem: (query) => {
    return module.exports.model.findOne({ where: query });
  },

  findAllWishlistItems: (query) => {
    return module.exports.model.findAll({ where: query });
  },

  createWishlistItem: (data) => {
    return module.exports.model.create(data);
  },

  deleteWishlistItem: (query) => {
    return module.exports.model.destroy({ where: query });
  },
};
