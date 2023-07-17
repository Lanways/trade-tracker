if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

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

async function seedTransaction() {
  const res = await pool.query('SELECT id FROM users')
  const countRes = await pool.query('SELECT COUNT(*) AS count FROM transactions')
  const count = Number(countRes.rows[0].count)
  console.log('transaction table count =', count)
  if (count === 0) {
    for (let userId of res.rows.map(row => row.id)) {
      try {
        for (let i = 0; i < 10; i++) {
          const price = Math.floor(Math.random() * 1000) + 17000
          const quantity = Math.floor(Math.random() * 9) + 1
          await pool.query(
            `INSERT INTO transactions (user_id, action, quantity, price, transaction_date, description, created_on, updated_on)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [userId, i % 2 === 0 ? 'buy' : 'sell', quantity, price, `Description for transaction ${i}`]
          )
        }
      } catch (err) {
        console.error(`Error: ${err.message}`)
      }
    }
    console.log('success created transaction seeds')
  } else {
    console.log('transaction table is not empty')
  }

  await pool.end()
}

seedTransaction().catch(err => console.error(err.message))