if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const routes = require('./routes')
const passport = require('./config/passport')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())



app.get('/', (req, res) => {
  res.send('Hello World!omg')
})

app.use(routes)

app.listen(3000, () => {
  console.log(`express server is running on http://localhost:3000`)
})

module.exports = app