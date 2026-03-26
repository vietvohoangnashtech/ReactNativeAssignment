const express = require("express");
const router = express.Router();

const SyncController = require("./controllers/SyncController");
const IsAuthenticatedMiddleware = require("../common/middlewares/IsAuthenticatedMiddleware");

/**
 * @swagger
 * /sync/cart:
 *   get:
 *     summary: Get server cart
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items
 */
router.get(
  "/sync/cart",
  [IsAuthenticatedMiddleware.check],
  SyncController.getCart
);

/**
 * @swagger
 * /sync/cart:
 *   post:
 *     summary: Sync cart (replace server cart with client cart)
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Synced cart items
 */
router.post(
  "/sync/cart",
  [IsAuthenticatedMiddleware.check],
  SyncController.syncCart
);

module.exports = router;
