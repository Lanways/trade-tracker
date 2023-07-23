const fs = require('fs')
const util = require('util')
const path = require('path')
const readdir = util.promisify(fs.readdir)

module.exports = async function setupModels(pool) {

  const sqlDirectory = path.join(__dirname, '..', 'migrations')
  try {
    const files = await readdir(sqlDirectory)

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
  } catch (err) {
    console.error(`Error reading directory: ${err}`)
  }
}
