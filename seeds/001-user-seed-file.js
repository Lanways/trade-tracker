const bcrypt = require('bcryptjs')
const faker = require('faker')
module.exports = async function seedUsers(pool) {
  const res = await pool.query('SELECT COUNT(*) AS count FROM users')
  const count = Number(res.rows[0].count)
  console.log('user table count =', count)

  if (count === 0) {
    for (let i = 1; i <= 20; i++) {
      let username = `user${i}`
      let account = `account${i}`
      let password = await bcrypt.hash('12345', 10)
      let email = `user${i}@example.com`
      let avatar = `https://robohash.org/${i}`
      let introduction = faker.lorem.sentence()
      let role = 'user'

      await pool.query(
        `INSERT INTO users (username, account, password, email, avatar, introduction, role, created_on, updated_on)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [username, account, password, email, avatar, introduction, role]
      )
    }
    console.log('success create users seeds')
  } else {
    console.log('user table is not empty')
  }
}
