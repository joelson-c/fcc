const SequelizeMock = require('sequelize-mock')

/**
 * User model definition
 * 
 * @param {SequelizeMock} sequelizeMock Sequelize Mock instance
 * 
 */
module.exports = async (sequelizeMock) => {
    return sequelizeMock.define('user', {
        id: 1,
        username: 'testUserName'
    })
}
