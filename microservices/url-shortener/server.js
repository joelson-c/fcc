var express = require('express'),
    validUrl = require('valid-url'),
    shortener = require('./models/shortener')

var app = express()

app.use(express.static('public'))

app.get('/', function(req, res) {
  res.render('index')
})

app.get('/:urlId', function(req, res, next) {
  var urlId = req.params.urlId

  shortener.findById(urlId).then(function(urlData) {
    if(urlData === null) {
      next('Invalid URL ID')
    }
    else {
      res.redirect(urlData.url)
    }
  })
  .catch(function(err) {
    next(err)
  })
})

app.get('/new/:url*', function(req, res, next) {
  var url = req.path.replace('/new/', '')

  if(validUrl.isUri(url)) {

    var responseObj = {
      original_url: url,
      short_url: null
    }

    shortener.findByUrl(url).then(function(urlData) {
      if(urlData === null) {
        shortener.insertUrl(url).then(function(insertId) {
          responseObj.short_url = req.hostname + '/' + insertId
          res.status(200).json(responseObj)
        })
        .catch(function(err) {
          next(err)
        })
      }
      else {
        responseObj.short_url = 'http://' + req.hostname + '/' + urlData._id
        res.status(200).json(responseObj)
      }
    })
    .catch(function(err) {
      next(err)
    })
  }
  else {    
    next('Invalid URL format')    
  }  
})

app.use(function(err, req, res, next) {  
  if(err instanceof Error) {    
    next(err)
  }
  else {     
    res.status(500).json({'error': err})    
  }
})


app.listen(3000, function() {
  console.log('Listening on port 3000!')
})