-- Active: 1712147323081@@127.0.0.1@5432@linkby_demo@public
ALTER TABLE counter_offers
ADD COLUMN offer_made_by_user_id INT,
ADD COLUMN offer_made_to_user_id INT;

ALTER TABLE counter_offers
ADD COLUMN status VARCHAR(255);