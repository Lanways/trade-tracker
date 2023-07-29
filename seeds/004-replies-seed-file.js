module.exports = async function seedReplies(pool) {
  const db = require('../db/db')
  const faker = require('faker')
  const resUsersId = await pool.query(`SELECT id FROM users ORDER BY RANDOM() LIMIT 20`)
  const countRes = await pool.query(`SELECT COUNT(*) FROM replies`)
  const count = Number(countRes.rows[0].count)
  console.log('replies table count =', count)

  if (count === 0) {
    // 隨機 20 個 user_id 對隨機 50 個 transactions_id add content 加入 replies
    for (let userId of resUsersId.rows.map(us => us.id)) {
      let resTransactionId = await pool.query(`SELECT id FROM transactions ORDER BY RANDOM() LIMIT 50`)
      for (let i = 0; i < 50; i++) {
        const content = faker.lorem.sentence()
        try {
          await db.postReply(userId, resTransactionId.rows[i].id, content)
        } catch (err) {
          console.log(err)
        }
      }
    }
  } else {
    console.log('replies table is not empty')
  }
}