const { queryDB } = require('../../../db/connect')
const Errors = require('../../errors')
const { pubsub, authenticate } = require('../utils')
module.exports = {
    createComment: async (_, args, { req, Loaders, batchInserts }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { post_id, comment_text, tags } = args;
        const { affectedRows, insertId } = await queryDB(
            `INSERT INTO comments (user_id, post_id, comment_text) VALUES ?`,
            [[[sessionUser, post_id, comment_text]]])
            .catch(e => { throw Errors.database })
        if (affectedRows < 1) throw Errors.authorization.notAuthorized;
        if (tags && tags.length > 0) {
            await batchInserts.tags.commentTags(tags, insertId)
        }
        const newComment = await Loaders.comments.byId.load(insertId)
        Loaders.posts.byId.load(newComment.post_id)
            .then((post) => {
                pubsub.publish('NEW_COMMENT', { newComment, post })
            })
        return newComment
    },
    updateComment: async (_, args, { req, Loaders, batchDeletes, batchInserts }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id, comment_text, modTags } = args;
        const { affectedRows } =
            await queryDB(`
                UPDATE comments 
                SET 
                    comment_text= ?, 
                    last_updated= NOW()
                WHERE id = ? AND user_id= ?`, [comment_text, comment_id, sessionUser])
                .catch(e => { throw Errors.database })
        if (affectedRows < 1) throw Errors.authorization.notAuthorized;
        if (modTags) {
            const { addTags, deleteTags } = modTags;
            if (deleteTags && deleteTags.length > 0) {
                await batchDeletes.tags.commentTags(deleteTags, comment_id)
            }
            if (addTags && addTags.length > 0) {
                await batchInserts.tags.commentTags(addTags, comment_id)
            }
        }
        return await Loaders.comments.byId.load(comment_id)
    },
    deleteComment: async (_, args, { req }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id } = args
        const { affectedRows } = await queryDB(`DELETE FROM comments WHERE id= ? AND user_id= ? `, [comment_id, sessionUser]).catch(e => { throw Errors.database })
        return affectedRows > 0
    },
    likeComment: async (_, args, { req, Loaders }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id } = args;
        const { affectedRows } = await queryDB(`INSERT INTO comment_likes (user_id, comment_id) VALUES ?`, [[[sessionUser, comment_id]]]).catch(e => 0)
        if (affectedRows > 0) {
            Loaders.users.byId.load(sessionUser)
                .then(async (user) => {
                    const comment = await Loaders.comments.byId.load(comment_id)
                    pubsub.publish('NEW_COMMENT_LIKE', { user, comment, liked_at: String(Date.now()) })
                })
            return true
        }
        return false
    },
    unlikeComment: async (_, args, { req }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id } = args;
        const { affectedRows } = await queryDB(`DELETE FROM comment_likes WHERE comment_id= ? AND user_id = ?`, [comment_id, sessionUser]).catch(e => 0)
        return affectedRows > 0;
    },
}