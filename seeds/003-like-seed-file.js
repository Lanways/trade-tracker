module.exports = async function seedLikes(pool) {
  const db = require('../db/db')
  const resTransactionsId = await pool.query(`SELECT id FROM transactions`)
  const resUsersId = await pool.query(`SELECT id FROM users ORDER BY RANDOM() LIMIT 10`)
  const countRes = await pool.query(`SELECT COUNT(*) FROM likes`)
  const count = Number(countRes.rows[0].count)
  console.log('likes table count =', count)

  if (count === 0) {
    // 隨機 10 user_id 對遍歷 transaction_id 加入 like
    for (let transactionId of resTransactionsId.rows.map(ts => ts.id)) {
      for (let userId of resUsersId.rows.map(us => us.id))
        try {
          await db.createLike(userId, transactionId)
        } catch (err) {
          console.log(err)
        }
    }
  } else {
    console.log('like table is not empty')
  }
}