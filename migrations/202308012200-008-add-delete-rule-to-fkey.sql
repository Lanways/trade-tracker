ALTER TABLE transactions
DROP CONSTRAINT transactions_user_id_fkey,
ADD CONSTRAINT transactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE replies
DROP CONSTRAINT replies_user_id_fkey,
ADD CONSTRAINT replies_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
DROP CONSTRAINT replies_transaction_id_fkey,
ADD CONSTRAINT replies_transaction_id_fkey
FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE;

ALTER TABLE likes
DROP CONSTRAINT likes_user_id_fkey,
ADD CONSTRAINT likes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
DROP CONSTRAINT likes_transaction_id_fkey,
ADD CONSTRAINT likes_transaction_id_fkey
FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE;

ALTER TABLE closures
DROP CONSTRAINT closures_open_transaction_id_fkey,
ADD CONSTRAINT closures_open_transaction_id_fkey
FOREIGN KEY (open_transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
DROP CONSTRAINT closures_closed_transaction_id_fkey,
ADD CONSTRAINT closures_closed_transaction_id_fkey
FOREIGN KEY (closed_transaction_id) REFERENCES transactions (id) ON DELETE CASCADE;