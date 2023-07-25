module.exports = async function seedLikes(pool) {
  const db = require('../db/db')
  const resTransactionsId = await pool.query(`SELECT id FORM transactions`)
  const resUsersId = await pool.query(`SELECT id FORM users ORDER BY RANDOM() LIMIT 10`)
  const countRes = await pool.query(`SELECT count(*) AS likesCount FROM likes`)
  const count = countRes.rows[0].likesCount

  if (count === 0) {
    // 隨機 10 user_id 對遍歷 transction_id 加入 like
    const randomUsersId = resUsersId.rows.map
    for (let transactionId of resTransactionsId.rows.map(ts => ts.id)) {
      for (let userId of resUsersId.rows.map(us => us.id))
        try {
          await db.createLike(userId, transactionId)
        } catch (err) {
          console.log(err)
        }
    }
  }
}