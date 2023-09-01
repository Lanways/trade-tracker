if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const routes = require('./routes')
const path = require('path')
const passport = require('./config/passport')
const cors = require('cors')
const port = process.env.PORT || 3000

const corsOptions = {
  origin: ['https://owenlu0125.github.io', 'http://localhost:5501'],
  optionsSuccessStatus: 200
}
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use(express.json())
app.use(passport.initialize())

app.get('/', (req, res) => {
  res.send('Hello World!omg')
})

app.use(routes)

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})

module.exports = app