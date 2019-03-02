const validator = require('email-validator')
const moment = require('moment')
const { queryDB } = require('../../db/connect')
const { compare, hashUser, hashPW } = require('../../db/crypt')
const Errors = require('../errors')
const { pubsub, authenticate, authenticateAdmin, storeFS, deleteFS, simplifyString } = require('./utils')

module.exports = {
    login: async (_, { username, password }, { req }) => {
        const [user] = await queryDB(`SELECT * FROM users WHERE username= ? OR email=?`, [username, username]).catch(e => { throw Errors.database })
        if (user) {
            const { username, pswd, id, email, created_at } = user
            if (await compare(password, pswd)) {
                req.session.user = { id, username, email, created_at }
                req.session.user.lastLoginTime = moment(user.last_login || user.created_at).unix()
                req.session.user.lastVisited = req.session.user.lastLoginTime
                req.session.user.loginTime = Math.floor(Date.now() / 1000)
                req.session.user.visited = req.session.user.loginTime
                if (user.privilege === 'admin') {
                    req.session.user.admin = true
                }
                req.session.save()
                queryDB(`UPDATE users SET last_login=NOW() WHERE id=?`, [user.id])
                return true
            }
            throw Errors.login.invalid
        }
        throw Errors.user.notFound
    },
    register: async (_, { input }, { req }) => {
        const { username, password, email } = input;
        if (!validator.validate(email)) throw Errors.register.invalidEmail;
        const [user] = await queryDB(`SELECT * FROM users WHERE username= ? OR email=?`, [username, email])
        if (!user) {
            const { insertId } = await queryDB(`INSERT INTO users (username, email, pswd) VALUES ?`,
                [[[username, email, password]]], hashUser)
                .catch(e => { throw Errors.database })
            const [newUser] = await queryDB(`SELECT username, email, id, created_at FROM users WHERE id= ?`, [insertId]).catch(e => { throw Errors.database })
            await queryDB(`INSERT INTO profiles (user_id) VALUES ?`, [[[newUser.id]]]).catch(e => { throw Errors.database })
            req.session.user = { ...newUser }
            req.session.user.lastLoginTime = 1;
            req.session.user.lastVisited = 1;
            req.session.user.loginTime = Math.floor(Date.now() / 1000)
            req.session.user.visited = req.session.user.loginTime
            setTimeout(() => {
                pubsub.publish('APP_MESSAGE', { user_id: insertId, message: `Welcome, ${username}!`, created_at: String(Date.now()) })
            }, 1000)
            return insertId
        }
        throw Errors.register.alreadyExists
    },
    logout: (_, args, { req }) => {
        if (!req.session.user) return true;
        req.session.user = null;
        return true
    },
    createSecret: async (_, { question, answer }, { req }) => {
        const sessionUser = authenticate(req.session)
        if (!sessionUser) throw Errors.authentication.notLoggedIn
        const insert = [sessionUser, question, await hashPW(simplifyString(answer))]
        const { affectedRows } = await queryDB(`INSERT INTO user_secrets (user_id, question, answer) VALUES ?`, [[insert]])
        return affectedRows > 0
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
            WHERE user_id = ?`,
            [args.input.about !== undefined ? args.input.about : about, args.input.photo_path !== undefined ? args.input.photo_path : photo_path, id])
            .catch(e => { throw Errors.database })
        if (affectedRows > 0) {
            if (photo_path && args.input.photo_path) {
                deleteFS('.' + photo_path)
            }
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
            deleteFS('.' + image)
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
        if (image && post.image) {
            deleteFS('.' + post.image)
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
        const [newPost] = await queryDB(`SELECT * FROM posts WHERE id= ? `, [args.id]).catch(e => { throw Errors.database })
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
    uploadImage: async (_, { image }) => {
        const { filename, createReadStream } = await image
        const stream = createReadStream()
        const { path, id, error } = await storeFS({ stream, filename }).catch(error => { return { error } })
        if (error) {
            return null
        }
        return path.slice(1)
    },
    passwordReset: async (_, { id, secretAnswer, newPassword }) => {
        const [{ answer }] = await queryDB(`SELECT answer FROM user_secrets WHERE user_id=?`, [id])
        if (await compare(simplifyString(secretAnswer), answer)) {
            const pswd = await hashPW(newPassword)
            await queryDB(`UPDATE users SET pswd=? WHERE id=?`, [pswd, id])
            return true
        }
        return false
    },
    setLastRead: (_, { lastRead }, { req }) => {
        if (req.session.user) {
            req.session.user.lastRead = lastRead
            return lastRead
        }
        return null
    }
}