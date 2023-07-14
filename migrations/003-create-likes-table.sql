CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  transaction_id INT REFERENCES transactions(id),
  created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, transaction_id)
)