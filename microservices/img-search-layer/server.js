const express = require('express'),
  googleImages = require('google-images'),
  history = require('./models/history.js')

const app = express()
const searchClient = new googleImages(process.env.CSE_ID, process.env.API_KEY)

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/search/:search', (req, res, next) => {
  const page = req.query.offset || 1
  const term = req.params.search
  
  searchClient.search(term, { page: page }).then((images) => {
    let responseArr = []

    for(let image of images) {
      responseArr.push({
        url: image.url,
        description: image.description,
        thumbnail: image.thumbnail.url,
        context: image.parentPage 
      })
    }

    history.insertHistory(term).then(() => {
      res.status(200).json(responseArr)
    }).catch((err) => next(err))
  })
})

app.get('/latest', (req, res, next) => {
  history.showHistory().then((results) => {
    res.status(200).json(results)
  }).catch((err) => next(err))
})

app.listen(3000, () => {
  console.log('Listening on port 3000!')
})