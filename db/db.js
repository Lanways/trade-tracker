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
  createTransaction: async (user_id, action, quantity, price, transaction_date, description, ispublic) => {
    const openQuantity = quantity
    const res = await pool.query(
      'INSERT INTO transactions (user_id, action, quantity, price, transaction_date, description, is_public, open_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [user_id, action, quantity, price, transaction_date, description, ispublic, openQuantity]
    )
    return res.rows[0]
  },
  getTransactionById: async (transactionId, currentUserId) => {
    const res = await pool.query(`
    SELECT t.*,
     CASE WHEN l.user_id = $2 THEN true ELSE false END AS is_like,
     u.avatar AS transaction_user_avatar,
     u.username AS transaction_user_name,
     u.account AS transaction_user_account,
     (SELECT COUNT(*) FROM likes lc WHERE lc.transaction_id = t.id) AS like_count,
     (SELECT COUNT(*) FROM replies r WHERE r.transaction_id = t.id) AS replies_count
    FROM transactions t
    LEFT JOIN likes l ON t.id = l.transaction_id AND l.user_id = $2
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.id = $1
    `, [transactionId, currentUserId])
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
    let query = `
    SELECT t.*
    FROM transactions t
    WHERE t.user_id = $1 
    `
    let params = [userId]

    if (startDate && endDate) {
      query += ` AND t.transaction_date BETWEEN $2 AND $3`
      params.push(startDate, endDate)
    }
    query += ` ORDER BY t.transaction_date DESC`

    const res = await pool.query(query, params)
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
  updateTransactionStatus: async (id, openQuantity, status, category, pandl) => {
    if (category) {
      await pool.query(
        `UPDATE transactions SET category = $1, open_quantity = $2, status = $3, pandl = $4 WHERE id = $5`,
        [category, openQuantity, status, pandl, id]
      )
    } else {
      await pool.query(
        `UPDATE transactions SET open_quantity = $1, status = $2 WHERE id = $3`,
        [openQuantity, status, id]
      )
    }
  },
  updateClosingTransaction: async (quantity, category, openQuantity, status, pandl, transactionId) => {
    await pool.query(
      `UPDATE transactions SET quantity = $1, category = $2, open_quantity = $3, status = $4, pandl = $5 WHERE id = $6`,
      [quantity, category, openQuantity, status, pandl, transactionId]
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
  getPublicTransactions: async (currentUserId, limit, offset) => {
    const transactionsRes = await pool.query(`
    SELECT t.*, 
     CASE WHEN l.user_id = $1 THEN true ELSE false END AS is_liked,
     u.avatar AS transaction_user_avatar,
     u.username AS transaction_user_name,
     u.account AS transaction_user_account,
     (SELECT COUNT(*) FROM likes lc WHERE lc.transaction_id = t.id) AS like_count,
     (SELECT COUNT(*) FROM replies r WHERE r.transaction_id = t.id) AS replies_count
    FROM transactions t
    LEFT JOIN likes l ON t.id = l.transaction_id AND l.user_id = $1
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.is_public = true
    ORDER BY t.transaction_date DESC
    LIMIT $2 OFFSET $3
    `, [currentUserId, limit, offset])
    const countRes = await pool.query(`
      SELECT COUNT(*)
      FROM transactions t
      WHERE t.is_public = true
    `)
    return {
      transactions: transactionsRes.rows,
      count: countRes.rows[0].count
    }
  },
  createLike: async (userId, transactionId) => {
    const res = await pool.query(`INSERT INTO likes (user_id, transaction_id) VALUES($1, $2) RETURNING *`, [userId, transactionId])
    return res.rows[0]
  },
  removeLike: async (userId, transactionId) => {
    const res = await pool.query(`DELETE FROM likes WHERE user_id = $1 AND transaction_id = $2  RETURNING *`, [userId, transactionId])
    return res.rows[0]
  },
  getUserLikes: async (userId) => {
    const res = await pool.query(`
    SELECT t.* , l.user_id AS likeowner_user_id
    FROM likes l
    LEFT JOIN transactions t ON l.transaction_id = t.id
    WHERE l.user_id = $1
    ORDER BY l.created_on DESC
    `, [userId])
    return res.rows
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
    const res = await pool.query(`
    SELECT r.*,
      u.avatar AS user_avatar,
      u.username AS user_name,
      u.account AS user_account
    FROM replies r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.transaction_id = $1
    ORDER BY r.created_on DESC
    `, [transactionId])
    return res.rows
  },
  getTopUsers: async () => {
    const res = await pool.query(`
      SELECT users.id AS user_id, username, account, avatar,
        SUM(CASE WHEN t.pandl >= 1 THEN 1 ELSE 0 END) as win_count,
        SUM(CASE WHEN t.pandl < 1 THEN 1 ELSE 0 END) as loss_count,
        COALESCE(
        CAST(SUM(CASE WHEN t.pandl >= 1 THEN 1 ELSE 0 END) AS DECIMAL) /
        NULLIF((SUM(CASE WHEN t.pandl >= 1 THEN 1 ELSE 0 END) +
        SUM(CASE WHEN t.pandl < 1 THEN 1 ELSE 0 END)), 0),
        0) as win_rate
      FROM users
      LEFT JOIN transactions t ON t.user_id = users.id      
      GROUP BY users.id
      ORDER BY win_rate DESC
      LIMIT 10
    `)
    return res.rows
  },
  getDailyTransactionsData: async (userId, startDate, endDate) => {
    let query = `
    SELECT DATE(transaction_date) AS date,
      SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl >= 0 THEN quantity ELSE 0 END) AS winCount,
      SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl < 0 THEN quantity ELSE 0 END) AS lossCount,
      CAST(SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl >= 0 THEN quantity ELSE 0 END) AS DECIMAL) /
      NULLIF((SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl >= 0 THEN quantity ELSE 0 END) +
      SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl < 0 THEN quantity ELSE 0 END)), 0) AS win_rate,
      COALESCE(
          CAST(SUM(CASE WHEN pandl >= 1 THEN pandl ELSE 0 END)AS DECIMAL) /
          NULLIF(SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl >= 0 THEN quantity ELSE 0 END), 0),
       0) AS average_win,
      COALESCE(
          ABS(CAST(SUM(CASE WHEN pandl < 1 THEN pandl ELSE 0 END)AS DECIMAL) /
          NULLIF(SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl < 0 THEN quantity ELSE 0 END), 0)),
       0) AS average_loss,
      COALESCE(
          COALESCE(CAST(SUM(CASE WHEN pandl >= 1 THEN pandl ELSE 0 END)AS DECIMAL) /
          NULLIF(SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl >= 0 THEN quantity ELSE 0 END), 0), 0) /
          NULLIF(COALESCE(
          ABS(CAST(SUM(CASE WHEN pandl < 1 THEN pandl ELSE 0 END)AS DECIMAL) /
          NULLIF(SUM(CASE WHEN category = 'closing_position' AND status = 'closed' AND pandl < 0 THEN quantity ELSE 0 END), 0)),0), 0), 
      0) AS risk_ratio,
      SUM(pandl) AS pandl,
      SUM(SUM(pandl)) OVER (ORDER BY DATE(transaction_date)) AS cumulative_pandl,
      SUM(CASE WHEN category= 'closing_position' THEN quantity ELSE 0 END) AS round_trip,
      SUM(pandl) - SUM(CASE WHEN category= 'closing_position' THEN quantity ELSE 0 END) AS netpandl
    FROM transactions
    WHERE user_id = $1
    `
    let params = [userId]
    if (startDate) {
      query += ` AND transaction_date >= $2`
      params.push(startDate)
    }
    if (endDate) {
      query += ` AND transaction_date <= $3`
      params.push(endDate)
    }
    query += ` GROUP BY DATE(transaction_date) ORDER BY date ASC`
    const res = await pool.query(query, params)
    return res.rows
  },
  getTransactionsByDate: async (userId, date) => {
    const res = await pool.query(`
    SELECT *
    FROM transactions
    WHERE user_id = $1 AND DATE(transaction_date) = $2
    `, [userId, date])
    return res.rows
  },
  getTransactionsBetweenDates: async (userId, startDate, endDate) => {
    const res = await pool.query(`SELECT t.*, json_agg(row_to_json(c_alias)) AS closures
    FROM transactions t
    LEFT JOIN (
    SELECT c.open_transaction_id AS open_transaction_id, c.closed_transaction_id AS closed_transaction_id
    FROM closures c
    ) 
    c_alias ON c_alias.open_transaction_id = t.id
    WHERE t.user_id = $1 AND t.category = 'closing_position' AND t.transaction_date BETWEEN $2 AND $3
    GROUP BY t.id
    ORDER BY t.transaction_date`, [userId, startDate, endDate])
    return res.rows
  },
  getCurrentUserPublicTransaction: async (currentUserId, limit, offset) => {
    const res = await pool.query(`
      SELECT t.*,
        CASE WHEN l.user_id = $1 THEN true ELSE false END AS is_like,
        u.avatar AS transaction_user_avatar,
        u.username AS transaction_user_name,
        u.account AS transaction_user_account,
        (SELECT COUNT(*) FROM likes l WHERE l.transaction_id = t.id) AS likes_count,
        (SELECT COUNT(*) FROM replies r WHERE r.transaction_id = t.id) AS replies_count
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN likes l ON l.transaction_id = t.id AND l.user_id = $1
      WHERE t.user_id = $1 AND t.is_public = true
      ORDER BY t.transaction_date DESC
      LIMIT $2 OFFSET $3
    `, [currentUserId, limit, offset])
    const totalCount = await pool.query(`
    SELECT COUNT(*)
    FROM transactions t
    WHERE t.user_id = $1 AND t.is_public = true
    `, [currentUserId])
    return {
      result: res.rows,
      totalCount: totalCount.rows[0].count
    }
  },
  getUsers: async (limit, offset) => {
    const res = await pool.query(`
    SELECT u.id, u.username, u.account, u.email, u.avatar, u.role, u.created_on
    FROM users u
    LIMIT $1 OFFSET $2
    `, [limit, offset])
    const totoCount = await pool.query(`
    SELECT COUNT(*)
    FROM users u
    `)
    return {
      result: res.rows,
      totoCount: totoCount.rows[0].count
    }
  },
  deleteUser: async (userId) => {
    const res = await pool.query(`
    DELETE
    FROM users
    WHERE id = $1
    RETURNING id, username, account, email, avatar, role, created_on`, [userId])
    return res.rows
  }
}
