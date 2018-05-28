var express = require('express')
var moment = require('moment')

var app = express()

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/:dateStr', function (req, res) {
  var dateStr = req.params.dateStr
  var momentDate = moment(dateStr, ['MMMM D, YYYY', 'X'])

  var responseObj = {
    unix: null,
    natual: null
  }

  if(momentDate.isValid()) {   
    responseObj.unix = momentDate.unix()
    responseObj.natual = momentDate.format('MMMM D, YYYY')
    res.status(200).json(responseObj)
  }
  else {
    res.status(500).json(responseObj)
  }  
})


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
