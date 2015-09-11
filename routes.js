let fs = require('fs')
let passport = require('passport')
let multiparty = require('multiparty')
let then = require('express-then')
let Post = require('./models/post')
let DataUri = require('datauri')
let User = require('./user')
let Comment = require('./models/post')

module.exports = (app) => {
  
app.get('/', (req, res) => {
    res.render('login.ejs')
})

app.get('/login', (req, res) => {
    res.render('login.ejs', {message: req.flash('error')})
})

app.get('/signup', (req, res) => {
    res.render('signup.ejs', {message: req.flash('error')})
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}))

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}))

app.get('/profile', isLoggedIn, then(async(req, res) => {
  let posts = await Post.promise.find({
            userId: req.user.id
  })

  res.render('profile.ejs',
    {user: req.user, posts: posts})
  }))

app.get('/blog/:blogTitle?', isLoggedIn, (req, res) => 
  res.render('blog.ejs', {user: req.user}))

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

app.post('/comment', isLoggedIn, then(async(req, res) => {
        let postId = req.body.postId
        if (!postId) {
          console.log("No postId")
          return
        }
        let post = await Post.promise.findById(req.body.postId)
        if (post) {
            post.comments.push({
                content: req.body['content'],
                userName: req.user.username,
                postId: req.body.postId
            })
            await post.save()
        }
        res.redirect('/post/' + req.body.postId)
    }))

app.get('/post/:postId?', isLoggedIn, then(async(req, res) => {
 let postId = req.params.postId
          if (!postId) {
            res.render('post.ejs', {
                post: {},
                verb: 'Create'
            })
            return
        } 
        let post = await Post.promise.findById(postId)
        if(!post) res.send(404, "Not found")
        
        let dataUri = new DataUri()
        let image = dataUri.format('.'+ post.image.contentType.split('/').pop(), post.image.data)
        
         res.render('post.ejs', {
          post: post,
          verb: 'View',
          image: `data:${post.image.contentType};base64,${image.base64}`,
    })
}))

app.get('/post/edit/:postId?', isLoggedIn, then(async(req, res) => {
  console.log("** Inside post get **")
  let postId = req.params.postId
  
        if (!postId) {
            res.render('post.ejs', {
                post: {},
                verb: 'Edit'
            })
            return
        } 
        let post = await Post.promise.findById(postId)
        if(!post) res.send(404, "Not found")
        let dataUri = new DataUri()
        let image = dataUri.format('.'+ post.image.contentType.split('/').pop(), post.image.data)
         res.render('post.ejs', {
          post: post,
          verb: 'Edit',
          image: `data:${post.image.contentType};base64,${image.base64}`,
        })
}))
app.post('/post/:postId?', isLoggedIn, then(async(req, res) => {
  // req.pipe(process.stdout)
  // return
  console.log("** Inside post get **")
  let postId = req.params.postId
        if (!postId) {
          let post = new Post()
          let[{Title:[title], description:[content]}, {image:[file]}]= await new multiparty.Form().promise.parse(req)
          
          post.title = title
          post.content = content
          post.image.data = await fs.promise.readFile(file.path)
          post.image.contentType = file.headers['content-type']
          post.userId = req.user.id
          await post.save()
          res.redirect('/profile')
          return
        }
       let post = await Post.promise.findById(postId)
        if(!post) {
          res.send(404, "Not found")
        }
       
         let [{Title:[title], description:[content]}] = await new multiparty.Form().promise.parse(req)
         post.title = title
         post.content = content
         //post.image.data = await fs.promise.readFile(file.path)
         //post.image.contentType = file.headers['content-type']
        
         await post.save()
         res.redirect('/profile')
         return
  }))
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next()
    res.redirect('/')
}
