const { queryDB } = require('../../../db/connect')
const Errors = require('../../errors')
const { pubsub, authenticate } = require('../utils')

module.exports = {
    createReply: async (_, args, { req, Loaders }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id, reply_text } = args
        const { affectedRows, insertId } = await queryDB(
            `INSERT INTO replies (comment_id, user_id, reply_text) VALUES ?`,
            [[[comment_id, sessionUser, reply_text]]])
            .catch(e => { throw Errors.database })
        if (affectedRows < 1) throw Errors.authorization.notAuthorized;
        const [newReply] = await queryDB(`SELECT * FROM replies WHERE id = ?`, [insertId])
        Loaders.comments.byId.load(comment_id)
            .then((comment) => {
                pubsub.publish('NEW_REPLY', { newReply, comment })
            })
        return newReply
    },
    deleteReply: async (_, args, { req, Loaders }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { reply_id } = args;
        const { affectedRows } = await queryDB(`DELETE FROM replies WHERE id= ? AND user_id= ?`, [reply_id, sessionUser]).catch(e => { throw Errors.database })
        return affectedRows > 0
    },
    updateReply: async (_, args, { req }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { reply_id, reply_text } = args;
        const { affectedRows } =
            await queryDB(`UPDATE replies SET reply_text= ?, last_updated=NOW() WHERE id= ? AND user_id= ?`,
                [reply_text, reply_id, sessionUser]).catch(e => { throw Errors.database })
        if (affectedRows < 1) throw Errors.authorization.notAuthorized;
        const [updatedReply] = await queryDB(`SELECT * FROM replies WHERE id = ?`, [reply_id])
        return updatedReply
    },
}