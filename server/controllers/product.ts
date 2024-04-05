// controllers/product.ts

import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import path from "path";
import fs from "fs";

// Create a PostgreSQL connection pool
export const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: "localhost",
  database: "linkby_demo",
  password: process.env.DB_PASSWORD,
  port: 5432,
});
const uploadsDirectory = path.join(__dirname, "..", "..", "uploads");

// Get list of products
export const getProductList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM products");
    const products = result.rows;
    client.release();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// Register a new product
export const registerProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productName, price, description, id } = req.body;
    const files = req.files as Express.Multer.File[];
    const images = files.map((file: Express.Multer.File) => file.filename);
    const seller_id = id;
    // Insert product data into the database
    const client = await pool.connect();
    const queryText =
      "INSERT INTO products (name, price, description, images,seller_id,status_id) VALUES ($1, $2, $3, $4,$5,$6) RETURNING *";
    const values = [productName, price, description, images, seller_id, 1];
    const result = await client.query(queryText, values);
    client.release();

    res.status(200).json({ message: "Product registered successfully", product: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Get details of a product
export const getProductDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId);
    // Get product details
    const productQuery = "SELECT * FROM products WHERE id = $1";
    const productValues = [productId];
    const productResult = await pool.query(productQuery, productValues);
    const product = productResult.rows[0];

    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }

    const negotiationHistoryQuery = `SELECT * FROM counter_offers co WHERE co.product_id = $1 ORDER BY co.created_at DESC`;
    const negotiationHistoryValues = [productId];
    const negotiationHistoryResult = await pool.query(negotiationHistoryQuery, negotiationHistoryValues);

    const negotiationHistory = [];
    for (let row of negotiationHistoryResult.rows) {
      const usernameQuery = `    SELECT * FROM users u WHERE u.id = $1  `;
      const buyerId =
        product.seller_id === row.offer_made_to_user_id ? row.offer_made_by_user_id : row.offer_made_to_user_id;
      const usernameValues = [buyerId];
      const usernameResult = await pool.query(usernameQuery, usernameValues);
      const buyer = usernameResult.rows[0];
      negotiationHistory.push({
        price: row.price,
        timestamp: row.created_at,
        buyerName: buyer.username,
        buyerId: buyer.id,
        status: row.status,
        offerBy: product.seller_id === row.offer_made_by_user_id ? "Seller" : "Buyer",
      });
    }

    // Combine product details with negotiation history
    const productDetails = {
      id: product.id,
      name: product.name,
      status: product.status,
      price: product.price,
      description: product.description,
      images: product.images,
      sellerId: product.seller_id,
      statusId: product.status_id,
      negotiationHistory: negotiationHistory,
    };

    res.json(productDetails);
  } catch (error) {
    next(error);
  }
};

// Make a counter offer for a product
export const makeCounterOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId);
    const { price, madeByUserId, madeToUserId } = req.body;

    // Check if the product exists
    const productExistsQuery = "SELECT * FROM products WHERE id = $1";
    const productExistsValues = [productId];
    const { rowCount } = await pool.query(productExistsQuery, productExistsValues);
    if (rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
    }

    // Insert counter offer into the database
    const insertCounterOfferQuery =
      "INSERT INTO counter_offers (product_id, price, offer_made_by_user_id, offer_made_to_user_id, status) VALUES ($1, $2, $3, $4, $5)";
    const insertCounterOfferValues = [productId, price, madeByUserId, madeToUserId, "pending"];
    await pool.query(insertCounterOfferQuery, insertCounterOfferValues);

    res.status(200).json({ ok: true, message: "Counter offer sent successfully" });
  } catch (error) {
    next(error);
  }
};

// Accept a counter offer for a product
export const acceptCounterOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId);
    const { price, madeByUserId, madeToUserId } = req.body;

    // Check if the product exists
    const productExistsQuery = "SELECT * FROM products WHERE id = $1";
    const productExistsValues = [productId];
    const { rowCount } = await pool.query(productExistsQuery, productExistsValues);
    if (rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
    }

    const insertCounterOfferQuery =
      "INSERT INTO counter_offers (product_id, price, offer_made_by_user_id, offer_made_to_user_id, status) VALUES ($1, $2, $3, $4, $5)";
    const insertCounterOfferValues = [productId, price, madeByUserId, madeToUserId, "accepted"];
    await pool.query(insertCounterOfferQuery, insertCounterOfferValues);

    const updateProductQuery = "UPDATE products SET status_id = $1 WHERE id = $2";
    const updateProductValues = [2, productId];
    await pool.query(updateProductQuery, updateProductValues);

    res.status(200).json({ ok: true, message: "Counter offer accepted successfully" });
  } catch (error) {
    next(error);
  }
};

// Purchase a product
export const purchaseProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId);
    const { buyerId, soldPrice } = req.body;
    const updateProductQuery = "UPDATE products SET status_id = $1, sold_to = $2, sold_price = $3 WHERE id = $4";
    const updateProductValues = [3, buyerId, soldPrice, productId];
    await pool.query(updateProductQuery, updateProductValues);

    res.status(200).json({ message: "Product purchased successfully" });
  } catch (error) {
    next(error);
  }
};

// Get images of product
export const getProductImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(uploadsDirectory, filename);

    // Check if the file exists
    if (fs.existsSync(imagePath)) {
      // Read the file and send it in the response
      const fileStream = fs.createReadStream(imagePath);
      fileStream.pipe(res);
    } else {
      // If the file doesn't exist, send a 404 Not Found response
      res.status(404).json({ message: "Image not found" });
    }
  } catch (err) {
    next(err);
  }
};
