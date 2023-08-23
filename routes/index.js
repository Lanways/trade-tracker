const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const transactions = require('./modules/transactions')
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../middleware/error-handler')
const auth = require('./modules/auth')

router.use('/api/auth', auth)
router.use('/api/admin', admin)
router.use('/api/users', users)
router.use('/api/transactions', transactions)
router.use('/', apiErrorHandler)

module.exports = router