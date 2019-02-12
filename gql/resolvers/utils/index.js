const { PubSub } = require('apollo-server-express')

const pubsub = new PubSub()

const authenticate = (session) => {
    let sessionUser;
    try {
        sessionUser = session.user.id
    } catch (e) {
        sessionUser = null
    }
    return sessionUser
}
module.exports = { authenticate, pubsub }