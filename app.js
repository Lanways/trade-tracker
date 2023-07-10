const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!omg')
})

app.listen(3000, () => {
  console.log(`express server is running on http://localhost:3000`)
})

module.exports = app