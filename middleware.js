let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('./user')
let crypto = require('crypto')
let SALT = 'CodePathHeartNodeJS'

module.exports= (app) => {

let passport = app.passport
	// Use email since id doesn't exist
passport.serializeUser(nodeifyit(async (user) => user.email))
passport.deserializeUser(nodeifyit(async (email) => {
    return await User.findOne({email}).exec()
}))

passport.use('local', new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'username',
    // We'll need this later
    failureFlash: true
}, nodeifyit(async (username, password) => {
    let user
    if(username.indexOf('@')!=-1) {
      let email = username.toLowerCase()
      user = await User.promise.findOne({email})
    } else {
      user = await User.promise.findOne({username})
    }
   if(!user || username !== user.username) {
    return [false, {message: 'Invalid username'}]
    }

   if(!await user.validatePassword(password)) {
    return [false, {message: 'Invalid password'}]
    }

    return user
}, {spread: true})))


passport.use('local-signup', new LocalStrategy({
   // Use "email" field instead of "username"
   usernameField: 'email',
   failureFlash: true,
   passReqToCallback: true
   }, nodeifyit(async(req, email, password) => {
        email = (email || '').toLowerCase()
        // Is the email taken?
        if (await User.promise.findOne({email})) {
            return [false, {
                message: 'That email is already taken.'
            }]
        }

    
    let {
            username, title, description
    } = req.body
    if (await User.promise.findOne({username})) {
        return [false, {message: 'username is already taken.'}]
    }

    // create the user
    let user = new User()
    user.email = email
    user.username = username
    user.blogTitle = title
    user.blogDescription = description

    // Use a password hash instead of plain-text
    //user.password = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex')
    user.password = password
    try {
     return await user.save()
    } catch (e) {
    return [false, {message: e.message}]
  }
}, {spread: true})))
}
