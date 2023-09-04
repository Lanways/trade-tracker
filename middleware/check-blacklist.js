const { checkBlacklist } = require('../helpers/redis-helper')

const checkBlacklisted = async (req, res, next) => {
  const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1]
  if (!accessToken) {
    return res.status(401).json({ status: 'error', message: 'Token not provided' })
  }

  try {
    const isBlacklisted = await checkBlacklist(accessToken)
    if (isBlacklisted) {
      return res.status(401).json({ status: 'error', message: 'Token is blacklisted' })
    }
    next()
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

module.exports = {
  checkBlacklisted
}
