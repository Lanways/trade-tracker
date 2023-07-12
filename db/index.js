const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 从环境变量获取连接字符串
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

const sqlFilePath = path.join(__dirname, 'migrations', '001-create-users-table.sql');

fs.readFile(sqlFilePath, 'utf8', async (err, data) => {
  if (err) {
    console.error(`Error reading file from disk: ${err}`);
    return;
  }

  try {
    const res = await pool.query(data);
    console.log(res);
  } catch (err) {
    console.error(`Error executing query: ${err}`);
  }
})