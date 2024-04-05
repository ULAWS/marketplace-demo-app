-- Active: 1712147323081@@127.0.0.1@5432@linkby_demo@public
ALTER TABLE products
ADD COLUMN sold_to VARCHAR(255),
ADD COLUMN sold_price NUMERIC(10, 2);
