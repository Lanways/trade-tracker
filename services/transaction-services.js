const db = require('../db/db')
const helpers = require('../_helpers')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const transactionsServices = {
  postTransaction: async (req, { action, quantity, price, transaction_date, description, ispublic }, cb) => {
    try {
      const userId = helpers.getUser(req).id
      let remainingQuantity = quantity
      let transaction = await db.createTransaction(userId, action, quantity, price, transaction_date, description, ispublic)
      //找反向交易
      let oppositeTransaction = await db.findOppositeOpenTransaction(userId, action)
      while (oppositeTransaction && remainingQuantity > 0) {
        /*---------------如果反向交易未平倉量 >= 當前交易紀錄的數量-----------------*/
        if (oppositeTransaction.open_quantity >= remainingQuantity) {
          let newOpenQuantity = oppositeTransaction.open_quantity - remainingQuantity
          //建立平倉紀錄
          await db.createClosure(oppositeTransaction.id, transaction.id, quantity, price)
          //更新反向交易
          await db.updateTransactionStatus(oppositeTransaction.id, oppositeTransaction.open_quantity - remainingQuantity, newOpenQuantity === 0 ? 'closed' : 'open')
          //更新當前交易
          const pandl = oppositeTransaction.action === 'buy' ? transaction.price - oppositeTransaction.price : oppositeTransaction.price - transaction.price
          await db.updateTransactionStatus(transaction.id, 0, 'closed', 'closing_position', pandl)
          remainingQuantity = 0
        }
        /*---------------如果反向交易未平倉量 < 當前交易紀錄的數量-----------------*/
        else if (oppositeTransaction.open_quantity < remainingQuantity) {
          //新增平倉紀錄
          await db.createClosure(oppositeTransaction.id, transaction.id, oppositeTransaction.open_quantity, price)
          //更新反向交易
          await db.updateTransactionStatus(oppositeTransaction.id, 0, 'closed')
          //更新當前交易
          const pandl = oppositeTransaction.action === 'buy' ? transaction.price - oppositeTransaction.price : oppositeTransaction.price - transaction.price
          await db.updateClosingTransaction(oppositeTransaction.open_quantity, 'closing_position', 0, 'closed', pandl, transaction.id)
          //更新剩餘數量、新增交易紀錄
          remainingQuantity -= oppositeTransaction.open_quantity
          transaction = await db.createTransaction(userId, action, remainingQuantity, price, transaction_date, description)
          oppositeTransaction = await db.findOppositeOpenTransaction(userId, action)
        }
      }
      cb(null, transaction)
    } catch (err) {
      cb(err)
    }
  },
  getTransaction: async (req, transactionId, cb) => {
    const currentUserId = helpers.getUser(req).id
    const transaction = await db.getTransactionById(transactionId, currentUserId)
    if (!transaction) return cb('Transaction is not exist!')
    return cb(null, {
      status: 'success',
      transaction
    })
  },
  putTransaction: async (req, { action, quantity, price, transaction_date, description }, cb) => {
    try {
      const transactionId = req.params.id
      const transaction = await db.getTransactionById(transactionId)
      if (!transaction) return cb('transaction is not exist!')
      const updateTransaction = await db.putTransactionById(
        action,
        quantity,
        price,
        transaction_date,
        description,
        transactionId
      )
      return cb(null, {
        status: 'success',
        updateTransaction
      })
    } catch (err) {
      cb(err)
    }
  },
  removeTransaction: async (req, cb) => {
    try {
      const transactionId = req.params.id
      const transaction = await db.getTransactionById(transactionId)
      if (!transaction) return cb(`transaction isn't exist`)

      let openPositionId = ''
      const transactionCategory = await db.getTransactionCategory(transactionId)
      if (transactionCategory === 'closing_position') {
        openPositionId = await db.getOpenPosition(transactionId)
      }

      const targetId = openPositionId || transactionId
      const closures = await db.getClosures(targetId)

      let remoedTransactions = []
      for (let closure of closures) {
        const removeTransaction = await db.deleteTransactionById(closure.closed_transaction_id)
        remoedTransactions.push(removeTransaction)
      }
      const removedOpenPosition = await db.deleteTransactionById(targetId)

      return cb(null, {
        status: 'success',
        remoedTransactions,
        removedOpenPosition
      })
    } catch (err) {
      cb(err)
    }
  },
  postPublic: async (req, cb) => {
    const transactionId = req.params.id
    const transaction = await db.getTransactionById(transactionId)
    if (!transaction) return cb(`transaction isn't exist`)
    if (transaction.is_public === false) {
      await db.changePublic(true, transactionId)
      const updateTransaction = await db.getTransactionById(transactionId)
      return cb(null, {
        status: 'success',
        transaction: updateTransaction
      })
    } else {
      return cb('This transaction is already public.')
    }
  },
  deletePublic: async (req, cb) => {
    const transactionId = req.params.id
    const transaction = await db.getTransactionById(transactionId)
    if (!transaction) return cb(`transaction isn't exist`)
    if (transaction.is_public === true) {
      await db.deletePublic(false, transactionId)
      const updateTransaction = await db.getTransactionById(transactionId)
      return cb(null, {
        status: 'success',
        transaction: updateTransaction
      })
    } else {
      return cb('This transaction was originally private.')
    }
  },
  getPublicTransactions: async (req, cb) => {
    try {
      const currentUserId = helpers.getUser(req).id
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const offset = getOffset(limit, page)
      const result = await db.getPublicTransactions(currentUserId, limit, offset)
      const pagination = getPagination(limit, page, result.count)
      return cb(null, {
        status: 'success',
        pagination: pagination,
        transactions: result.transactions
      })
    } catch (err) {
      return cb(err)
    }
  },
  addLike: async (req, cb) => {
    try {
      const userId = helpers.getUser(req).id
      const transactionId = req.params.id
      const like = await db.createLike(userId, transactionId)
      return cb(null, {
        status: 'success',
        like
      })
    } catch (err) {
      if (err.code === '23505') return cb('you already liked')
      return cb(err)
    }
  },
  removeLike: async (req, cb) => {
    try {
      const userId = helpers.getUser(req).id
      const transactionId = req.params.id
      const removedLike = await db.removeLike(userId, transactionId)
      if (!removedLike) return cb(`You haven't liked this`)
      return cb(null, {
        status: 'success',
        removedLike
      })
    } catch (err) {
      return cb(err)
    }
  },
  postReply: async (req, content, cb) => {
    try {
      const userId = helpers.getUser(req).id
      const transactionId = req.params.id
      const transactionExists = await db.transactionExists(transactionId)
      if (!transactionExists) return cb(`The transaction dose not exist.`)
      const reply = await db.postReply(userId, transactionId, content)
      return cb(null, {
        status: 'success',
        reply
      })
    } catch (err) {
      return cb(err)
    }
  },
  deleteReply: async (req, cb) => {
    try {
      const replyId = req.params.id
      const deleteReply = await db.deleteReply(replyId)
      if (!deleteReply) return cb('The reply dose not exist.')
      return cb(null, {
        status: 'success',
        deleteReply
      })
    } catch (err) {
      return cb(err)
    }
  },
  getReplies: async (req, cb) => {
    try {
      const transactionId = req.params.id
      const replies = await db.getReplies(transactionId)
      if (!replies) return cb('There are no replies.')
      return cb(null, {
        status: 'success',
        replies
      })
    } catch (err) {
      return cb(err)
    }
  },
  getTransactions: async (req, { startDate, endDate }, cb) => {
    const userId = helpers.getUser(req).id
    const transactionsArray = await db.getTransactionsBetweenDates(userId, startDate, endDate)
    const win = transactionsArray.filter(t => t.pandl > 1)
    const loss = transactionsArray.filter(t => t.pandl !== null && t.pandl < 1)
    const winRate = win.length / (win.length + loss.length)
    const totalWinPoints = transactionsArray.reduce((acc, t) => t.pandl > 1 ? acc + Number(t.pandl) : acc, 0)
    const totalLossPoints = transactionsArray.reduce((acc, t) => t.pandl !== null && t.pandl < 1 ? acc + Math.abs(Number(t.pandl)) : acc, 0)
    const pAndL = totalWinPoints - totalLossPoints
    const averageWinPoints = Number((totalWinPoints / win.length).toFixed(2))
    const averageLossPoints = Number((totalLossPoints / loss.length).toFixed(2))
    const riskRatio = Number((averageWinPoints / averageLossPoints).toFixed(2))
    const haveOpnePosition = transactionsArray.some(t => t.category === 'opening_position' && t.status === 'open')
    const roundTrip = transactionsArray.reduce((acc, t) =>
      t.category === 'closing_position' ? acc + t.quantity : acc, 0)
    const netPAndL = pAndL - roundTrip
    const result = {
      haveOpnePosition: haveOpnePosition,
      winCount: win.length,
      lossCount: loss.length,
      winRate: Number((winRate).toFixed(2)),
      totalWinPoints: totalWinPoints,
      totalLossPoints: totalLossPoints,
      pAndL: pAndL,
      roundTrip: roundTrip,
      netPAndL: netPAndL,
      averageWinPoints: averageWinPoints,
      averageLossPoints: averageLossPoints,
      riskRatio: riskRatio,
      transactionsArray
    }
    return cb(null, {
      status: 'success',
      result
    })
  },
  getCurrentUserPublicTransaction: async (req, cb) => {
    try {
      const currentUserId = helpers.getUser(req).id
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const offset = getOffset(limit, page)
      const publicTransactions = await db.getCurrentUserPublicTransaction(currentUserId, limit, offset)
      if (!publicTransactions) return cb('Transactions not found!')
      const pagination = getPagination(page, limit, publicTransactions.totalCount)
      return cb(null, {
        status: 'success',
        pagination,
        publicTransactions: publicTransactions.result
      })
    } catch (err) {
      return cb(err)
    }
  }
}

module.exports = transactionsServices
