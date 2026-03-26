const ProductModel = require("../../common/models/Product");
const { Op } = require("sequelize");

module.exports = {
  getAllProducts: (req, res) => {
    const { since, ...filters } = req.query;

    if (since) {
      // Delta fetch: return products updated after `since` timestamp
      const sinceDate = new Date(parseInt(since, 10));
      const query = { ...filters, updatedAt: { [Op.gt]: sinceDate } };
      ProductModel.findAllProducts(query)
        .then((products) => {
          return res.status(200).json({
            status: true,
            data: products,
            meta: { since: parseInt(since, 10), fetchedAt: Date.now() },
          });
        })
        .catch((err) => {
          return res.status(500).json({ status: false, error: err });
        });
      return;
    }

    ProductModel.findAllProducts(filters)
      .then((products) => {
        return res.status(200).json({
          status: true,
          data: products,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  getProductById: (req, res) => {
    const {
      params: { productId },
    } = req;

    ProductModel.findProduct({ id: productId })
      .then((product) => {
        return res.status(200).json({
          status: true,
          data: product.toJSON(),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  createProduct: (req, res) => {
    const { body } = req;

    ProductModel.createProduct(body)
      .then((product) => {
        return res.status(200).json({
          status: true,
          data: product.toJSON(),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  updateProduct: (req, res) => {
    const {
      params: { productId },
      body: payload,
    } = req;

    // IF the payload does not have any keys,
    // THEN we can return an error, as nothing can be updated
    if (!Object.keys(payload).length) {
      return res.status(400).json({
        status: false,
        error: {
          message: "Body is empty, hence can not update the product.",
        },
      });
    }

    ProductModel.updateProduct({ id: productId }, payload)
      .then(() => {
        return ProductModel.findProduct({ id: productId });
      })
      .then((product) => {
        return res.status(200).json({
          status: true,
          data: product.toJSON(),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  deleteProduct: (req, res) => {
    const {
      params: { productId },
    } = req;

    ProductModel.deleteProduct({id: productId})
      .then((numberOfEntriesDeleted) => {
        return res.status(200).json({
          status: true,
          data: {
            numberOfProductsDeleted: numberOfEntriesDeleted
          },
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
