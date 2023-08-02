const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/api-auth')
const adminController = require('../../controllers/admin-controller')

router.get('/users', authenticated, adminController.getUsers)
router.delete('/users/:id', authenticated, adminController.deleteUser)

module.exports = router