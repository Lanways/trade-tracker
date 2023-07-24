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
  },
  removeTransaction: (req, res, next) => {
    transactionsServices.removeTransaction(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getTransactions: (req, res, next) => {
    const { startDate, endDate } = req.body
    if (!startDate) return res.status(400).json({ status: 'error', message: 'startDate is required!' })
    if (!endDate) return res.status(400).json({ status: 'error', message: 'endDate is required!' })

    transactionsServices.getTransactions(req, { startDate, endDate }, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  postPublic: (req, res, next) => {
    transactionsServices.postPublic(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  deletePublic: (req, res, next) => {
    transactionsServices.deletePublic(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getPublicTransactions: (req, res, next) => {
    transactionsServices.getPublicTransactions(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  addLike: (req, res, next) => {
    transactionsServices.addLike(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  removeLike: (req, res, next) => {
    transactionsServices.removeLike(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  postReply: (req, res, next) => {
    const { content } = req.body
    if (!content) return res.status(400).json({ status: 'error', message: 'content is required!' })
    transactionsServices.postReply(req, content, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  deleteReply: (req, res, next) => {
    transactionsServices.deleteReply(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
  getReply: (req, res, next) => {
    transactionsServices.getReply(req, (err, data) => err ? next(err) : res.status(200).json(data))
  },
}

module.exports = transactionsController
