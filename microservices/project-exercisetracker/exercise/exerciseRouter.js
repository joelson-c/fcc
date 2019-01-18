const express = require('express')
const Sequelize = require('sequelize')
const Utils = require('../Utils')

const Op = Sequelize.Op

/**
 * @param {Sequelize.Sequelize} dbInstance The sequelize db instance
 */
module.exports = (dbInstance) => {
    const router = express.Router()

    /**
     * Requires the model definition file
     * 
     * @returns {import("./exerciseModel")} The sequelize model
     */
    async function getExerciseModel() {
        return await dbInstance.import('./exerciseModel')
    }
    
    /**
     * Requires the model definition file
     * 
     * @returns {import("../user/userModel")} The sequelize model
     */
    async function getUserModel() {
        return await dbInstance.import('../user/userModel')
    }

    /**
     * Request body types definition
     * @typedef {{ userId: number, description: string, duration: string, date: string }} ExerciseAddRequest
     * @typedef {{ userId: number, from: string?, to: string?, limit: string? }} ExerciseLogRequest
     * @typedef {{ username: string }} NewUserRequest
     */

    router.post('/new-user', async (req, res) => {
        /** @type {NewUserRequest} */
        const { username } = req.body

        const User = await getUserModel()

        if (username) {
            const createdUser = await User.create({
                username
            })

            res.json({
                id: createdUser.id,
                username: createdUser.username
            })
        } else {
            res.sendStatus(400) // Bad request
        }
    })

    router.get('/users', async (_, res) => {
        const User = await getUserModel()

        const userList = await User.findAll({
            attributes: ['id', 'username']
        })

        res.json(userList)
    })


    router.post('/add', async (req, res) => {
        const User = await getUserModel()
        const Exercise = await getExerciseModel()

        /** @type {ExerciseAddRequest} */
        const { userId, description, date, duration } = req.body

        const reqUser = await User.findById(userId)

        if (reqUser !== null && duration > 0 && description.length > 0) {
            const exerciseDate = date ? Utils.parseDate(date) : new Date()

            const createdExercise = await Exercise.create({
                date: exerciseDate,
                description,
                duration
            })

            await createdExercise.setUser(reqUser)

            res.json({
                id: reqUser.id,
                username: reqUser.username,
                description: createdExercise.description,
                duration: createdExercise.duration,
                date: createdExercise.date
            })
        } else {
            res.sendStatus(400) // Bad request
        }
    })

    router.get('/log', async (req, res) => {
        const Exercise = await getExerciseModel()

        /** @type {ExerciseLogRequest} */
        const { userId, from, to, limit } = req.query

        if (userId !== undefined) {
            let exerciseLog

            if (from || to) {
                exerciseLog = await Exercise.findAll({
                    attributes: ['description', 'duration', 'date', 'id'],
                    where: {
                        userId,
                        date: {
                            [Op.gt]: from ? Utils.parseDate(from) : new Date(0),
                            [Op.lt]: to ? Utils.parseDate(to) : new Date()
                        }
                    },
                    limit
                })
            } else {
                exerciseLog = await Exercise.findAll({
                    attributes: ['description', 'duration', 'date', 'id'],
                    where: {
                        userId
                    },
                    limit
                })
            }

            return res.json(exerciseLog)
        } else {
            res.sendStatus(400) // Bad request
        }
    })

    return router
}
