const adminMutations = require('./adminMutations')
const followMutations = require('./followMutations')
const userMutations = require('./userMutations')
const miscMutations = require('./miscMutations')
const replyMutations = require('./replyMutations')
const postMutations = require('./postMutations')
const commentMutations = require('./commentMutations')

module.exports = {
    ...adminMutations,
    ...followMutations,
    ...userMutations,
    ...miscMutations,
    ...replyMutations,
    ...postMutations,
    ...commentMutations
}