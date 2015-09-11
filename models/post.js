let mongoose = require('mongoose')
let crypto = require('crypto')

let CommentSchema = mongoose.Schema({
	content: {
		type: String,
		required: true
	},
	createDate: {
        type: Date,
        default: Date.now
    },
	userName: String,
	postId: mongoose.Schema.ObjectId
})

let PostSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	image: {
	  data: Buffer,
	  contentType: String
	},
	userId: mongoose.Schema.ObjectId,
	comments: [CommentSchema]
})

module.exports = mongoose.model('Post', PostSchema)
//module.exports = mongoose.model('Comment', CommentSchema)