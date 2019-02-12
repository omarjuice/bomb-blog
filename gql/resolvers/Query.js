const { queryDB } = require('../../db/connect')
const Errors = require('../errors')
const { authenticate } = require('./utils')

module.exports = {
    hello: () => 'Hello world!',
    authenticated: (_, args, { req }) => !!authenticate(req.session),
    user: async (_, args, { req, Loaders }) => {
        let sessionUser = authenticate(req.session)
        let id = args.id || sessionUser
        if (!id) return null;
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
}