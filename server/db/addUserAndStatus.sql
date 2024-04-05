-- Active: 1712147323081@@127.0.0.1@5432@linkby_demo@public
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE counter_offers (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  user_id INT REFERENCES users(id),
  price DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products
ADD COLUMN seller_id INT REFERENCES users(id),
ADD COLUMN status_id INT REFERENCES statuses(id),
ADD COLUMN accepted_counter_offer_id INT REFERENCES counter_offers(id);
