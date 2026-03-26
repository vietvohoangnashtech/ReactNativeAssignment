const Express = require("express");
const app = Express();
const cors = require("cors");
const morgan = require("morgan");
const { Sequelize } = require("sequelize");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const { port } = require("./config");
const PORT = process.env.PORT || port;

// Express Routes Import
const AuthorizationRoutes = require("./authorization/routes");
const UserRoutes = require("./users/routes");
const ProductRoutes = require("./products/routes");
const OrderRoutes = require("./orders/routes");
const CategoryRoutes = require("./categories/routes");
const WishlistRoutes = require("./wishlist/routes");
const SyncRoutes = require("./sync/routes");

// Sequelize model imports
const UserModel = require("./common/models/User");
const ProductModel = require("./common/models/Product");
const OrderModel = require("./common/models/Order");
const ProductReviewModel = require("./common/models/ProductReview");
const CategoryModel = require("./common/models/Category");
const WishlistModel = require("./common/models/Wishlist");
const CartModel = require("./common/models/Cart");

// Seed function for development
const seedDatabase = require("./seed");

app.use(morgan("tiny"));
app.use(cors());

// Middleware that parses the body payloads as JSON to be consumed next set
// of middlewares and controllers.
app.use(Express.json());

// Swagger UI
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./storage/data.db", // Path to the file that will store the SQLite DB.
});

// Initialising the Model on sequelize
UserModel.initialise(sequelize);
ProductModel.initialise(sequelize);
OrderModel.initialise(sequelize);
ProductReviewModel.initialise(sequelize);
CategoryModel.initialise(sequelize);
WishlistModel.initialise(sequelize);
CartModel.initialise(sequelize);

// Define associations
ProductReviewModel.model.belongsTo(UserModel.model, { foreignKey: 'userId' });

// Syncing the models that are defined on sequelize with the tables that alredy exists
// in the database. It creates models as tables that do not exist in the DB.
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Sequelize Initialised!!");

    // Seed database in development mode only
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment) {
      try {
        await seedDatabase();
      } catch (error) {
        console.error("Seeding failed:", error.message);
      }
    }

    // Attaching the Authentication and User Routes to the app.
    app.use("/", AuthorizationRoutes);
    app.use("/user", UserRoutes);
    app.use("/product", ProductRoutes);
    app.use("/order", OrderRoutes);
    app.use("/category", CategoryRoutes);
    app.use("/wishlist", WishlistRoutes);
    app.use("/", SyncRoutes);

    app.listen(PORT, () => {
      console.log("Server Listening on PORT:", port);
    });
  })
  .catch((err) => {
    console.error("Sequelize Initialisation threw an error:", err);
  });
