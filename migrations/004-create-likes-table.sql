DROP TABLE IF EXISTS likes;

CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES user(id)
  transactoins_id INT REFERENCES transactoins(id)
  created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, transactoins_id)
)