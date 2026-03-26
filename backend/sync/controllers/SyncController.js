const CartModel = require("../../common/models/Cart");

module.exports = {
  getCart: (req, res) => {
    const { userId } = req.user;

    CartModel.findUserCart(userId)
      .then((items) => {
        return res.status(200).json({
          status: true,
          data: items.map((item) => item.toJSON()),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  syncCart: (req, res) => {
    const { userId } = req.user;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        status: false,
        error: { message: "items must be an array" },
      });
    }

    CartModel.replaceUserCart(userId, items)
      .then(() => CartModel.findUserCart(userId))
      .then((saved) => {
        return res.status(200).json({
          status: true,
          data: saved.map((item) => item.toJSON()),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },
};
