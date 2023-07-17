const db = require('../db/db')
const helpers = require('../_helpers')
const { Pool } = require('pg')

const transactionsServices = {
  postTransaction: async (req, { action, quantity, price, transaction_date, description }, cb) => {
    try {
      const userId = helpers.getUser(req).id
      const transaction = await db.createTransaction(
        userId, action, quantity, price, transaction_date, description
      )
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