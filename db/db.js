const { Pool } = require('pg')
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'trade_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
})

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
  }
};
