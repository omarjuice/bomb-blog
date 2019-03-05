const { queryDB } = require('../../../db/connect')
const Errors = require('../../errors')
const { pubsub, authenticate } = require('../utils')
module.exports = {
    createFollow: async (_, { user_id }, { req, Loaders }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (sessionUser === user_id) {
            return false
        }
        const { affectedRows } = await queryDB(`INSERT IGNORE INTO follows (follower_id, followee_id) VALUES ?`, [[[sessionUser, user_id]]]).catch(e => { throw Errors.database })
        if (affectedRows > 0) {
            Loaders.users.byId.load(sessionUser)
                .then((user) => {
                    pubsub.publish('NEW_FOLLOWER', { user, followed_id: user_id, followed_at: String(Date.now()) })
                })
            return true
        }
        return false
    },
    deleteFollow: async (_, { user_id }, { req }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (sessionUser === user_id) {
            return false
        }
        const { affectedRows } = await queryDB(`DELETE IGNORE FROM follows WHERE follower_id= ? AND followee_id= ?`, [sessionUser, user_id]).catch(e => { throw (e) })
        return affectedRows > 0
    },
}