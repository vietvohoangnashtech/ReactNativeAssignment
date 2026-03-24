const CategoryModel = require("../../common/models/Category");

module.exports = {
  getAllCategories: (req, res) => {
    CategoryModel.findAllCategories()
      .then((categories) => {
        return res.status(200).json({
          status: true,
          data: categories,
        });
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },

  getCategoryById: (req, res) => {
    const { params: { categoryId } } = req;

    CategoryModel.findCategory({ id: categoryId })
      .then((category) => {
        if (!category) {
          return res.status(404).json({ status: false, error: { message: "Category not found." } });
        }
        return res.status(200).json({ status: true, data: category.toJSON() });
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },

  createCategory: (req, res) => {
    const { body } = req;

    CategoryModel.createCategory(body)
      .then((category) => {
        return res.status(200).json({ status: true, data: category.toJSON() });
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },

  updateCategory: (req, res) => {
    const { params: { categoryId }, body: payload } = req;

    if (!Object.keys(payload).length) {
      return res.status(400).json({
        status: false,
        error: { message: "Body is empty, hence can not update the category." },
      });
    }

    CategoryModel.updateCategory({ id: categoryId }, payload)
      .then(() => CategoryModel.findCategory({ id: categoryId }))
      .then((category) => {
        return res.status(200).json({ status: true, data: category.toJSON() });
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },

  deleteCategory: (req, res) => {
    const { params: { categoryId } } = req;

    CategoryModel.deleteCategory({ id: categoryId })
      .then((numberOfEntriesDeleted) => {
        return res.status(200).json({
          status: true,
          data: { numberOfCategoriesDeleted: numberOfEntriesDeleted },
        });
      })
      .catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
  },
};
