var mongoose = require('mongoose'),    
    autoIncrement = require('mongoose-auto-increment')
    
mongoose.Promise = global.Promise
mongoose.connect(process.env.DB_URL)

autoIncrement.initialize(mongoose);

var urlSchema = new mongoose.Schema({  
  url: String
})

urlSchema.plugin(autoIncrement.plugin, 'url');
var link = mongoose.model('url', urlSchema, 'urls')

exports.insertUrl = function(url, cb) {
  var newUrl = new link({ url: url }) 

  return newUrl.save().then(function() {      
    return Promise.resolve(newUrl._id)
  })  
}

exports.findByUrl = function(url) {  
  return link.findOne({ url: url }).then(function(result) {
    return Promise.resolve(result)
  })  
} 

exports.findById = function(id) {
  return link.findOne({ _id: id }).exec().then(function(result) {    
    return Promise.resolve(result)
  })  
}