if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const fs = require('fs')
const path = require('path')
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
const sqlDirectory = path.join(__dirname, '..', 'migrations')

fs.readdir(sqlDirectory, async (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${err}`)
    return
  }

  for (const file of files) {
    if (path.extname(file) === '.sql') {
      const sqlFilePath = path.join(sqlDirectory, file)

      try {
        const data = fs.readFileSync(sqlFilePath, 'utf8')
        const res = await pool.query(data)
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Executed file: ${file}`)
          console.log(res)
        }
      } catch (err) {
        console.error(`Error executing file ${file}: ${err}`)
      }
    }
  }
})