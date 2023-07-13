const db = require('../db/db')
const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')
const jwt = require('jsonwebtoken')

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
      if (err.code === '23505') {  // postgre 唯一性約束錯誤代碼
        if (err.detail.includes('account')) {
          cb('Account already exists')
        } else if (err.detail.includes('email')) {
          cb('Email already exists')
        }
      } else {
        cb(err)
      }
    }
  },
  signIn: async (req, cb) => {
    try {
      const { password, ...userWithoutPassword } = helpers.getUser(req)
      const token = jwt.sign(userWithoutPassword, process.env.JWT_SECRET, { expiresIn: '30d' })
      cb(null, {
        status: 'success',
        data: {
          token,
          user: userWithoutPassword
        }
      })
    } catch (err) {
      cb(err)
    }
  },
  getUser: async (req, cb) => {
    const id = req.params.id
    const { password, ...user } = await db.getUserById(id)
    if (!user) return cb(`User didn't exist`)
    return cb(null, {
      status: 'success',
      user
    })
  }
}

module.exports = userServices