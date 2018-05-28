var express = require('express')

var app = express()

app.enable('trust proxy')

app.get('/', function(req, res) {
  var userLanguange = req.get('Accept-Language').match(/^(?:\w+-?\w+)/)[0]
  var userOs = req.get('User-Agent').match(/\((.*?)\)/)[1]

  var responseObj = {
    ip: req.ip,
    language: userLanguange,
    os: userOs
  }

  res.status(200).json(responseObj)
})

app.listen(3000, '127.0.0.1', function() {
  console.log('Listening on port 3000!')
})