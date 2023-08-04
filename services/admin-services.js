const db = require('../db/db')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const adminServices = {
  getUsers: async (req, cb) => {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const offset = getOffset(limit, page)
      const users = await db.getUsers(limit, offset)
      const pagination = getPagination(limit, page, users.totalCount)
      return cb(null, {
        status: 'success',
        pagination,
        users: users.result
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