const Sequelize = require('sequelize')

/**
 * User model definition
 * 
 * @param {Sequelize.Sequelize} sequelize Sequelize instance
 * 
 */
module.exports = async (sequelize) => {
    const model = sequelize.define('user', {
        username: Sequelize.STRING
    })

    return await model.sync()
}
