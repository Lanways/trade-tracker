const db = require('../db/db')
const bcrypt = require('bcryptjs')

const userServices = {
  signUp: async ({ username, account, password, email }, cb) => {
    try {
      const hashed = await bcrypt.hash(password, 10)
      const user = await db.createUser(username, account, hashed, email)
      return cb(null, {
        status: 'success',
        user
      })
    } catch (err) {
      if (err.code === '23505') {  // 这是 PostgreSQL 的唯一性约束违反的错误代码
        if (err.detail.includes('account')) {
          cb({ message: 'Account already exists' })
        } else if (err.detail.includes('email')) {
          cb({ message: 'Email already exists' })
        }
      } else {
        cb(err)
      }
    }
  }
}

module.exports = userServices