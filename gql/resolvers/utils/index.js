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
const authenticateAdmin = (session) => {
    let admin;
    try {
        if (session.user.admin) {
            admin = session.user.id
        }
    } catch (e) {
        admin = null
    }
    return admin
}
module.exports = { authenticate, pubsub, authenticateAdmin }