CREATE TABLE IF NOT EXISTS closures (
  closure_id SERIAL PRIMARY KEY,
  open_transaction_id INT REFERENCES transactions(id),
  closed_transaction_id INT REFERENCES transactions(id),
  closed_quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
