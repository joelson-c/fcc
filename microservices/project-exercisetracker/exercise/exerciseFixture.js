const SequelizeMock = require('sequelize-mock')

/**
 * User model definition
 * 
 * @param {SequelizeMock} sequelizeMock Sequelize Mock instance
 * 
 */
module.exports = async (sequelizeMock) => {
    return sequelizeMock.define('exercise', {
        id: 1,
        userId: 1,
        description: 'Test',
        duration: 50,
        date: new Date()
    }, {
        instanceMethods: {
            setUser: function() {
                
            }
        }
    })
}