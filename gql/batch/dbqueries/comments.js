const { queryDB } = require('../../../db/connect')
const bool = !['test', 'production'].includes(process.env.NODE_ENV)

module.exports = {
    batchCommentsById: async keys => {
        const comments =
            await queryDB(`
        SELECT 
            *
        FROM comments
        WHERE id IN (?)
        `, [keys], null, bool)
        const Comments = comments.reduce((acc, comment) => {
            acc[comment.id] = comment
            return acc
        }, {})
        return keys.map(key => Comments[key] || {})
    },
    batchCommentLikes: async keys => {
        const commentLikes =
            await queryDB(`
        SELECT 
            comments.id as comment_id, COUNT(comment_likes.created_at) as numLikes
        FROM comments
        INNER JOIN comment_likes
            ON comments.id = comment_likes.comment_id
        WHERE comments.id IN (?)
        GROUP BY comments.id
        `, [keys], null, bool)
        const commentNumLikes = commentLikes.reduce((acc, { comment_id, numLikes }) => {
            if (!comment_id) return acc;
            acc[comment_id] = numLikes
            return acc
        }, {})
        return keys.map(key => commentNumLikes[key] ? commentNumLikes[key] : 0)
    },
    batchCommentReplies: async keys => {
        const commentReplies =
            await queryDB(
                `SELECT 
                * 
            FROM replies 
            WHERE comment_id IN (?) 
            ORDER BY created_at DESC
            `, [keys], null, bool)
        const CommentReplies = commentReplies.reduce((acc, reply) => {
            if (!reply) return acc;
            if (!acc[reply.comment_id]) {
                acc[reply.comment_id] = []
            }
            acc[reply.comment_id].push(reply)
            return acc
        }, {})
        return keys.map(key => CommentReplies[key] || [])
    },
    batchNumReplies: async keys => {
        const numReplies =
            await queryDB(`
        SELECT 
            comment_id, COUNT(replies.created_at) AS numReplies
        FROM replies
        WHERE comment_id IN (?)
        GROUP BY comment_id
        `, [keys], null, bool)
        const NumReplies = numReplies.reduce((acc, { comment_id, numReplies }) => {
            acc[comment_id] = numReplies
            return acc
        }, {})
        return keys.map(key => NumReplies[key] ? NumReplies[key] : 0)
    }
    ,
    batchCommentLikers: async keys => {
        const likers =
            await queryDB(`
            SELECT 
                users.id AS id, comment_id, username, comment_likes.created_at AS liked_at
            FROM users
            INNER JOIN comment_likes
                ON comment_likes.user_id = users.id
            WHERE comment_likes.comment_id IN (?)
            ORDER BY comment_likes.created_at DESC`, [keys], null, bool);
        const Likers = likers.reduce((acc, { comment_id, ...liker }) => {
            if (!liker || !comment_id) return acc;
            if (!acc[comment_id]) {
                acc[comment_id] = [];
            }
            acc[comment_id].push(liker)
            return acc
        }, {})
        return keys.map(key => Likers[key] || [])
    },
    batchILikeComment: async (keys, id) => {
        if (!id) return keys.map(() => false);
        const iLike =
            await queryDB(`
        SELECT
            *
        FROM comment_likes
        WHERE comment_id IN (?) AND user_id = ?
        `, [keys, id], null, bool)
        const ILike = iLike.reduce((acc, { comment_id }) => {
            acc[comment_id] = true;
            return acc
        }, {})
        return keys.map(key => !!ILike[key])
    }
}