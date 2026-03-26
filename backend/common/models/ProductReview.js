const { DataTypes } = require("sequelize");

const ProductReviewModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

module.exports = {
  initialise: (sequelize) => {
    module.exports.model = sequelize.define("productreview", ProductReviewModel, {
      indexes: [
        {
          unique: true,
          fields: ["userId", "productId"],
        },
      ],
    });
  },

  createReview: (data) => {
    return module.exports.model.create(data);
  },

  findReview: (query) => {
    return module.exports.model.findOne({
      where: query,
    });
  },

  findAllReviews: (query) => {
    return module.exports.model.findAll({
      where: query,
      include: [
        {
          association: 'user',
          attributes: ['username', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },
};
