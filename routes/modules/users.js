const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const passport = require('../../config/passport')
const { authenticated } = require('../../middleware/api-auth')
const upload = require('../../middleware/multer')


router.get('/top', authenticated, userController.getTopUsers)
router.post('/signin', (req, res, next) => {
  if (!req.body.account || !req.body.password) return res.status(400).json({ status: 'error', message: "Account and Password is required" })
  next()
},
  passport.authenticate('local', { session: false }), userController.signIn
)
router.put('/:id', upload.single('avatar'), authenticated, userController.putUser)
router.get('/:id', authenticated, userController.getUser)
router.post('/', userController.signUp)

module.exports = router