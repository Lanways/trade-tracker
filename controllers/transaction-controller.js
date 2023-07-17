const transactionsServices = require('../services/transaction-services')

const transactionsController = {
  postTransaction: (req, res, next) => {
    const { action, quantity, price, transaction_date, description } = req.body
    if (!['buy', 'sell'].includes(action)) return res.status(400).json({ status: 'error', message: 'please input buy or sell!' })
    if (!quantity) return res.status(400).json({ status: 'error', message: 'quantity is required!' })
    if (!price) return res.status(400).json({ status: 'error', message: 'price is required!' })
    if (!transaction_date) return res.status(400).json({ status: 'error', message: 'transacton_date is required!' })
    if (description.length > 200) return res.status(400).json({ status: 'error', message: `The character count can't excced 200` })

    transactionsServices.postTransaction(req, { action, quantity, price, transaction_date, description }, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getTransaction: (req, res, next) => {
    const transactionId = req.params.id
    if (!transactionId) return res.status(400).json({ status: 'error', message: `This transaction isn't exist!` })
    transactionsServices.getTransaction(req, { transactionId }, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  putTransaction: (req, res, next) => {
    const { action, quantity, price, transaction_date, description } = req.body
    if (!['buy', 'sell'].includes(action)) return res.status(400).json({ status: 'error', message: 'please input buy or sell!' })
    if (!quantity) return res.status(400).json({ status: 'error', message: 'quantity is required!' })
    if (!price) return res.status(400).json({ status: 'error', message: 'price is required!' })
    if (!transaction_date) return res.status(400).json({ status: 'error', message: 'transacton_date is required!' })
    if (description.length > 200) return res.status(400).json({ status: 'error', message: `The character count can't excced 200` })

    transactionsServices.putTransaction(req, { action, quantity, price, transaction_date, description }, (err, data) => err ? next(err) : res.status(200).json(data))
  }
}

module.exports = transactionsController