const { Pool } = require('pg')
let pool
if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
} else {
  pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
}

module.exports = {
  getUserByName: async (username) => {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0]
  },

  createUser: async (username, account, password, email) => {
    const res = await pool.query(
      'INSERT INTO users (username, account, password, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, account, password, email]
    );
    return res.rows[0]
  },
  findOneUserByAccount: async (account) => {
    const res = await pool.query('SELECT * FROM users WHERE account = $1', [account]);
    return res.rows[0]
  },
  getUserById: async (id) => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0]
  },
  updateUser: async (username, introduction, avatarPath, userId) => {
    const updatedUserRes = await pool.query('UPDATE users SET username = $1, introduction = $2, avatar = $3, updated_on = NOW() WHERE id = $4 RETURNING *', [username, introduction, avatarPath, userId])
    return updatedUserRes.rows[0]
  },
  createTransaction: async (user_id, action, quantity, price, transaction_date, description) => {
    const openQuantity = quantity
    const res = await pool.query(
      'INSERT INTO transactions (user_id, action, quantity, price, transaction_date, description, open_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, action, quantity, price, transaction_date, description, openQuantity]
    )
    return res.rows[0]
  },
  getTransactionById: async (id) => {
    const res = await pool.query('SELECT * FROM transactions WHERE id = $1', [id])
    return res.rows[0]
  },
  putTransactionById: async (action, quantity, price, transaction_date, description, transactionId) => {
    const res = await pool.query('UPDATE transactions SET action = $1, quantity = $2, price = $3, transaction_date = $4, description = $5 updated_on = NOW() WHERE id = $6 RETURNING * ', [action, quantity, price, transaction_date, description, transactionId])
    return res.rows[0]
  },
  deleteTransactionById: async (transactionId) => {
    const res = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [transactionId])
    return res.rows[0]
  },
  getTransactionsByDateRange: async (userId, startDate, endDate) => {
    const res = await pool.query(`SELECT t.*, json_agg(row_to_json(c_alias)) AS closures
    FROM transactions t
    LEFT JOIN (
    SELECT c.open_transaction_id AS open_transaction_id, c.closed_transaction_id AS closed_transaction_id
    FROM closures c
    ) 
    c_alias ON c_alias.open_transaction_id = t.id
    WHERE t.user_id = $1 AND t.transaction_date BETWEEN $2 AND $3
    GROUP BY t.id
    ORDER BY t.transaction_date`, [userId, startDate, endDate])
    return res.rows
  },
  findOppositeOpenTransaction: async (userId, action) => {
    const oppositeAction = action === "buy" ? "sell" : "buy"
    const res = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 AND action = $2 AND status = 'open' AND open_quantity > 0 ORDER BY created_on ASC LIMIT 1`,
      [userId, oppositeAction]
    )
    return res.rows[0]
  },
  createClosure: async (openTransactionId, closedTransactionId, closedQuantity, preice) => {
    const res = await pool.query(
      'INSERT INTO closures (open_transaction_id, closed_transaction_id, closed_quantity, price) VALUES ($1, $2, $3 ,$4)',
      [openTransactionId, closedTransactionId, closedQuantity, preice]
    )
    return res.rows[0]
  },
  updateTransactionStatus: async (id, openQuantity, status, category, profit) => {
    if (category) {
      await pool.query(
        `UPDATE transactions SET category = $1, open_quantity = $2, status = $3, pandl = $4 WHERE id = $5`,
        [category, openQuantity, status, profit, id]
      )
    } else {
      await pool.query(
        `UPDATE transactions SET open_quantity = $1, status = $2 WHERE id = $3`,
        [openQuantity, status, id]
      )
    }
  },
  updateClosingTransaction: async (quantity, category, openQuantity, status, profit, transactionId) => {
    await pool.query(
      `UPDATE transactions SET quantity = $1, category = $2, open_quantity = $3, status = $4, pandl = $5 WHERE id = $6`,
      [quantity, category, openQuantity, status, profit, transactionId]
    )
  },
  changePublic: async (newPublicValue, transactionId) => {
    const res = await pool.query('UPDATE transactions SET is_public = $1 WHERE id = $2', [newPublicValue, transactionId])
    return res.rows[0]
  },
  deletePublic: async (newPublicValue, transactionId) => {
    const res = await pool.query('UPDATE transactions SET is_public = $1 WHERE id = $2', [newPublicValue, transactionId])
    return res.rows[0]
  },
  getPublicTransactions: async (currentUserId) => {
    const res = await pool.query(`
    SELECT t.*, 
            CASE WHEN l.user_id = $1 THEN true ELSE false END AS is_liked,
            u.username AS transaction_user_name,
            u.account AS transaction_user_account,
            (SELECT COUNT(*) FROM likes lc WHERE lc.transaction_id = t.id) AS like_count,
            (SELECT COUNT(*) FROM replies r WHERE r.transaction_id = t.id) AS replies_count
     FROM transactions t
     LEFT JOIN likes l ON t.id = l.transaction_id AND l.user_id = $1
     LEFT JOIN users u ON t.user_id = u.id
     WHERE t.is_public = true
     ORDER BY l.created_on DESC
    `, [currentUserId])
    return res.rows
  },
  createLike: async (userId, transactionId) => {
    const res = await pool.query(`INSERT INTO likes (user_id, transaction_id) VALUES($1, $2) RETURNING *`, [userId, transactionId])
    return res.rows[0]
  },
  removeLike: async (userId, transactionId) => {
    const res = await pool.query(`DELETE FROM likes WHERE user_id = $1 AND transaction_id = $2  RETURNING *`, [userId, transactionId])
    return res.rows[0]
  },
  transactionExists: async (transactionId) => {
    const res = await pool.query(`SELECT 1 FROM  transactions WHERE id = $1`, [transactionId])
    return res.rows.length > 0;
  },
  postReply: async (userId, transactionId, content) => {
    const res = await pool.query('INSERT INTO replies (user_id, transaction_id, content) VALUES ($1, $2, $3) RETURNING *', [userId, transactionId, content])
    return res.rows[0]
  },
  deleteReply: async (replyId) => {
    const res = await pool.query('DELETE FROM replies WHERE id = $1 RETURNING *', [replyId])
    return res.rows[0]
  },
  getReplies: async (transactionId) => {
    const res = await pool.query('SELECT * FROM replies WHERE transaction_id = $1', [transactionId])
    return res.rows
  },

}
