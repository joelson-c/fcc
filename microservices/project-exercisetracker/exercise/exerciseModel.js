const Sequelize = require('sequelize')

/**
 * Exercise model definition
 * 
 * @param {Sequelize.Sequelize} sequelize Sequelize instance
 * 
 */

module.exports = async (sequelize) => {
    const User = await sequelize.import('../user/userModel')

    const Exercise = sequelize.define('exercise', {
        description: Sequelize.TEXT,
        duration: Sequelize.INTEGER,
        date: Sequelize.DATE
    })
    
    Exercise.User = Exercise.belongsTo(User)
    
    return await Exercise.sync()
}
