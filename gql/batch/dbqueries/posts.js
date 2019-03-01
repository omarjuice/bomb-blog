const { queryDB } = require('../../../db/connect')
const bool = !['test', 'production'].includes(process.env.NODE_ENV)

module.exports = {
    batchPosts: async keys => {
        const posts = await queryDB(`SELECT * FROM posts WHERE id IN (?)`, [keys], null, bool)
        const Posts = posts.reduce((acc, post) => {
            if (!post) return acc;
            acc[post.id] = post
            return acc
        }, {})
        return keys.map(key => Posts[key] ? Posts[key] : null)
    },
    batchPostsByUserId: async keys => {
        const posts = await queryDB(`SELECT * FROM posts WHERE user_id IN (?) ORDER BY posts.created_at DESC`, [keys], null, bool)
        const userPosts = posts.reduce((acc, post) => {
            if (!post) return acc;
            if (!acc[post.user_id]) {
                acc[post.user_id] = []
            }
            acc[post.user_id].push(post)
            return acc
        }, {})
        return keys.map(key => userPosts[key] || [])
    },

    batchPostLikes: async keys => {
        const likes =
            await queryDB(`
        SELECT 
            posts.id as post_id, COUNT(likes.created_at) as numLikes
        FROM posts
        LEFT JOIN likes
        ON likes.post_id = posts.id
        WHERE posts.id IN (?)
        GROUP BY posts.id
        `, [keys], null, bool)
        const Likes = likes.reduce((acc, { post_id, numLikes }) => {
            if (!post_id) return acc;
            acc[post_id] = numLikes
            return acc
        }, {})
        return keys.map(key => Likes[key] ? Likes[key] : 0)
    },
    batchComments: async keys => {
        const comments =
            await queryDB(`
        SELECT 
            * 
        FROM comments
        WHERE post_id IN (?)
        ORDER BY created_at DESC
        `, [keys], null, bool)
        const postComments = comments.reduce((acc, comment) => {
            if (!comment) return acc;
            if (!acc[comment.post_id]) {
                acc[comment.post_id] = [];
            }
            acc[comment.post_id].push(comment)
            return acc
        }, {})
        return keys.map(key => postComments[key] || [])
    },
    batchNumComments: async keys => {
        const numComments =
            await queryDB(`
        SELECT 
            post_id, COUNT(comments.created_at) AS numComments
        FROM
            comments
        WHERE post_id IN (?)
        GROUP BY post_id
        `, [keys], null, bool)
        const NumComments = numComments.reduce((acc, { post_id, numComments }) => {
            acc[post_id] = numComments
            return acc
        }, {})
        return keys.map(key => NumComments[key] ? NumComments[key] : 0)
    },
    batchPostLikers: async keys => {
        const likers =
            await queryDB(`
            SELECT 
                users.id AS id, post_id, username, likes.created_at AS liked_at
            FROM users
            INNER JOIN likes
                ON likes.user_id = users.id
            WHERE likes.post_id IN (?)`, [keys], null, bool);
        const Likers = likers.reduce((acc, { post_id, ...liker }) => {
            if (!liker || !post_id) return acc;
            if (!acc[post_id]) {
                acc[post_id] = [];
            }
            acc[post_id].push(liker)
            return acc
        }, {})
        return keys.map(key => Likers[key] || [])
    },
    batchILikePost: async (keys, id) => {
        if (!id) return keys.map(() => false);
        const iLike =
            await queryDB(`
        SELECT 
            * 
        FROM likes
        WHERE post_id IN (?) AND user_id = ?
        `, [keys, id], null, bool)
        const Ilike = iLike.reduce((acc, { post_id }) => {
            acc[post_id] = true;
            return acc
        }, {})
        return keys.map(key => !!Ilike[key])
    }
}