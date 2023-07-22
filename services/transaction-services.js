const db = require('../db/db')
const helpers = require('../_helpers')

const transactionsServices = {
  postTransaction: async (req, { action, quantity, price, transaction_date, description }, cb) => {
    try {
      const userId = helpers.getUser(req).id
      let remainingQuantity = quantity
      let transaction = await db.createTransaction(userId, action, quantity, price, transaction_date, description,)
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
          const profit = oppositeTransaction.action === 'buy' ? transaction.price - oppositeTransaction.price : oppositeTransaction.price - transaction.price
          await db.updateTransactionStatus(transaction.id, 0, 'closed', 'closing_position', profit)
          remainingQuantity = 0
        }
        /*---------------如果反向交易未平倉量 < 當前交易紀錄的數量-----------------*/
        else if (oppositeTransaction.open_quantity < remainingQuantity) {
          //新增平倉紀錄
          await db.createClosure(oppositeTransaction.id, transaction.id, oppositeTransaction.open_quantity, price)
          //更新反向交易
          await db.updateTransactionStatus(oppositeTransaction.id, 0, 'closed')
          //更新當前交易
          const profit = oppositeTransaction.action === 'buy' ? transaction.price - oppositeTransaction.price : oppositeTransaction.price - transaction.price
          await db.updateClosingTransaction(oppositeTransaction.open_quantity, 'closing_position', 0, 'closed', profit, transaction.id)
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
  getTransaction: async (req, { transactionId }, cb) => {
    const transaction = await db.getTransactionById(transactionId)
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
      const deleteTransaction = await db.deleteTransactionById(transactionId)
      return cb(null, {
        status: 'success',
        deleteTransaction
      })
    } catch (err) {
      cb(err)
    }
  },
  getTransactions: async (req, { startDate, endDate }, cb) => {
    const userId = helpers.getUser(req).id
    const transactionsArray = await db.getTransactionsByDateRange(userId, startDate, endDate)
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
    const transactions = await db.getPublicTransactions()
    return cb(null, {
      status: 'success',
      transactions
    })
  }
}

module.exports = transactionsServices
