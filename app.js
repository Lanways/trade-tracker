const express = require('express')
const { Pool } = require('pg')

const app = express()

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'trade_tracker',
  user: 'postgres',
  password: 'password'
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to the PostgreSQL database:', err);
  } else {
    console.log('Connected to the PostgreSQL database successfully!');
  }
  pool.end();
});


app.get('/', (req, res) => {
  res.send('Hello World!omg')
})

app.listen(3000, () => {
  console.log(`express server is running on http://localhost:3000`)
})

module.exports = app