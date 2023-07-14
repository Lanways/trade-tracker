const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const transactions = require('./modules/transactions')
const { apiErrorHandler } = require('../middleware/error-handler')


router.use('/api/users', users)
router.use('/api/transactions', transactions)
router.use('/', apiErrorHandler)

module.exports = router