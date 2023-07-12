const userServices = require('../services/user-services')

const userController = {
  signUp: (req, res, next) => {
    const { username, password, checkPassword, email, account } = req.body
    // console.log(req.body)
    if (!account) {
      return res.status(400).json({ status: 'error', message: 'Account is required' })
    } else if (account.length > 50) {
      return res.status(400).json({ status: 'error', message: 'Account too long' })
    }
    if (username && username.length > 50) {
      return res.status(400).json({ status: 'error', message: 'Name too long' })
    } else if (!username) return res.status(400).json({ status: 'error', message: 'Username is required' })
    if (password !== checkPassword) return res.status(400).json({ status: 'error', message: 'Password do not match' })

    userServices.signUp({ account, username, password, email }, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  signIn: (req, res, next) => {
    userServices.signIn(req, (err, data) => err ? next(err) : res.status(200).json(data))
  }

}

module.exports = userController