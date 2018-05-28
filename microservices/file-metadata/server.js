var express = require('express')
var multer = require('multer')
var upload = multer({ dest: 'uploads/'})

var app = express()

app.use(express.static('public'))

app.get('/', function(req, res) {
    res.render('index')
})

app.post('/upload', upload.single('fileInput'), function(req, res) {    
    res.status(200).json({
        "size": req.file.size
    })
})

app.listen(3000, function() {
    console.log('Listening on port 3000!')
})