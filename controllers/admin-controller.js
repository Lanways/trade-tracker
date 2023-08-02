const adminServices = require('../services/admin-services')

const adminController = {
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  deleteUser: (req, res, next) => {
    adminServices.deleteUser(req, (err, data) => err ? next(err) : res.status(200).json(data))
  }
}

module.exports = adminController