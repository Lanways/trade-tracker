const client = require('../config/redis')

const addTokenToBlackList = (accessToken) => {
  return new Promise((resolve, reject) => {
    client.set(accessToken, 'blacklisted', 'EX', 15 * 60, (err, reply) => err ? reject(err) : resolve(reply))
  })
}

const delRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    client.del(`refreshToken:${userId}`, (err, reply) => err ? reject(err) : resolve(reply === 1))
  })
}

const getRefreshToken = (user) => {
  return new Promise((resolve, reject) => {
    client.get(`refreshToken:${user.id}`, (err, refreshToken) => {
      if (err) reject(err)
      else if (refreshToken) resolve(refreshToken)
      else reject('No refresh token found for user')
    })
  })
}

const setRefreshToken = (userId, refreshToken) => {
  return new Promise((resolve, reject) => {
    client.set(`refreshToken:${userId}`, refreshToken, 'EX', 60 * 60 * 24, (err, reply) =>
      err ? reject(err) : resolve(reply))
  })
}

const checkBlacklist = (accessToken) => {
  return new Promise((resolve, reject) => {
    client.get(accessToken, (err, result) => {
      err ? reject(err) : resolve(result === 'blacklisted')
    })
  })
}

module.exports = {
  addTokenToBlackList,
  delRefreshToken,
  getRefreshToken,
  setRefreshToken,
  checkBlacklist
}