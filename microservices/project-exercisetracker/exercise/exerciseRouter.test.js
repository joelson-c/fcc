const request = require('supertest')
const SequelizeMock = require('sequelize-mock')

const app = require('../app')

function mockDb() {
    const mock = new SequelizeMock()

    mock.$overrideImport('../user/userModel', '../user/userFixture')
    mock.$overrideImport('./exerciseModel', './exerciseFixture')

    return mock
}

describe('ExcerciseRouter', () => {
    let dbInstance

    beforeAll(() => {
        dbInstance = mockDb()
    })

    afterAll(() => {
        dbInstance = null
    })

    /** 
     * The endpoint response body
     * @typedef {{ username: string, id: string }} NewUserResponse
     */
    describe('/api/exercise/new-user', () => {
        it('creates an user and returns an object with user data, given the username', async () => {
            const testUserName = 'someName'

            const result = await request(app(dbInstance))
                .post('/api/exercise/new-user')
                .send(`username=${testUserName}`)
                .expect(200)

            /** @type {NewUserResponse} */
            const resultObj = result.body

            expect(resultObj.username).toBe(testUserName)
            expect(resultObj.id).not.toBeNaN()
        })

        it('returns a bad request status, given an empty username', async () => {
            const testUserName = ''

            return await request(app(dbInstance))
                .post('/api/exercise/new-user')
                .send(`uname=${testUserName}`)
                .expect(400)
        })
    })

    /** 
     * The endpoint response body
     * @typedef {Array<{ username: string, id: string }>} UserListResponse
     */
    describe('/api/exercise/users', () => {
        it('returns an array of users', async () => {
            const result = await request(app(dbInstance))
                .get('/api/exercise/users')
                .expect(200)

            /** @type {UserListResponse} */
            const resultObj = result.body

            expect(resultObj).toHaveLength(1)
            expect(resultObj).toHaveProperty('0.username', 'testUserName')
        })
    })

    /** 
     * The endpoint response body
     * @typedef {{ description: string, duration: number, date: date }} ExerciseResponse
     * @typedef { NewUserResponse & ExerciseResponse } ExerciseAddResponse
     */
    describe('/api/exercise/add', () => {
        it('creates an exercise and returns an object, given the required fields', async () => {
            const exercise = {
                userId: 1,
                description: 'Test EX',
                duration: 60,
            }

            const result = await request(app(dbInstance))
                .post('/api/exercise/add')
                .send(exercise)
                .expect(200)

            /** @type {ExerciseAddResponse} */
            const resultObj = result.body

            expect(resultObj).toMatchObject({
                id: exercise.userId,
                description: exercise.description,
                duration: exercise.duration
            })
        })

        it('creates an exercise and returns an object, given an specific date', async () => {
            const exercise = {
                userId: 1,
                description: 'Test EX',
                duration: 60,
                date: '2019-01-16'
            }

            const result = await request(app(dbInstance))
                .post('/api/exercise/add')
                .send(exercise)

            /** @type {ExerciseAddResponse} */
            const resultObj = result.body

            expect(resultObj).toMatchObject({
                id: exercise.userId,
                description: exercise.description,
                duration: exercise.duration
            })

            expect(new Date(resultObj.date) - new Date(2019, 0, 16)).toBe(0)
        })

        it('returns a bad request status, given some invalid params', async () => {
            const exercise = {
                userId: 7779,
                description: '',
                duration: -1
            }

            return await request(app(dbInstance))
                .post('/api/exercise/add')
                .send(exercise)
                .expect(400)
        })
    })

    /** 
     * The endpoint response body
     * @typedef {Array<ExerciseResponse>} ExerciseLogResponse
     */
    describe('/api/exercise/log', () => {
        const testData = [
            {
                userId: 1,
                from: '',
                to: '',
                limit: ''
            },
            {
                userId: 1,
                from: '2019-01-10',
                to: '2019-01-16',
                limit: 2
            },
            {
                userId: 1,
                from: '',
                to: '2019-01-16',
                limit: 2
            },
            {
                userId: 1,
                from: '2019-01-10',
                to: '',
                limit: 2
            }
        ]

        it.each(testData)
        ("returns the users's exercise log, given %p", async ({ userId, from, to, limit }) => {
            const result = await request(app(dbInstance))
                .get(`/api/exercise/log?userId=${userId}&from=${from}&to=${to}&limit=${limit}`)
                .expect(200)

            /** @type {ExerciseLogResponse} */
            const resultObj = result.body

            expect(resultObj).toHaveLength(1)
            expect(resultObj).toHaveProperty('0.description', 'Test')
            expect(resultObj).toHaveProperty('0.duration', 50)
        })

        it('returns a bad request status, given an invalid user id', async () => {
            const requestData = {
                to: '2019-01-16',
                limit: 2
            }

            return await request(app(dbInstance))
                .get('/api/exercise/log')
                .send(requestData)
                .expect(400)
        })
    })
})
