const bcrypt = require('bcryptjs')
const faker = require('faker')
module.exports = async function seedUsers(pool) {
  const res = await pool.query('SELECT COUNT(*) AS count FROM users')
  const count = Number(res.rows[0].count)
  console.log('user table count =', count)

  if (count === 0) {
    let avatarArray = []
    let i = 0
    while (i <= 20) {
      let count = Math.floor(Math.random() * 800)
      let countSome = avatarArray.some(aa => aa === count)
      if (!countSome) {
        avatarArray.push(count)
        i++
      }
    }
    for (let i = 1; i <= 20; i++) {
      let username = `user${i}`
      let account = `account${i}`
      let password = await bcrypt.hash('12345', 10)
      let email = `user${i}@example.com`
      let randomCount = Math.floor(Math.random() * avatarArray.length)
      let avatar = `https://robohash.org/${avatarArray[randomCount]}?set=set4`
      avatarArray.splice(randomCount, 1)
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
