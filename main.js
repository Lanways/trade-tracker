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

const setupModels = require('./db/index')
const seedUsers = require('./seeds/001-user-seed-file')
const seedTransactions = require('./seeds/002-transaction-seed-file')

async function main() {
  await setupModels(pool)
  await seedUsers(pool)
  await seedTransactions(pool)
  pool.end()
}

main().catch(console.error)