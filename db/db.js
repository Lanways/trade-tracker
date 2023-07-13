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
    // const currentTime = new Date()
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
  }
}
