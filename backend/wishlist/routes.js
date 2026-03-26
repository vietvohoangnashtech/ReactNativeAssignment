const router = require("express").Router();

const WishlistController = require("./controllers/WishlistController");
const isAuthenticatedMiddleware = require("../common/middlewares/IsAuthenticatedMiddleware");

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items retrieved successfully
 */
router.get(
  "/",
  [isAuthenticatedMiddleware.check],
  WishlistController.getWishlist
);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Toggle product in wishlist (add if not exists, remove if exists)
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Wishlist toggled successfully
 */
router.post(
  "/",
  [isAuthenticatedMiddleware.check],
  WishlistController.toggleWishlist
);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 */
router.delete(
  "/:productId",
  [isAuthenticatedMiddleware.check],
  WishlistController.removeFromWishlist
);

module.exports = router;
