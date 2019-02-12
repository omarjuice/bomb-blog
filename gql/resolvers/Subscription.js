const { withFilter } = require('apollo-server-express')
const { pubsub } = require('./utils')
module.exports = {
    newPost: {
        subscribe: () => pubsub.asyncIterator(['NEW_POST'])
    }
}