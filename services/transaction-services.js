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
          newOpenQuantity = oppositeTransaction.open_quantity - remainingQuantity
          //建立平倉紀錄
          await db.createClosure(oppositeTransaction.id, transaction.id, quantity, price)
          //更新反向交易
          await db.updateTransactionStatus(oppositeTransaction.id, oppositeTransaction.open_quantity - remainingQuantity, newOpenQuantity === 0 ? 'closed' : 'open')
          //更新當前交易
          await db.updateTransactionStatus(transaction.id, 0, 'closed', 'closing_position')
          remainingQuantity = 0
        }
        /*---------------如果反向交易未平倉量 < 當前交易紀錄的數量-----------------*/
        else if (oppositeTransaction.open_quantity < remainingQuantity) {
          //新增平倉紀錄
          await db.createClosure(oppositeTransaction.id, transaction.id, oppositeTransaction.open_quantity, price)
          //更新反向交易
          await db.updateTransactionStatus(oppositeTransaction.id, 0, 'closed')
          //更新當前交易
          await db.updateClosingTransaction(oppositeTransaction.open_quantity, 'closing_position', 0, 'closed', transaction.id)
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
    const transactions = await db.getTransactionsByDateRange(userId, startDate, endDate)
    return cb(null, {
      status: 'success',
      transactions
    })
  }
}

module.exports = transactionsServices