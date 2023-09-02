const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const upload = require('../../middleware/multer')

router.get('/:id/likes', userController.getUserLikes)
router.get('/:id/history', userController.getHistoryTransactions)
router.get('/:id/byDate', userController.getTransactionsForTheDay)
router.get('/top', userController.getTopUsers)

router.get('/token', userController.getToken)
router.post('/logout', userController.logout)
router.put('/:id', upload.single('avatar'), userController.putUser)
router.get('/', userController.getUser)

module.exports = router