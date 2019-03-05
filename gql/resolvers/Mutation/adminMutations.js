const { queryDB } = require('../../../db/connect')
const Errors = require('../../errors')
const { pubsub, authenticateAdmin } = require('../utils')


module.exports = {
    featurePost: async (_, { id }, { req, Loaders }) => {
        const admin = authenticateAdmin(req.session)
        if (!admin) throw Errors.authorization.notAuthorized;
        const { affectedRows } = await queryDB(`UPDATE posts SET featured=?, featured_at=NOW() WHERE id=?`, [true, id], null, true)
        if (affectedRows > 0) {
            Loaders.posts.byId.load(id)
                .then(({ featured_at, ...post }) => {
                    pubsub.publish('FEATURED_POST', { post, featured_at })
                })
            return true
        }
        return false
    },
    unfeaturePost: async (_, { id }, { req, Loaders }) => {
        const admin = authenticateAdmin(req.session)
        if (!admin) throw Errors.authorization.notAuthorized
        const { affectedRows } = await queryDB(`UPDATE posts SET featured=?, featured_at=NULL WHERE id=?`, [false, id], null, true)
        return affectedRows > 0
    },
}