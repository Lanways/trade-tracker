const { Pool } = require('pg')
const pool = new Pool({
  host: 'localhost',
  database: 'trade_tracker',
  user: 'postgres',
  password: 'password',
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
  // 更多针对 users 表的操作...
};
