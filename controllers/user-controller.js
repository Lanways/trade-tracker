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
    userServices.signIn(req, (err, data) => {
      if (err) {
        return next(err)
      }
      if (!req.isLocalStrategy) {
        res.cookie('accessToken', data.data.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          domain: 'owenlu0125.github.io',
          expires: new Date(Date.now() + 86400000)
        })
        res.cookie('refreshToken', data.data.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          domain: 'owenlu0125.github.io',
          expires: new Date(Date.now() + 86400000)
        })
        res.cookie('isAuthenticated', 'true', {
          secure: false,
          sameSite: 'Lax',
          domain: 'owenlu0125.github.io',
          expires: new Date(Date.now() + 86400000)
        })
        res.cookie('Authenticated', 'false', {
          secure: true,
          sameSite: 'Lax',
          domain: 'owenlu0125.github.io',
          expires: new Date(Date.now() + 86400000)
        })
        console.log('ready redirect')
        return res.redirect(301, 'https://www.youtube.com')
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
    userServices.logout(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  refreshToken: (req, res, next) => {
    userServices.refreshToken(req, (err, data) => err ? next(err) : res.status(200).json(data))
  }
}

module.exports = userController