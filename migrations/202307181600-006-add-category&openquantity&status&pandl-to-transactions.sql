ALTER TABLE transactions
ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'opening_position',
ADD COLUMN open_quantity INT NOT NULL DEFAULT 0,
ADD COLUMN status VARCHAR NOT NULL DEFAULT 'open',
ADD COLUMN pandl VARCHAR(50);