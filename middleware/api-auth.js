const passport = require('../config/passport')
const helpers = require('../_helpers')
const client = require('../config/redis')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]

    client.get(token, (err, result) => {
      if (err) {
        return res.status(500).json({ status: 'error', message: 'Internal server error' })
      }
      if (result) {
        return res.status(401).json({ status: 'error', message: 'Token is blacklisted' })
      } else {
        req.user = user
        next()
      }
    })
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (helpers.getUser(req) && helpers.getUser(req).role === 'admin') return next()
  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}