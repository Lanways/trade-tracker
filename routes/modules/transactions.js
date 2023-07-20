const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/api-auth')
const transactionsController = require('../../controllers/transaction-controller')

router.get('/publicTransactions', authenticated, transactionsController.getPublicTransactions)
router.post('/:id', authenticated, transactionsController.postPublic)
router.delete('/:id', authenticated, transactionsController.deletePublic)

router.get('/:id', authenticated, transactionsController.getTransaction)
router.put('/:id', authenticated, transactionsController.putTransaction)
router.delete('/:id', authenticated, transactionsController.removeTransaction)
router.post('/range', authenticated, transactionsController.getTransactions)
router.post('/', authenticated, transactionsController.postTransaction)

module.exports = router