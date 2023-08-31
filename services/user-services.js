const db = require('../db/db')
const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')
const jwt = require('jsonwebtoken')
const { imgurFileHandler } = require('../helpers/file-helpers')
const { addTokenToBlackList, delRefreshToken, getRefreshToken, setRefreshToken } = require('../helpers/redis-helper')

const userServices = {
  signUp: async ({ username, account, password, email }, cb) => {
    try {
      const hashed = await bcrypt.hash(password, 10)
      const avatar = `https://robohash.org/${account}?set=set4`
      const user = await db.createUser(username, account, hashed, email, avatar)
      delete user.password
      return cb(null, {
        status: 'success',
        user
      })
    } catch (err) {
      if (err.code === '23505') {  // postgre 唯一性約束錯誤代碼
        if (err.detail.includes('account')) {
          cb('Account already exists')
        } else if (err.detail.includes('email')) {
          cb('Email already exists')
        }
      } else {
        cb(err)
      }
    }
  },
  signIn: async (req, cb) => {
    try {
      const { password, ...userWithoutPassword } = helpers.getUser(req)
      const accessToken = jwt.sign(userWithoutPassword, process.env.JWT_SECRET, { expiresIn: '1m' })
      const refreshToken = jwt.sign(userWithoutPassword, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '24h' })

      await setRefreshToken(userWithoutPassword.id, refreshToken)

      return cb(null, {
        status: 'success',
        data: {
          accessToken,
          refreshToken,
          user: userWithoutPassword
        }
      })
    } catch (err) {
      cb(err)
    }
  },
  getUser: async (req, cb) => {
    const userId = helpers.getUser(req).id
    const { password, ...user } = await db.getUserById(userId)
    if (!user) return cb(`User didn't exist`)
    return cb(null, {
      status: 'success',
      user
    })
  },
  putUser: async (req, { username, introduction, password, newPassword }, cb) => {
    const userId = helpers.getUser(req).id
    try {
      const user = await db.getUserById(userId)
      if (!user) return cb("User didn't exist!")
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) return cb('password is incorrect')
      const avatarPath = req.file ? await imgurFileHandler(req.file) : null
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)
      const { password: _, ...updatedUser } = await db.updateUser(
        username,
        hashedNewPassword,
        introduction,
        avatarPath,
        userId
      )
      if (!updatedUser) return cb('Failed to update user')
      cb(null, updatedUser)
    } catch (err) {
      cb(err)
    }
  },
  getTopUsers: async (req, cb) => {
    try {
      const topUsers = await db.getTopUsers()
      return cb(null, {
        status: 'success',
        topUsers
      })
    } catch (err) {
      return cb(err)
    }
  },
  getUserLikes: async (req, cb) => {
    try {
      const currentUserId = helpers.getUser(req).id
      const currentUserLikes = await db.getUserLikes(currentUserId)
      const userId = req.params.id
      const userLikesRes = await db.getUserLikes(userId)
      const userLikes = userLikesRes.map(like => ({
        ...like,
        currentUserIsLiked: currentUserLikes.some(t => t.id === like.id)
      }))
      return cb(null, {
        status: 'success',
        userLikes
      })
    } catch (err) {
      return cb(err)
    }
  },
  getHistoryTransactions: async (req, cb) => {
    try {
      const userId = req.params.id
      const { startDate, endDate } = req.query
      const transactions = await db.getTransactionsByDateRange(userId, startDate, endDate)
      const dailyTransactions = await db.getDailyTransactionsData(userId, startDate, endDate)

      const winCount = transactions.reduce((acc, t) => t.category === 'closing_position' && t.status === 'closed' && t.pandl >= 0 ? acc + t.quantity : acc, 0)
      const lossCount = transactions.reduce((acc, t) => t.category === 'closing_position' && t.status === 'closed' && t.pandl < 0 ? acc + t.quantity : acc, 0)
      const totalWinPoints = transactions.reduce((acc, t) => t.pandl > 1 ? acc + Number(t.pandl) : acc, 0)
      const totalLossPoints = transactions.reduce((acc, t) => t.pandl !== null && t.pandl < 1 ? acc + Math.abs(Number(t.pandl)) : acc, 0)
      const averageWinPoints = Number((totalWinPoints / winCount).toFixed(2))
      const averageLossPoints = Number((totalLossPoints / lossCount).toFixed(2))

      const historyData = {
        haveOpnePosition: transactions.some(t => t.category === 'opening_position' && t.status === 'open'),
        winCount,
        lossCount,
        winRate: Number((winCount / (winCount + lossCount)).toFixed(2)),
        totalWinPoints,
        totalLossPoints,
        pAndL: totalWinPoints - totalLossPoints,
        roundTrip: transactions.reduce((acc, t) =>
          t.category === 'closing_position' ? acc + t.quantity : acc, 0),
        netPAndL: (totalWinPoints - totalLossPoints) - transactions.reduce((acc, t) =>
          t.category === 'closing_position' ? acc + t.quantity : acc, 0),
        averageWinPoints,
        averageLossPoints,
        riskRatio: Number((averageWinPoints / averageLossPoints).toFixed(2))
      }
      return cb(null, {
        status: 'success',
        historyData,
        dailyTransactions
      })
    } catch (err) {
      return cb(err)
    }
  },
  getTransactionsForTheDay: async (req, cb) => {
    const userId = req.params.id
    const date = req.query.date || new Date()
    const transactions = await db.getTransactionsByDate(userId, date)

    const winCount = transactions.reduce((acc, t) => t.category === 'closing_position' && t.status === 'closed' && t.pandl >= 0 ? acc + t.quantity : acc, 0)
    const lossCount = transactions.reduce((acc, t) => t.category === 'closing_position' && t.status === 'closed' && t.pandl < 0 ? acc + t.quantity : acc, 0)

    const totalWinPoints = transactions.reduce((acc, t) => t.pandl > 1 ? acc + Number(t.pandl) : acc, 0)
    const totalLossPoints = transactions.reduce((acc, t) => t.pandl !== null && t.pandl < 1 ? acc + Math.abs(Number(t.pandl)) : acc, 0)
    const averageWinPoints = Number((totalWinPoints / winCount).toFixed(2))
    const averageLossPoints = Number((totalLossPoints / lossCount).toFixed(2))

    const historyData = {
      haveOpnePosition: transactions.some(t => t.category === 'opening_position' && t.status === 'open'),
      winCount,
      lossCount,
      winRate: Number((winCount / (winCount + lossCount)).toFixed(2)),
      totalWinPoints,
      totalLossPoints,
      pAndL: totalWinPoints - totalLossPoints,
      roundTrip: transactions.reduce((acc, t) =>
        t.category === 'closing_position' ? acc + t.quantity : acc, 0),
      netPAndL: (totalWinPoints - totalLossPoints) - transactions.reduce((acc, t) =>
        t.category === 'closing_position' ? acc + t.quantity : acc, 0),
      averageWinPoints,
      averageLossPoints,
      riskRatio: Number((averageWinPoints / averageLossPoints).toFixed(2))
    }
    return cb(null, {
      status: 'success',
      historyData,
      transactions
    })
  },
  logout: async (req, cb) => {
    try {
      let accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1]
      if (!accessToken && req.cookies) {
        accessToken = req.cookies.accessToken
      }
      if (!accessToken) return cb('Token not provided')

      await addTokenToBlackList(accessToken)
      console.log('userId', helpers.getUser(req).id)
      await delRefreshToken(helpers.getUser(req).id)

      return cb(null, { status: 'Logged out successfully' })
    } catch (err) {
      return cb(err)
    }
  },
  refreshToken: async (req, cb) => {
    try {
      const { password, exp, iat, ...userWithoutPassword } = helpers.getUser(req)
      const newAccessToken = jwt.sign(userWithoutPassword, process.env.JWT_SECRET, { expiresIn: '1m' })
      return cb(null, {
        status: 'success',
        accessToken: newAccessToken
      })
    } catch (err) {
      return cb(err)
    }
  }
}

module.exports = userServices