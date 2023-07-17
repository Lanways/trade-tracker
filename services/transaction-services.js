const db = require('../db/db')
const helpers = require('../_helpers')

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
  }
}

module.exports = transactionsServices