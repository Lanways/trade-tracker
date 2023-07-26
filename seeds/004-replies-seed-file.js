module.exports = async function seedReplies(pool) {
  const db = require('../db/db')
  const faker = require('faker')
  const resTransactionsId = await pool.query(`SELECT id FROM transactions ORDER BY RANDOM()`)
  const resUsersId = await pool.query(`SELECT id FROM users ORDER BY RANDOM() LIMIT 20`)
  const countRes = await pool.query(`SELECT count(*) AS repliesCount FROM replies`)
  const count = countRes.rows[0].repliesCount

  if (count === 0) {
    // 隨機 20 個 user_id 對隨機 50 個 transactions_id add content 加入 replies
    for (let userId of resUsersId.rows.map(us => us.id)) {
      for (let i = 0; i < 50; i++) {
        const content = faker.lorem.sentence({ min: 3, max: 5 })
        const transactionId = resTransactionsId.rows[i].id
        try {
          await db.postReply(userId, transactionId, content)
        } catch (err) {
          console.log(err)
        }
      }
    }
  }
}