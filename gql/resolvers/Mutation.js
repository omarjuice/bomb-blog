const { queryDB } = require('../../db/connect')
const { compare, hashUser } = require('../../db/crypt')
const Errors = require('../errors')
const validator = require('email-validator')
const { pubsub } = require('./utils')
const { authenticate } = require('./utils')
module.exports = {
    login: async (_, { username, password }, { req }) => {
        const [user] = await queryDB(`SELECT * FROM users WHERE username= ?`, [username]).catch(e => { throw Errors.database })
        if (user) {
            const { username, pswd, id, email, created_at } = user
            if (await compare(password, pswd)) {
                req.session.user = { id, username, email, created_at }
                req.session.save()
                return true
            }
            throw Errors.login.invalid
        }
        throw Errors.user.notFound
    },
    register: async (_, { input }, { req }) => {
        const { username, password, email } = input;
        if (!validator.validate(email)) throw Errors.register.invalidEmail;
        const [user] = await queryDB(`SELECT * FROM users WHERE username= ?`, [username])
        if (!user) {
            const { insertId } = await queryDB(`INSERT INTO users (username, email, pswd) VALUES ?`, [[[username, email, password]]], hashUser).catch(e => { throw Errors.database })
            const [newUser] = await queryDB(`SELECT username, email, id, created_at FROM users WHERE id= ?`, [insertId]).catch(e => { throw Errors.database })
            await queryDB(`INSERT INTO profiles (user_id) VALUES ?`, [[[newUser.id]]]).catch(e => { throw Errors.database })
            req.session.user = { ...newUser }
            return true
        }
        throw Errors.register.alreadyExists
    },
    logout: (_, args, { req }) => {
        if (!req.session.user) return true;
        req.session.user = null;
        return true
    },
    updateProfile: async (_, args, { req, Loaders, batchDeletes, batchInserts }) => {
        let id = authenticate(req.session)
        if (!id) throw Errors.authentication.notLoggedIn;
        if (!args.input) {
            return false
        }
        const profile = await Loaders.profiles.byId.load(id)
        if (!profile.user_id) throw Errors.profile.notFound;
        const { about, photo_path } = profile
        const { affectedRows } = await queryDB(`
            UPDATE profiles
            SET 
                about= ?,
                photo_path= ?,
                last_updated = NOW() 
            WHERE user_id = ?`, [args.input.about !== undefined ? args.input.about : about, args.input.photo_path || photo_path, id]).catch(e => { throw Errors.database })
        if (affectedRows > 0) {
            if (args.input.modTags) {
                const { addTags, deleteTags } = args.input.modTags;
                if (addTags && addTags.length > 0) {
                    await batchInserts.tags.userTags(addTags, id)
                }
                if (deleteTags && deleteTags.length > 0) {
                    await batchDeletes.tags.userTags(deleteTags, id)
                }
            }
            const [profile] = await queryDB(`SELECT * FROM profiles WHERE user_id= ?`, [id])
            return profile
        } else {
            throw Errors.database;
        }
    },
    createPost: async (_, args, { req, Loaders, batchInserts }) => {
        const { title, post_content, caption, tags, image } = args.input;
        let sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (!title || !post_content || !caption) throw Errors.posts.missingField;
        const { rowsAffected, insertId } = await queryDB(`INSERT INTO posts (user_id, title, caption, post_content, image) VALUES ?`, [[[sessionUser, title, caption, post_content, image]]]).catch(e => { throw Errors.database })
        if (rowsAffected < 1) return null;
        if (tags && tags.length > 0) {
            await batchInserts.tags.postTags(tags, insertId)
        }
        const newPost = await Loaders.posts.byId.load(insertId)
        pubsub.publish('NEW_POST', { newPost })
        if (newPost) return newPost;
        throw Errors.database
    },
    deletePost: async (_, args, { req }) => {
        let sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { affectedRows } = await queryDB(`DELETE FROM posts WHERE id= ? AND user_id= ?`, [args.id, sessionUser]).catch(e => { throw Errors.database })
        return affectedRows > 0;
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
        `, [args.input.title || title, args.input.caption || caption, args.input.post_content || post_content, image, args.id, sessionUser]).catch(e => { throw Errors.database })
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
        const [newPost] = await queryDB(`SELECT * FROM posts WHERE id= ? `, [args.id]).catch(e => { throw Errors.database })
        if (newPost) return newPost;
        throw Errors.posts.notFound
    },
    likePost: async (_, args, { req }) => {
        let sessionUser = authenticate(req.session)
        let { post_id } = args
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (!post_id) throw Errors.posts.notSpecified;
        const { affectedRows } = await queryDB(`INSERT INTO likes (user_id, post_id) VALUES ?`, [[[sessionUser, post_id]]]).catch(e => 0)
        return affectedRows > 0;
    },
    unlikePost: async (_, args, { req }) => {
        const { post_id } = args
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (!post_id) throw Errors.posts.notSpecified;
        const { affectedRows } = await queryDB(`DELETE FROM likes WHERE user_id= ? AND post_id = ?`, [sessionUser, post_id]).catch(e => false)
        return affectedRows > 0;
    },
    createComment: async (_, args, { req, Loaders, batchInserts }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { post_id, comment_text, tags } = args;
        const { affectedRows, insertId } = await queryDB(`INSERT INTO comments (user_id, post_id, comment_text) VALUES ?`, [[[sessionUser, post_id, comment_text]]]).catch(e => { throw Errors.database })
        if (affectedRows < 1) throw Errors.authorization.notAuthorized;
        if (tags && tags.length > 0) {
            await batchInserts.tags.commentTags(tags, insertId)
        }
        return await Loaders.comments.byId.load(insertId)
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
    deleteComment: async (_, args, { req, Loaders }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id } = args
        const { affectedRows } = await queryDB(`DELETE FROM comments WHERE id= ? AND user_id= ? `, [comment_id, sessionUser]).catch(e => { throw Errors.database })
        return affectedRows > 0
    },
    likeComment: async (_, args, { req }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id } = args;
        const { affectedRows } = await queryDB(`INSERT INTO comment_likes (user_id, comment_id) VALUES ?`, [[[sessionUser, comment_id]]]).catch(e => 0)
        return affectedRows > 0
    },
    unlikeComment: async (_, args, { req }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id } = args;
        const { affectedRows } = await queryDB(`DELETE FROM comment_likes WHERE comment_id= ? AND user_id = ?`, [comment_id, sessionUser]).catch(e => 0)
        return affectedRows > 0;
    },
    createReply: async (_, args, { req, Loaders }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { comment_id, reply_text } = args
        const { affectedRows, insertId } = await queryDB(`INSERT INTO replies (comment_id, user_id, reply_text) VALUES ?`, [[[comment_id, sessionUser, reply_text]]]).catch(e => { throw Errors.database })
        if (affectedRows < 1) throw Errors.authorization.notAuthorized;
        const [newReply] = await queryDB(`SELECT * FROM replies WHERE id = ?`, [insertId])
        return newReply
    },
    deleteReply: async (_, args, { req, Loaders }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        const { reply_id } = args;
        const { affectedRows } = await queryDB(`DELETE FROM replies WHERE id= ? AND user_id= ?`, [reply_id, sessionUser]).catch(e => { throw Errors.database })
        return affectedRows > 0
    },
    updateReply: async (_, args, { req, Loaders }) => {
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
    createFollow: async (_, { user_id }, { req }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (sessionUser === user_id) {
            return false
        }
        const { affectedRows } = await queryDB(`INSERT IGNORE INTO follows (follower_id, followee_id) VALUES ?`, [[[sessionUser, user_id]]]).catch(e => { throw Errors.database })
        return affectedRows > 0
    },
    deleteFollow: async (_, { user_id }, { req }) => {
        const sessionUser = authenticate(req.session);
        if (!sessionUser) throw Errors.authentication.notLoggedIn;
        if (sessionUser === user_id) {
            return false
        }
        const { affectedRows } = await queryDB(`DELETE IGNORE FROM follows WHERE follower_id= ? AND followee_id= ?`, [sessionUser, user_id]).catch(e => { throw (e) })
        return affectedRows > 0
    }
}