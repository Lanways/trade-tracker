const passport = require('../config/passport')
const helpers = require('../_helpers')
const jwt = require('jsonwebtoken')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Internal server error' })
    if (!user) return res.status(401).json({ status: 'error', message: 'User not authorized' })
    req.user = user
    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (helpers.getUser(req) && helpers.getUser(req).role === 'admin') return next()
  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

const checkRefreshToken = (req, res, next) => {
  const refreshToken = req.body.refreshToken
  if (!refreshToken) {
    return res.status(400).json({ status: 'error', message: 'Refresh token is required.' })
  }
  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token.' })
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin,
  checkRefreshToken
}