const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const db = require('../db/db')
const GoogleStrategy = require('passport-google-oauth20').Strategy
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

const customExtractor = function (req) {
  let token = null
  token = ExtractJWT.fromAuthHeaderAsBearerToken()(req)
  if (!token && req.cookies) {
    token = req.cookies['accessToken']  
  }
  return token
}

const jwtOptions = {
  jwtFromRequest: customExtractor,
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

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const { name, email } = profile._json
      const existUser = await db.getUserByEmail(email)
      if (existUser) return cb(null, existUser)
      const randomPassword = Math.random().toString(36).slice(-8)
      const hashed = await bcrypt.hash(randomPassword, 10)
      const account = email
      const randomNumber = Math.floor(Math.random() * 100) + 1
      const avatar = `https://robohash.org/${randomNumber}?set=set4`
      const user = await db.createUser(name, account, hashed, email, avatar)
      return cb(null, user)
    } catch (err) {
      return cb(err, false)
    }
  }
))

module.exports = passport