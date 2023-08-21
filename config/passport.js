const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const db = require('../db/db')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

passport.use(new LocalStrategy(
  {
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, account, password, cb) => {
    try {
      const user = await db.findOneUserByAccount(account)
      if (!user) return cb('That account is not registered!')
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return cb('Email or Password incorrect.')
      return cb(null, user)
    } catch (err) {
      return cb(err)
    }
  }
))

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, cb) => {
  try {
    const user = await db.getUserById(jwtPayload.id)
    if (user) {
      return cb(null, user)
    } else {
      return cb(null, false)
    }
  } catch (err) {
    return cb(err)
  }
}))

module.exports = passport