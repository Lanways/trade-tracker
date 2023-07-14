CREATE TABLE transactoins (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(4) CHECK (action IN ('buy','sell'))
  quantity INT NOT NULL,
  price INT NOT NULL,
  transacton_date TIMESTAMP NOT NULL,
  description VARCHAR(500),
  created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
)