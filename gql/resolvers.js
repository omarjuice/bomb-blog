const { queryDB } = require('../db/connect')
const { compare, hashUser } = require('../db/crypt')
const Errors = require('./errors')
const validator = require('email-validator')

const authenticate = (session) => {
    let sessionUser;
    try {
        sessionUser = session.user.id
    } catch (e) {
        sessionUser = null
    }
    return sessionUser
}

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        authenticated: (_, args, { req }) => !!authenticate(req.session),
        user: async (_, args, { req, Loaders }) => {
            let sessionUser = authenticate(req.session)
            let id = args.id || sessionUser
            if (!id) throw Errors.user.notSpecified;
            const user = await Loaders.users.byId.load(id)
            if (user && user.id) return user;
            throw Errors.user.notFound
        },
        users: async (_, { input }) => {
            const orderBy = input.orderBy === 'username' ? 'LOWER(username)' : 'created_at';
            const order = input.order ? 'ASC' : 'DESC'
            const { cursor, limit, tags, search } = input
            if (tags && tags.length > 0) {
                const query = `
                SELECT 
                    users.id, users.username, users.email, users.created_at, COUNT(tags.tag_name) as relevance
                FROM users
                INNER JOIN user_tags
                    ON user_tags.user_id=users.id
                INNER JOIN tags
                    ON tags.id = user_tags.tag_id
                WHERE tag_name IN (?) AND users.username LIKE ?
                GROUP BY users.id
                ORDER BY relevance DESC, created_at ${order}
                LIMIT ?,?
                `
                const results = await queryDB(query, [tags, `%${search || ''}%`, cursor, limit], null, true).catch(e => { console.log(e) })
                return { results, cursor: results.length < limit ? null : cursor + results.length }
            }
            const query = `SELECT id, username, email, created_at FROM users WHERE username LIKE ? ORDER BY ${orderBy} ${order} LIMIT ?,?`
            const results = await queryDB(query, [`%${input.search || ''}%`, cursor, limit], null, true).catch(e => { console.log(e); })
            return { results, cursor: results.length < limit ? null : cursor + results.length }
        },
        post: async (_, args, { Loaders }) => {
            const post = await Loaders.posts.byId.load(args.id)
            if (post && post.id) return post;
            throw Errors.posts.notFound
        },
        posts: async (_, { input }) => {
            const orderBy = input.orderBy === 'title' ? 'LOWER(title)' : 'created_at';
            const order = input.order ? 'ASC' : 'DESC'
            const { cursor, limit, tags, search } = input
            if (tags && tags.length > 0) {
                const query = `
                SELECT 
                    posts.*, COUNT(tags.tag_name) as relevance
                FROM posts
                INNER JOIN post_tags
                    ON post_tags.post_id=posts.id
                INNER JOIN tags
                    ON tags.id = post_tags.tag_id
                WHERE tag_name IN (?) AND posts.title LIKE ?
                GROUP BY posts.id
                ORDER BY relevance DESC, created_at ${order}
                LIMIT ?,?
                `
                const results = await queryDB(query, [tags, `%${search || ''}%`, cursor, limit], null, true).catch(e => { console.log(e) })
                return { results, cursor: results.length < limit ? null : cursor + results.length }
            }
            const query = `SELECT * FROM posts WHERE title LIKE ? ORDER BY ${orderBy} ${order} LIMIT ?,?`
            const results = await queryDB(query, [`%${input.search || ''}%`, cursor, limit], null, true).catch(e => { console.log(e) })
            return { results, cursor: results.length < limit ? null : cursor + results.length }
        },
        tag: async (_, { id }, { Loaders }) => {
            const tag = await Loaders.tags.byId.load(id)
            if (tag && tag.id) return tag;
            throw Errors.tags.notFound;
        },
        tags: async (_, { input }) => {
            const orderBy = input.orderBy === 'tag_name' ? 'LOWER(tag_name)' : 'created_at';
            const order = input.order ? 'ASC' : 'DESC'
            const { cursor, limit, tags, search } = input
            const searchTags = tags && tags.length > 0 ? tags : [null]
            const query = `
            SELECT 
                tags.id, tag_name, created_at, IF(tag_name IN (?), 1, 0) AS relevance, (COUNT(DISTINCT comment_id) * 1 +  COUNT(DISTINCT post_id)*10 + COUNT(DISTINCT user_id)*30 ) as popularity 
            FROM tags
            INNER JOIN comment_tags
                ON comment_tags.tag_id=tags.id
            INNER JOIN post_tags
                ON post_tags.tag_id=tags.id
            INNER JOIN user_tags
                ON user_tags.tag_id=tags.id
            WHERE tag_name LIKE ? OR tag_name IN (?) 
            GROUP BY tags.id
            ORDER BY relevance DESC, popularity DESC, ${orderBy} ${order}
            LIMIT ?,?
            `
            const results = await queryDB(query, [searchTags, `%${search || ''}%`, searchTags, cursor, limit], null, true).catch(e => { throw e })
            return { results, cursor: results.length < limit ? null : cursor + results.length };
        },
        comment: async (_, { id }, { Loaders }) => await Loaders.comments.byId.load(id),
        comments: async (_, { input }) => {
            const orderBy = input.orderBy === 'comment_text' ? 'comment_text' : 'created_at';
            const order = input.order ? 'ASC' : 'DESC'
            const { cursor, limit, tags, search } = input
            if (tags && tags.length > 0) {
                const query = `
                SELECT 
                    comments.*, COUNT(tags.tag_name) AS relevance
                FROM comments
                INNER JOIN comment_tags
                    ON comment_tags.comment_id=comments.id
                INNER JOIN tags
                    ON tags.id = comment_tags.tag_id
                WHERE tag_name IN (?) AND comments.comment_text LIKE ?
                GROUP BY comments.id
                ORDER BY relevance DESC, created_at ${order}
                LIMIT ?,?
                `
                const results = await queryDB(query, [tags, `%${search || ''}%`, cursor, limit], null, true).catch(e => { console.log(e) })
                return { results, cursor: results.length < limit ? null : cursor + results.length }
            }
            const query = `SELECT * FROM comments WHERE comment_text LIKE ? ORDER BY ${orderBy} ${order} LIMIT ?,?`
            const results = await queryDB(query, [`%${input.search || ''}%`, cursor, limit], null, true).catch(e => { console.log(e) })
            return { results, cursor: results.length < limit ? null : cursor + results.length }
        }
    },
    Mutation: {
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
            const { title, post_content, caption, tags } = args.input;
            let sessionUser = authenticate(req.session)
            if (!sessionUser) throw Errors.authentication.notLoggedIn;
            if (!title || !post_content || !caption) throw Errors.posts.missingField;
            const { rowsAffected, insertId } = await queryDB(`INSERT INTO posts (user_id, title, caption, post_content) VALUES ?`, [[[sessionUser, title, caption, post_content]]]).catch(e => { throw Errors.database })
            if (rowsAffected < 1) return null;
            if (tags && tags.length > 0) {
                await batchInserts.tags.postTags(tags, insertId)
            }
            const newPost = await Loaders.posts.byId.load(insertId)
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
            const { affectedRows } =
                await queryDB(`
                UPDATE posts
                SET
                    title= ?,
                    caption= ?,
                    post_content= ?,
                    last_updated=NOW()
                WHERE id= ? AND user_id= ?
            `, [args.input.title || title, args.input.caption || caption, args.input.post_content || post_content, args.id, sessionUser]).catch(e => { throw Errors.database })
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
    },
    User: {
        profile: async ({ id }, _, { Loaders }) => {
            const profile = await Loaders.profiles.byId.load(id)
            if (profile && profile.user_id) return profile
            throw Errors.profile.notFound
        },
        posts: async ({ id }, _, { Loaders }) => await Loaders.posts.byUserId.load(id),
        followers: async ({ id }, _, { Loaders }) => await Loaders.users.followers.load(id),
        following: async ({ id }, _, { Loaders }) => await Loaders.users.following.load(id),
        numFollowers: async ({ id }, _, { Loaders }) => await Loaders.users.numFollowers.load(id),
        numFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.numFollowing.load(id),
        imFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.imFollowing.load(id),
        followingMe: async ({ id }, _, { Loaders }) => await Loaders.users.followingMe.load(id),
        tags: async ({ id }, _, { Loaders }) => await Loaders.tags.byUserId.load(id),
        likedPosts: async ({ id }, _, { Loaders }) => await Loaders.users.likedPosts.load(id),
        isMe: async ({ id }, _, { req }) => id === authenticate(req.session)
    },
    Post: {
        author: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id),
        numLikes: async ({ id }, _, { Loaders }) => await Loaders.posts.numLikes.load(id),
        comments: async ({ id }, _, { Loaders }) => await Loaders.posts.comments.load(id),
        numComments: async ({ id }, _, { Loaders }) => await Loaders.posts.numComments.load(id),
        likers: async ({ id }, _, { Loaders }) => await Loaders.posts.likers.load(id),
        tags: async ({ id }, _, { Loaders }) => await Loaders.tags.byPostId.load(id),
        iLike: async ({ id }, _, { Loaders }) => await Loaders.posts.iLike.load(id)
    },
    Comment: {
        commenter: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id),
        post: async ({ post_id }, _, { Loaders }) => await Loaders.posts.byId.load(post_id),
        numLikes: async ({ id }, _, { Loaders }) => await Loaders.comments.numLikes.load(id),
        numReplies: async ({ id }, _, { Loaders }) => await Loaders.comments.numReplies.load(id),
        replies: async ({ id }, _, { Loaders }) => await Loaders.comments.replies.load(id),
        likers: async ({ id }, _, { Loaders }) => await Loaders.comments.likers.load(id),
        tags: async ({ id }, _, { Loaders }) => await Loaders.tags.byCommentId.load(id),
        iLike: async ({ id }, _, { Loaders }) => await Loaders.comments.iLike.load(id)
    },
    Reply: {
        replier: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id),
    },
    Profile: {
        user: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id)
    },
    Tag: {
        users: async ({ id }, _, { Loaders }) => await Loaders.tags.users.load(id),
        posts: async ({ id }, _, { Loaders }) => await Loaders.tags.posts.load(id),
        comments: async ({ id }, _, { Loaders }) => await Loaders.tags.comments.load(id),
        popularity: async ({ id, popularity }, _, { Loaders }) => popularity || await Loaders.tags.popularity.load(id)
    },
    Follower: {
        imFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.imFollowing.load(id),
        followingMe: async ({ id }, _, { Loaders }) => await Loaders.users.followingMe.load(id),
        isMe: async ({ id }, _, { req }) => id === authenticate(req.session),
        profile: async ({ id }, _, { Loaders }) => await Loaders.profiles.byId.load(id)
    },
    Liker: {
        imFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.imFollowing.load(id),
        followingMe: async ({ id }, _, { Loaders }) => await Loaders.users.followingMe.load(id),
        isMe: async ({ id }, _, { req }) => id === authenticate(req.session),
        profile: async ({ id }, _, { Loaders }) => await Loaders.profiles.byId.load(id)
    }
};

module.exports = resolvers