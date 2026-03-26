const bcrypt = require("bcrypt");
const { roles, categories } = require("./config");
const UserModel = require("./common/models/User");
const ProductModel = require("./common/models/Product");
const CategoryModel = require("./common/models/Category");

// Public image URLs from Unsplash (high-quality, diverse products)
const productImages = [
  // Electronics
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1537638927051-fc82614bef8d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
  // Fashion/Clothing
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1595777707802-221b1860d8fb?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1567123409601-59a0cc2e6d6f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1539533057440-7217c9ea7224?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1552062407-291826ab63fd?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1591047990852-5b05c566123a?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1591047989966-d0756a127995?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1591047990852-5b05c566123a?w=500&h=500&fit=crop",
  // Food
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1606787620884-cf2afb3c1f5f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1565958011504-e7b99a63b314?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1518672590199-1a39e91f5fb1?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1565958011504-e7b99a63b314?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
  // Books
  "https://images.unsplash.com/photo-1543002588-d83cea6bafff?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1507842721343-583f20270319?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1507842721343-583f20270319?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1543002588-d83cea6bafff?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&h=500&fit=crop",
];

const productNames = [
  // Electronics
  "Wireless Headphones Pro",
  "Smart Watch Ultra",
  "USB-C Fast Charger",
  "4K Webcam HD",
  "Portable SSD 1TB",
  "Bluetooth Speaker Max",
  "Noise Cancelling Earbuds",
  "Phone Stand Premium",
  "USB Hub Multi-Port",
  "Power Bank 30000mAh",
  "Mechanical Keyboard RGB",
  "Wireless Mouse Pro",
  "LED Monitor 27 inch",
  "Phone Case Pro Max",
  "Screen Protector Pack",
  // Fashion & Clothing
  "Classic Cotton T-Shirt",
  "Blue Denim Jeans",
  "Leather Jacket Premium",
  "Summer Sundress",
  "Sport Running Shoes",
  "Wool Winter Coat",
  "Baseball Cap Classic",
  "Cotton Hoodie Grey",
  "Athletic Leggings",
  "Formal Dress Pants",
  "Casual Sneakers White",
  "Winter Beanie Hat",
  "Knit Sweater Cozy",
  "Chino Pants Khaki",
  "Polo Shirt Cotton",
  // Food & Beverages
  "Organic Coffee Beans",
  "Dark Chocolate Premium",
  "Green Tea Matcha",
  "Almond Butter Natural",
  "Whole Wheat Bread",
  "Fresh Honey Raw",
  "Olive Oil Extra Virgin",
  "Granola Cereal Mix",
  "Peanut Butter Smooth",
  "Herbal Tea Assortment",
  "Dark Roast Coffee",
  "Coconut Oil Organic",
  "Nuts Mix Premium",
  "Maple Syrup Pure",
  "Trail Mix Deluxe",
  // Books
  "The Midnight Library",
  "Atomic Habits Guide",
  "Sapiens History Book",
  "The Art of Fiction",
  "Mind Over Matter",
];

const productDescriptions = [
  "High quality product with excellent performance",
  "Premium design and durability guaranteed",
  "Top-rated choice by customers worldwide",
  "Best value for money in its category",
  "Professional grade quality at affordable price",
  "Eco-friendly and sustainable choice",
  "Latest technology and innovation included",
  "Perfect for daily use and professional work",
  "Exceptional comfort and reliability",
  "Award-winning product with stellar reviews",
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if data already exists
    const existingUser = await UserModel.findUser({ username: "vietvo" });
    if (existingUser) {
      console.log("✅ Database already seeded. Skipping...");
      return;
    }

    // 1. Seed Categories
    console.log("📁 Seeding categories...");
    const categoryList = [
      { name: categories.ELECTRONICS },
      { name: categories.CLOTHING },
      { name: categories.FOOD },
      { name: categories.BOOKS },
    ];

    for (const category of categoryList) {
      await CategoryModel.createCategory(category);
    }
    console.log("✅ Categories seeded");

    // 2. Seed Vietvo User
    console.log("👤 Seeding vietvo user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const vietvoUser = await UserModel.createUser({
      username: "vietvo",
      email: "vietvo@example.com",
      password: hashedPassword,
      age: 28,
      firstName: "Viet",
      lastName: "Vo",
      role: roles.ADMIN,
    });
    console.log("✅ User vietvo created");

    // 3. Seed 50 Products
    console.log("📦 Seeding 50 products...");
    const categoryNames = [
      categories.ELECTRONICS,
      categories.CLOTHING,
      categories.FOOD,
      categories.BOOKS,
    ];

    for (let i = 0; i < 50; i++) {
      const product = {
        name: productNames[i % productNames.length],
        description: productDescriptions[i % productDescriptions.length],
        image: productImages[i % productImages.length],
        price: Math.floor(Math.random() * 300) + 10,
        category: categoryNames[i % categoryNames.length],
      };

      await ProductModel.createProduct(product);
    }
    console.log("✅ 50 Products seeded");

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    throw error;
  }
};

module.exports = seedDatabase;
