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
        user: async (_, args, { req, Loaders }) => {
            let sessionUser = authenticate(req.session)
            let id = args.id || sessionUser
            if (!id) throw Errors.user.notSpecified;
            const user = await Loaders.users.byId.load(id)
            if (user && user.id) return user;
            throw Errors.user.notFound
        },
        users: async (_, args, ) => {
            const orderBy = args.orderBy === 'username' ? 'LOWER(username)' : 'created_at';
            const order = args.order ? 'ASC' : 'DESC'
            const query = `SELECT id, username, email, created_at FROM users WHERE username LIKE ? ORDER BY ${orderBy} ${order} LIMIT ?`
            return await queryDB(query, [`%${args.search || ''}%`, args.limit]).catch(e => { throw Errors.database })
        },
        authenticated: (_, args, { req }) => !!authenticate(req.session),
        post: async (_, args, { Loaders }) => {
            const post = await Loaders.posts.byId.load(args.id)
            if (post && post.id) return post;
            throw Errors.posts.notFound
        },
        posts: async (_, args) => {
            const orderBy = args.orderBy === 'title' ? 'LOWER(title)' : 'created_at';
            const order = args.order ? 'ASC' : 'DESC'
            const query = `SELECT * FROM posts WHERE title LIKE ? ORDER BY ${orderBy} ${order} LIMIT ?`
            return await queryDB(query, [`%${args.search || ''}%`, args.limit]).catch(e => { throw Errors.database })
        },
        tag: async (_, args, { Loaders }) => {
            const tag = await Loaders.tags.byId.load(args.id)
            if (tag && tag.id) return tag;
            throw Errors.tags.notFound;
        },
        tags: async (_, args) => {
            const orderBy = args.orderBy === 'tag_name' ? 'LOWER(tag_name)' : 'created_at';
            const order = args.order ? 'ASC' : 'DESC'
            const query = `SELECT * FROM tags WHERE tag_name LIKE ? ORDER BY ${orderBy} ${order} LIMIT ?`
            const tags = await queryDB(query, [`%${args.search || ''}%`, args.limit]).catch(e => { throw Errors.database })
            if (tags) return tags;
            throw Errors.tags.notFound
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
        addLike: async (_, args, { req }) => {
            let sessionUser = authenticate(req.session)
            let { post_id } = args
            if (!sessionUser) throw Errors.authentication.notLoggedIn;
            if (!post_id) throw Errors.posts.notSpecified;
            const { affectedRows } = await queryDB(`INSERT INTO likes (user_id, post_id) VALUES ?`, [[[sessionUser, post_id]]]).catch(e => 0)
            return affectedRows > 0;
        },
        deleteLike: async (_, args, { req }) => {
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
            return await Loaders.posts.comments.load(post_id)
        },
        updateComment: async (_, args, { req, Loaders, batchDeletes, batchInserts }) => {
            const sessionUser = authenticate(req.session)
            if (!sessionUser) throw Errors.authentication.notLoggedIn;
            const { comment_id, comment_text, post_id, modTags } = args;
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
            return await Loaders.posts.comments.load(post_id)
        },
        deleteComment: async (_, args, { req, Loaders }) => {
            const sessionUser = authenticate(req.session)
            if (!sessionUser) throw Errors.authentication.notLoggedIn;
            const { comment_id, post_id } = args
            const { affectedRows } = await queryDB(`DELETE FROM comments WHERE id= ? AND post_id= ? AND user_id= ? `, [comment_id, post_id, sessionUser]).catch(e => { throw Errors.database })
            if (affectedRows < 1) throw Errors.authorization.notAuthorized;
            return await Loaders.posts.comments.load(post_id)

        },
        addCommentLike: async (_, args, { req }) => {
            const sessionUser = authenticate(req.session)
            if (!sessionUser) throw Errors.authentication.notLoggedIn;
            const { comment_id } = args;
            const { affectedRows } = await queryDB(`INSERT INTO comment_likes (user_id, comment_id) VALUES ?`, [[[sessionUser, comment_id]]]).catch(e => 0)
            return affectedRows > 0
        },
        deleteCommentLike: async (_, args, { req }) => {
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
            const { affectedRows } = await queryDB(`INSERT INTO replies (comment_id, user_id, reply_text) VALUES ?`, [[[comment_id, sessionUser, reply_text]]]).catch(e => { throw Errors.database })
            if (affectedRows < 1) throw Errors.authorization.notAuthorized;
            return await Loaders.comments.replies.load(comment_id);
        },
        deleteReply: async (_, args, { req, Loaders }) => {
            const sessionUser = authenticate(req.session);
            if (!sessionUser) throw Errors.authentication.notLoggedIn;
            const { reply_id, comment_id } = args;
            const { affectedRows } = await queryDB(`DELETE FROM replies WHERE id= ? AND user_id= ?`, [reply_id, sessionUser]).catch(e => { throw Errors.database })
            if (affectedRows < 1) throw Errors.authorization.notAuthorized;
            return await Loaders.comments.replies.load(comment_id)
        },
        updateReply: async (_, args, { req, Loaders }) => {
            const sessionUser = authenticate(req.session);
            if (!sessionUser) throw Errors.authentication.notLoggedIn;
            const { reply_id, comment_id, reply_text } = args;
            const { affectedRows } =
                await queryDB(`UPDATE replies SET reply_text= ?, last_updated=NOW() WHERE id= ? AND user_id= ?`,
                    [reply_text, reply_id, sessionUser]).catch(e => { throw Errors.database })
            if (affectedRows < 1) throw Errors.authorization.notAuthorized;
            return await Loaders.comments.replies.load(comment_id)
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
        profile: async (parent, args, { req, Loaders }) => {
            const id = args.id || parent.id || req.session.user.id
            if (!id) return null;
            const profile = await Loaders.profiles.byId.load(id)
            if (profile && profile.user_id) return profile
            throw Errors.profile.notFound
        },
        posts: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.posts.notFound;
            const posts = await Loaders.posts.byUserId.load(id)
            if (!posts) throw Errors.posts.notFound;
            return posts
        },
        followers: async ({ id }, _, { Loaders }) => await Loaders.users.followers.load(id),
        following: async ({ id }, _, { Loaders }) => await Loaders.users.following.load(id),
        numFollowers: async ({ id }, _, { Loaders }) => await Loaders.users.numFollowers.load(id),
        numFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.numFollowing.load(id),
        imFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.imFollowing.load(id),
        followingMe: async ({ id }, _, { Loaders }) => await Loaders.users.followingMe.load(id),
        tags: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.user.notSpecified;
            return await Loaders.tags.byUserId.load(id);
        },
        likedPosts: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.user.notSpecified;
            return await Loaders.users.likedPosts.load(id)
        },
        isMe: async ({ id }, _, { req }) => id === authenticate(req.session)
    },
    Post: {
        author: async ({ user_id }, _, { Loaders }) => {
            if (!user_id) throw Errors.user.notSpecified;
            const author = await Loaders.users.byId.load(user_id)
            if (!author || !author.username) throw Errors.user.notFound;
            return author
        },
        numLikes: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.posts.notSpecified;
            return await Loaders.posts.numLikes.load(id)
        },
        comments: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.posts.notSpecified;
            return await Loaders.posts.comments.load(id)
        },
        numComments: async ({ id }, _, { Loaders }) => {
            const comments = await Loaders.posts.comments.load(id)
            return comments.length
        },
        likers: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.posts.notSpecified;
            return await Loaders.posts.likers.load(id)
        },
        tags: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.posts.notSpecified;
            return await Loaders.tags.byPostId.load(id);
        },
        iLike: async ({ id }, _, { Loaders }) => await Loaders.posts.iLike.load(id)
    },
    Comment: {
        commenter: async ({ user_id }, _, { Loaders }) => {
            if (!user_id) throw Errors.user.notSpecified;
            const commenter = await Loaders.users.byId.load(user_id)
            if (!commenter || !commenter.username) throw Errors.user.notFound;
            return commenter
        },
        numLikes: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.comments.notSpecified
            return await Loaders.comments.numLikes.load(id)
        },
        numReplies: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.comments.notSpecified
            const replies = await Loaders.comments.replies.load(id)
            return replies.length
        },
        replies: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.comments.notSpecified;
            return await Loaders.comments.replies.load(id)
        },
        likers: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.comments.notSpecified;
            return await Loaders.comments.likers.load(id)
        },
        tags: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.comments.notSpecified;
            return await Loaders.tags.byCommentId.load(id);
        },
        iLike: async ({ id }, _, { Loaders }) => await Loaders.comments.iLike.load(id)
    },
    Reply: {
        replier: async ({ user_id }, _, { Loaders }) => {
            if (!user_id) throw Errors.user.notSpecified;
            const replier = await Loaders.users.byId.load(user_id)
            if (!replier || !replier.username) throw Errors.user.notFound;
            return replier
        },
    },
    Profile: {
        user: async ({ user_id }, _, { Loaders }) => {
            if (!user_id) throw Errors.user.notSpecified;
            const user = await Loaders.users.byId.load(user_id)
            if (!user || !user.username) throw Errors.user.notFound;
            return user
        }
    },
    Tag: {
        users: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.tags.notSpecified
            return await Loaders.tags.users.load(id)
        },
        posts: async ({ id }, _, { Loaders }) => {
            if (!id) throw Errors.tags.notSpecified
            return await Loaders.tags.posts.load(id)
        },
        comments: async ({ id }, _, { Loaders }) => {
            return await Loaders.tags.comments.load(id)
        },
    },
    Follower: {
        imFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.imFollowing.load(id),
        followingMe: async ({ id }, _, { Loaders }) => await Loaders.users.followingMe.load(id),
        isMe: async ({ id }, _, { req }) => id === authenticate(req.session),
        profile: async ({ id }, _, { Loaders }) => await Loaders.profiles.byId.load(id)

    }

};

module.exports = resolvers