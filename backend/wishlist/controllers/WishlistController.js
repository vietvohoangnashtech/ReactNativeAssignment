const WishlistModel = require("../../common/models/Wishlist");

module.exports = {
  getWishlist: (req, res) => {
    const { userId } = req.user;

    WishlistModel.findAllWishlistItems({ userId })
      .then((items) => {
        return res.status(200).json({
          status: true,
          data: items.map((item) => item.toJSON()),
        });
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },

  toggleWishlist: (req, res) => {
    const { userId } = req.user;
    const productId = parseInt(req.body.productId, 10);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        status: false,
        error: { message: "productId is required." },
      });
    }

    WishlistModel.findWishlistItem({ userId, productId })
      .then((existing) => {
        if (existing) {
          return WishlistModel.deleteWishlistItem({ userId, productId }).then(
            () => {
              return res.status(200).json({
                status: true,
                data: { wishlisted: false, productId },
              });
            }
          );
        }
        return WishlistModel.createWishlistItem({ userId, productId }).then(
          (item) => {
            return res.status(200).json({
              status: true,
              data: { wishlisted: true, productId, item: item.toJSON() },
            });
          }
        );
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },

  removeFromWishlist: (req, res) => {
    const { userId } = req.user;
    const productId = parseInt(req.params.productId, 10);

    WishlistModel.deleteWishlistItem({ userId, productId })
      .then(() => {
        return res.status(200).json({
          status: true,
          data: { wishlisted: false, productId },
        });
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },
};
