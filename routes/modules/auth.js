const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')

const passport = require('passport')
//api/auth/google
router.get('/google', passport.authenticate('google', {
  scope: ['email', 'profile']
}))
//api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res, next) => {
    req.isLocalStrategy = false
    next()
  },
  userController.signIn
)

module.exports = router