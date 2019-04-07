const { queryDB } = require('../../../db/connect')
const Errors = require('../../errors')
const { pubsub, authenticate, deleteCloud } = require('../utils')

module.exports = {
    createPost: async (_, args, { req, Loaders, batchInserts }) => {
        const { title, post_content, caption, tags, image } = args.input;
        let sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (!title || !post_content || !caption) throw Errors.posts.missingField;
        const { rowsAffected, insertId } = await queryDB(
            `INSERT INTO posts (user_id, title, caption, post_content, image) VALUES ?`,
            [[[sessionUser, title, caption, post_content, image]]])
            .catch(e => { throw Errors.database })
        if (rowsAffected < 1) return null;
        if (tags && tags.length > 0) {
            await batchInserts.tags.postTags(tags, insertId)
        }
        const newPost = await Loaders.posts.byId.load(insertId)
        if (newPost) {
            Loaders.users.followers.load(newPost.user_id)
                .then((followers) => {
                    pubsub.publish('NEW_POST', { newPost, followers: followers.map(follower => follower.id) })
                })
            return newPost
        }
        throw Errors.database
    },
    deletePost: async (_, args, { req, Loaders }) => {
        let sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { image } = await Loaders.posts.byId.load(args.id)
        const { affectedRows } = await queryDB(
            `DELETE FROM posts WHERE id= ? AND user_id= ?`,
            [args.id, sessionUser])
            .catch(e => { throw Errors.database })
        if (affectedRows > 0) {
            if (image) {
                deleteCloud(image)
            }
            return true
        };
        return false
    },
    updatePost: async (_, args, { req, Loaders, batchInserts, batchDeletes }) => {
        let sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (!args.id) throw Errors.posts.notSpecified
        if (!args.input) throw Errors.posts.missingField;
        const post = await Loaders.posts.byId.load(args.id)
        if (!post) throw Errors.posts.notFound;
        const { title, caption, post_content, user_id } = post
        if (user_id !== sessionUser) throw Errors.authorization.notAuthorized;
        const image = args.input.image ? args.input.image : null
        if ((image || args.input.image === '') && post.image) {
            deleteCloud(post.image)
        }
        const { affectedRows } =
            await queryDB(`
            UPDATE posts
            SET
                title= ?,
                caption= ?,
                post_content= ?,
                image=?,
                last_updated=NOW()
            WHERE id= ? AND user_id= ?
        `, [args.input.title || title, args.input.caption || caption, args.input.post_content || post_content, image, args.id, sessionUser])
                .catch(e => { throw Errors.database })
        if (affectedRows < 1) throw Errors.database;
        if (args.input.modTags) {
            const { modTags } = args.input;
            const { addTags, deleteTags } = modTags;
            if (deleteTags && deleteTags.length > 0) {
                await batchDeletes.tags.postTags(deleteTags, args.id)
            }
            if (addTags && addTags.length > 0) {
                await batchInserts.tags.postTags(addTags, args.id)
            }
        }
        const newPost = await Loaders.posts.byId.reload(args.id)
        if (newPost) return newPost;
        throw Errors.posts.notFound
    },
    likePost: async (_, args, { req, Loaders }) => {
        let sessionUser = authenticate(req.session)
        let { post_id } = args
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (!post_id) throw Errors.posts.notSpecified;
        const { affectedRows } = await queryDB(`INSERT INTO likes (user_id, post_id) VALUES ?`, [[[sessionUser, post_id]]]).catch(e => 0)
        if (affectedRows > 0) {
            Loaders.users.byId.load(sessionUser)
                .then(async (user) => {
                    const post = await Loaders.posts.byId.load(post_id)
                    pubsub.publish('NEW_LIKE', { user, post, liked_at: String(Date.now()) })
                })

            return true
        }
        return false
    },
    unlikePost: async (_, args, { req }) => {
        const { post_id } = args
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (!post_id) throw Errors.posts.notSpecified;
        const { affectedRows } = await queryDB(`DELETE FROM likes WHERE user_id= ? AND post_id = ?`, [sessionUser, post_id]).catch(e => false)
        return affectedRows > 0;
    },
}