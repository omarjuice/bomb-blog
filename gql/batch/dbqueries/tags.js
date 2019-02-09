const { queryDB } = require('../../../db/connect')
const bool = !['test', 'production'].includes(process.env.NODE_ENV)

module.exports = {
    batchTags: async keys => {
        const tags = await queryDB(`SELECT * FROM tags WHERE id IN (?)`, [keys], null, bool)
        const Tags = tags.reduce((acc, tag) => {
            if (!tag) return acc;
            acc[tag.id] = tag
            return acc
        }, {})
        return keys.map(key => Tags[key] || {})
    },

    batchPostTags: async keys => {
        const tags =
            await queryDB(`
            SELECT 
                tag_name, tags.id as id, post_id, tags.created_at as created_at
            FROM post_tags
            INNER JOIN tags
                ON tags.id = post_tags.tag_id
            WHERE post_tags.post_id IN (?)`, [keys], null, bool)

        const Tags = tags.reduce((acc, { post_id, id, tag_name, created_at }) => {
            if (!post_id) return acc;
            if (!acc[post_id]) {
                acc[post_id] = [];
            }
            acc[post_id].push({ id, tag_name, created_at })
            return acc;
        }, {})

        return keys.map(key => Tags[key] || [])
    },
    batchCommentTags: async keys => {
        const tags =
            await queryDB(`
        SELECT 
            tag_name, tags.id as id, comment_id, tags.created_at as created_at
        FROM comment_tags
        INNER JOIN tags
            ON tags.id = comment_tags.tag_id
        WHERE comment_tags.comment_id IN (?)
        `, [keys], null, bool)
        const Tags = tags.reduce((acc, { comment_id, id, tag_name, created_at }) => {
            if (!comment_id) return acc;
            if (!acc[comment_id]) {
                acc[comment_id] = []
            }
            acc[comment_id].push({ id, tag_name, created_at })
            return acc;
        }, {})
        return keys.map(key => Tags[key] || [])
    },
    batchUserTags: async keys => {
        const tags =
            await queryDB(`
        SELECT 
            tag_name, tags.id as id, user_id, tags.created_at as created_at
        FROM user_tags
        INNER JOIN tags
            ON tags.id = user_tags.tag_id
        WHERE user_tags.user_id IN (?)
        `, [keys], null, bool)
        const Tags = tags.reduce((acc, { user_id, id, tag_name, created_at }) => {
            if (!user_id) return acc;
            if (!acc[user_id]) {
                acc[user_id] = []
            }
            acc[user_id].push({ id, tag_name, created_at })
            return acc
        }, {})
        return keys.map(key => Tags[key] || [])
    },
    batchTagUsers: async keys => {
        const users =
            await queryDB(`
        SELECT 
            tag_id, users.id as id, username, email, users.created_at as created_at
        FROM users
        INNER JOIN user_tags
            ON user_tags.user_id=users.id
        WHERE user_tags.tag_id IN (?)
        `, [keys], null, bool)
        const tagUsers = users.reduce((acc, { tag_id, ...user }) => {
            if (!user) return acc;
            if (!acc[tag_id]) {
                acc[tag_id] = []
            }
            acc[tag_id].push(user)
            return acc
        }, {})
        return keys.map(key => tagUsers[key] || [])
    },
    batchTagPosts: async keys => {
        const posts =
            await queryDB(`
        SELECT 
            tag_id, posts.id as id, title, posts.user_id, posts.created_at, last_updated, title, caption, post_content
        FROM posts
        INNER JOIN post_tags
            ON post_tags.post_id=posts.id
        WHERE post_tags.tag_id IN (?)
        `, [keys], null, bool)
        const tagPosts = posts.reduce((acc, { tag_id, ...post }) => {
            if (!post) return acc;
            if (!acc[tag_id]) {
                acc[tag_id] = []
            }
            acc[tag_id].push(post)
            return acc
        }, {})
        return keys.map(key => tagPosts[key] || [])
    },
    batchTagComments: async keys => {
        const comments =
            await queryDB(`
        SELECT 
            tag_id, comments.id, comments.user_id, comments.post_id, comment_text, comments.created_at, comments.last_updated
        FROM comments
        INNER JOIN comment_tags
            ON comment_tags.comment_id=comments.id
        WHERE comment_tags.tag_id IN (?)
        `, [keys], null, bool)
        const tagComments = comments.reduce((acc, { tag_id, ...comment }) => {
            if (!comment) return acc;
            if (!acc[tag_id]) {
                acc[tag_id] = []
            }
            acc[tag_id].push(comment)
            return acc
        }, {})
        return keys.map(key => tagComments[key] || [])
    },

    batchTagPopularity: async keys => {
        const tagPopularities =
            await queryDB(`
        SELECT
            tags.id, (COUNT(DISTINCT comment_id)*1 + COUNT(DISTINCT post_id)*10 +  COUNT(DISTINCT user_id)*30 ) as popularity
        FROM tags
        INNER JOIN comment_tags
            ON comment_tags.tag_id=tags.id
        INNER JOIN post_tags
            ON post_tags.tag_id=tags.id
        INNER JOIN user_tags
            ON user_tags.tag_id=tags.id
        WHERE tags.id IN (?)
        GROUP BY tags.id
        `, [keys], null, true)
        const TagPopularities = tagPopularities.reduce((acc, { id, popularity }) => {
            acc[id] = popularity
            return acc
        }, {})
        return keys.map(key => TagPopularities[key] ? TagPopularities[key] : 0)
    },
    bulkInsertTags: async tags => {
        await queryDB(`INSERT IGNORE INTO tags (tag_name) VALUES ?`, [tags]).catch(e => { throw Errors.database })
        const allTags = await queryDB(`SELECT * FROM tags WHERE tag_name IN (?)`, [tags]).catch(e => { throw Errors.database })
        return allTags.reduce((acc, { tag_name, id }) => {
            acc[tag_name] = id
            return acc
        }, {})
    }
}