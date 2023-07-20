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
    const values = true
    const transactions = await db.getPublicTransactions(values)
    // if (!transactions) return cb('There are no public transaction.')
    return cb(null, {
      status: 'success',
      transactions
    })
  }
}

module.exports = transactionsServices