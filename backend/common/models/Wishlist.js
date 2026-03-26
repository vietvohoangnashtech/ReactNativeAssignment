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
    this.model = sequelize.define("wishlist", WishlistModel, {
      indexes: [
        {
          unique: true,
          fields: ["userId", "productId"],
        },
      ],
    });
  },

  findWishlistItem: (query) => {
    return this.model.findOne({ where: query });
  },

  findAllWishlistItems: (query) => {
    return this.model.findAll({ where: query });
  },

  createWishlistItem: (data) => {
    return this.model.create(data);
  },

  deleteWishlistItem: (query) => {
    return this.model.destroy({ where: query });
  },
};
