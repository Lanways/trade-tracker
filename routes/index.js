const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const transactions = require('./modules/transactions')
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../middleware/error-handler')
const auth = require('./modules/auth')
const { authenticated, checkRefreshToken } = require('../middleware/api-auth')
const { checkBlacklisted } = require('../middleware/check-blacklist')
const passport = require('../config/passport')
const userController = require('../controllers/user-controller')

router.post('/api/users/signin', (req, res, next) => {
  if (!req.body.account || !req.body.password) return res.status(400).json({ status: 'error', message: "Account and Password is required" })
  next()
},
  passport.authenticate('local', { session: false }),
  (req, res, next) => {
    req.isLocalStrategy = true
    next()
  }, userController.signIn
)
router.post('/api/users/refreshToken', checkRefreshToken, userController.refreshToken)
router.post('/api/users', userController.signUp)

router.use('/api/users', authenticated, checkBlacklisted, users)
router.use('/api/transactions', authenticated, checkBlacklisted, transactions)
router.use('/api/admin', admin)
router.use('/api/auth', auth)
router.use('/', apiErrorHandler)

module.exports = router