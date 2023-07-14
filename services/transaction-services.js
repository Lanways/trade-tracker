const db = require('../db/db')
const helpers = require('../_helpers')

const transactionsServices = {
  postTransaction: async (req, { action, quantity, price, transacton_date, description }, cb) => {
    try {
      const userId = helpers.getUser(req).id
      const transaction = await db.createTransaction(
        userId, action, quantity, price, transacton_date, description
      )
      cb(null, transaction)
    } catch (err) {
      cb(err)
    }

  }
}

module.exports = transactionsServices