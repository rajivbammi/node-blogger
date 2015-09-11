let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let passport = require('passport')
let crypto = require('crypto')
let SALT = 'CodePathHeartNodeJS'
// Add connect-flash middleware to index.js
let flash = require('connect-flash')
let mongoose = require('mongoose')

let passportMiddleware = require('./middleware')
let routes = require('./routes')
  // Add in-memory user before app.listen()
let user = {
  email: 'foo@foo.com',
   password: crypto.pbkdf2Sync('abcd', SALT, 4096, 512, 'sha256').toString('hex')
}

// Will allow crypto.promise.pbkdf2(...)
require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let app = express()
app.passport = passport

// Read cookies, required for sessions
app.use(cookieParser('ilovethenodejs'))

// Get POST/PUT body information (e.g., from html forms like login)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
  }))

  
app.set('view engine', 'ejs')
 // In-memory session support, required by passport.session()
app.use(session({
    secret: 'ilovethenodejs',
    resave: true,
    saveUninitialized: true
  }))

  // Use the passport middleware to enable passport
app.use(passport.initialize())
  // Enable passport persistent sessions
app.use(passport.session())

app.use(flash())

// passportMiddleware(app)
// routes(app)
passportMiddleware(app)
routes(app)


mongoose.connect('mongodb://127.0.0.1:27017/blogger')
// start server 
app.listen(PORT, () => console.log(`Listening @ http://127.0.0.1:${PORT}`))


