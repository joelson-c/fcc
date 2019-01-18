const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Sequelize = require('sequelize')

const exerciseRouter = require('./exercise/exerciseRouter')

function initDb() {
    const dbName = process.env.DB_NAME || 'app.db'

    const sequelizeInstance = new Sequelize(`sqlite:${dbName}`, {
        logging: null
    })

    return sequelizeInstance
}

module.exports = (dbInstance = initDb()) => {
    app.use(cors())

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())


    app.use(express.static('public'))
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/views/index.html')
    });

    app.use('/api/exercise', exerciseRouter(dbInstance))


    // Not found middleware
    app.use((req, res, next) => {
        return next({ status: 404, message: 'not found' })
    })

    // Error Handling middleware
    app.use((err, req, res, next) => {
        let errCode, errMessage

        errCode = err.status || 500
        errMessage = err.message || 'Internal Server Error'
        res.status(errCode).type('txt').send(errMessage)
    })

    return app
}
