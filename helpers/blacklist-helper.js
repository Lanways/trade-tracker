const client = require('../config/redis')

const addTokenToBlackList = (token, cb) => {
  client.set(token, 'blacklisted', 'EX', 60 * 60 * 24 * 30, (err, reply) => err ? cb(err) : cb(null, reply))
}

module.exports = addTokenToBlackList