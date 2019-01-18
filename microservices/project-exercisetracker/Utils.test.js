const Utils = require('./Utils')

describe('Utils', () => {
    describe('parseDate', () => {
        it.each([['2019-01-16', 2019, 0, 16], ['1999-12-01', 1999, 11, 1], ['2019-01-01', 2019, 0, 1]])
        ('should parse the date correctly, given %s as date string', (dateStr, expYear, expMonth, expDay) => {
            const expected = new Date(expYear, expMonth, expDay)

            const result = Utils.parseDate(dateStr)

            expect(result - expected).toBe(0)
        })

        it.each([['2019-02-31', '2025-25-25', '1999-02-99', '2019-04-31']])
        ('should throw an exception, given an invalid date', (dateStr) => {
            expect(() => {
                Utils.parseDate(dateStr)
            }).toThrow('Invalid date string')
        })
    })
})