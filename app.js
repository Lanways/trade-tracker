const express = require('express')
const app = express()
const db = require('./db/db')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.post('/users', async (req, res) => {
  try {
    let { username, password, email } = req.body
    const user = await db.createUser(username, password, email)
    res.status(200).json(user)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal server error ')
  }
})

app.get('/', (req, res) => {
  res.send('Hello World!omg')
})

app.listen(3000, () => {
  console.log(`express server is running on http://localhost:3000`)
})

module.exports = app