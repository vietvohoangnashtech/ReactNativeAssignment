const router = require("express").Router();

const CategoryController = require("./controllers/CategoryController");
const isAuthenticatedMiddleware = require("./../common/middlewares/IsAuthenticatedMiddleware");
const SchemaValidationMiddleware = require("../common/middlewares/SchemaValidationMiddleware");
const CheckPermissionMiddleware = require("../common/middlewares/CheckPermissionMiddleware");

const createCategoryPayload = require("./schemas/createCategoryPayload");
const updateCategoryPayload = require("./schemas/updateCategoryPayload");
const { roles } = require("../config");

router.get(
  "/",
  [isAuthenticatedMiddleware.check],
  CategoryController.getAllCategories,
);

router.get(
  "/:categoryId",
  [isAuthenticatedMiddleware.check],
  CategoryController.getCategoryById,
);

router.post(
  "/",
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN),
    SchemaValidationMiddleware.verify(createCategoryPayload),
  ],
  CategoryController.createCategory,
);

router.patch(
  "/:categoryId",
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN),
    SchemaValidationMiddleware.verify(updateCategoryPayload),
  ],
  CategoryController.updateCategory,
);

router.delete(
  "/:categoryId",
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN),
  ],
  CategoryController.deleteCategory,
);

module.exports = router;
