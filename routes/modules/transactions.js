const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/api-auth')
const transactionsController = require('../../controllers/transaction-controller')

router.post('/', authenticated, transactionsController.postTransaction)

module.exports = router