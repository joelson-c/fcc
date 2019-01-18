class Utils {
    /**
     * Converts the date string to a `Date` object
     * 
     * @param {string} dateStr The date string (yyyy-mm-dd)
     * @returns {Date} The date object
     */
    static parseDate(dateStr) {
        const [year, month, day] = dateStr.split('-')
        const date = new Date(year, month-1, day)

        if ((date.getMonth() + 1) === +month) {
            return date
        }

        throw new Error('Invalid date string')
    }
}

module.exports = Utils
