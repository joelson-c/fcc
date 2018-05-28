const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB_URL)

const historySchema = new mongoose.Schema({
  term: String,
  when: { type: Date, default: Date.now }
})

const history = mongoose.model('history', historySchema)

exports.insertHistory = (term) => {
  const newHistory = new history({ term: term })

  return newHistory.save().then(() => {
    return Promise.resolve()
  })
}

exports.showHistory = () => {
  return history.find({}).exec().then((results) => {
    return Promise.resolve(results)
  })
}