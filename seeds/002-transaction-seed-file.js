module.exports = async function seedTransactions(pool) {
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
}

