const helpers = require('../_helpers')
const userServices = require('../services/user-services')

const userController = {
  signUp: (req, res, next) => {
    const { username, password, checkPassword, email, account } = req.body
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
    userServices.signIn(req, (err, data) => {
      if (err) {
        return next(err)
      }
      if (!req.isLocalStrategy) {
        res.cookie('accessToken', data.data.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          expires: new Date(Date.now() + 900000)
        })
        res.cookie('refreshToken', data.data.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          expires: new Date(Date.now() + 86400000)
        })
        return res.redirect('https://owenlu0125.github.io/StockChart?isAuthenticated=true')
      }
      res.status(200).json(data)
    })
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  putUser: (req, res, next) => {
    const { username, introduction, password, newPassword } = req.body
    if (!username) return res.status(400).json({ status: 'error', message: 'username is required' })
    if (!password) return res.status(400).json({ status: 'error', message: 'password is required' })
    if (!newPassword) return res.status(400).json({ status: 'error', message: 'newPassword is required' })
    if (req.user.id !== Number(req.params.id)) return res.status(400).json({ status: 'error', message: 'Edit self profile only!' })

    userServices.putUser(req, { username, introduction, password, newPassword }, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getTopUsers: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getUserLikes: (req, res, next) => {
    userServices.getUserLikes(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getHistoryTransactions: (req, res, next) => {
    userServices.getHistoryTransactions(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getTransactionsForTheDay: (req, res, next) => {
    userServices.getTransactionsForTheDay(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  logout: (req, res, next) => {
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!accessToken) return res.status(400).json({ status: 'error', message: 'Token not provided' })
    const userId = helpers.getUser(req).id
    if (!userId) return res.status(400).json({ status: 'error', message: 'User ID not provided' })
    userServices.logout(accessToken, userId, (err, data) => {
      if (err) return next(err)
      res.cookie('accessToken', '', { expires: new Date(0), httpOnly: true })
      res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true })
      return res.status(200).json(data)
    })
  },
  refreshToken: (req, res, next) => {
    userServices.refreshToken(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getToken: (req, res, next) => {
    try {
      const accessToken = req.cookies.accessToken
      if (!accessToken) return res.status(400).json({ status: 'error', message: `accessToken doesn't exist` })
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) return res.status(400).json({ status: 'error', message: `refreshToken doesn't exist` })

      return res.status(200).json({
        status: 'success',
        accessToken,
        refreshToken
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController