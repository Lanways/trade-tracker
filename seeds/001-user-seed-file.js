if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const bcrypt = require('bcryptjs')
const faker = require('faker')
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

async function seedUsers() {
  for (let i = 1; i <= 10; i++) {
    let username = `user${i}`
    let account = `account${i}`
    let password = await bcrypt.hash('12345', 10)
    let email = `user${i}@example.com`
    let introduction = faker.lorem.sentence()
    let role = 'user'

    await pool.query(
      `INSERT INTO users (username, account, password, email, introduction, role, created_on, updated_on)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [username, account, password, email, introduction, role]
    )
  }
  console.log('success create users seeds')
  await pool.end()
}

seedUsers().catch(err => console.error(err))