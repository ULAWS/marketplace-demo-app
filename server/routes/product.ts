// routes/product.ts

import express, { Router } from "express";
import {
  getProductList,
  registerProduct,
  getProductDetails,
  makeCounterOffer,
  acceptCounterOffer,
  purchaseProduct,
  getProductImage,
} from "../controllers/product";
import multer from "multer";

export const productRouter: Router = express.Router();
export const imagesRouter: Router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
// Product routes
productRouter.get("/", getProductList);
productRouter.post("/", upload.array("images", 5), registerProduct);
productRouter.get("/:productId", getProductDetails);
productRouter.post("/:productId/counter-offer", makeCounterOffer);
productRouter.post("/:productId/accept-counter-offer", acceptCounterOffer);
productRouter.post("/:productId/purchase", purchaseProduct);
imagesRouter.get("/:filename", getProductImage);
