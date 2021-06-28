const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
const OneHourInMilliSeconds = 60 * 60 * 1000
module.exports = {
    fourDaysAgo,
    oneWeekAgo,
    eightDaysAgo
}