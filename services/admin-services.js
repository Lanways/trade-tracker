const db = require('../db/db')

const adminServices = {
  getUsers: async (req, cb) => {
    try {
      const users = await db.getUsers()
      return cb(null, {
        status: 'success',
        users
      })
    } catch (err) {
      cb(err)
    }
  },
  deleteUser: async (req, cb) => {
    try {
      const userId = req.params.id
      const user = await db.deleteUser(userId)
      if (user.length === 0) return cb('User does not exist.')
      return cb(null, {
        status: 'success',
        Delete_User_Data: user
      })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = adminServices