const DataLoader = require('dataloader')
const { queryDB } = require('../db/connect')
const bool = false
const batchUsers = async keys => {
    const users = await queryDB(`SELECT id, username, created_at, email FROM users WHERE id IN (?)`, [keys], null, bool)

    const Users = users.reduce((acc, user) => {
        if (!user) return acc;
        acc[user.id] = user
        return acc
    }, {})
    return keys.map(key => Users[key] || {})
}
const batchPosts = async keys => {
    const posts = await queryDB(`SELECT * FROM posts WHERE id IN (?)`, [keys], null, bool)
    const Posts = posts.reduce((acc, post) => {
        if (!post) return acc;
        acc[post.id] = post
        return acc
    }, {})
    return keys.map(key => Posts[key] ? Posts[key] : null)
}
const batchProfiles = async (keys) => {
    const profiles = await queryDB(`SELECT * FROM profiles WHERE user_id IN (?)
    `, [keys], null, bool)
    const Profiles = profiles.reduce((acc, profile) => {
        if (!profile) return acc;
        acc[profile.user_id] = profile
        return acc
    }, {})
    return keys.map(key => Profiles[key] || {})
}
const batchPosts_user_id = async keys => {
    const posts = await queryDB(`SELECT * FROM posts WHERE user_id IN (?)`, [keys], null, bool)
    const userPosts = posts.reduce((acc, post) => {
        if (!post) return acc;
        if (!acc[post.user_id]) {
            acc[post.user_id] = []
        }
        acc[post.user_id].push(post)
        return acc
    }, {})
    return keys.map(key => userPosts[key] || [])
}
const batchPostLikes = async keys => {
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
}
const batchComments = async keys => {
    const comments =
        await queryDB(`
        SELECT 
            * 
        FROM comments
        WHERE post_id IN (?)
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
}
const batchCommentLikes = async keys => {
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
}
const batchCommentReplies = async keys => {
    const commentReplies = await queryDB(`SELECT * FROM replies WHERE comment_id IN (?)`, [keys], null, true)
    const CommentReplies = commentReplies.reduce((acc, reply) => {
        if (!reply) return acc;
        if (!acc[reply.comment_id]) {
            acc[reply.comment_id] = []
        }
        acc[reply.comment_id].push(reply)
        return acc
    }, {})
    return keys.map(key => CommentReplies[key] || [])
}
const applyLoaders = (context) => {
    //remove bool when done testing
    context.Loaders = {
        user: {
            byId: new DataLoader(keys => batchUsers(keys))
        },
        post: {
            byId: new DataLoader(keys => batchPosts(keys)),
            byUserId: new DataLoader(keys => batchPosts_user_id(keys)),
            numLikes: new DataLoader(keys => batchPostLikes(keys)),
            comments: new DataLoader(keys => batchComments(keys))
        },
        profile: {
            byId: new DataLoader(keys => batchProfiles(keys))
        },
        comment: {
            numLikes: new DataLoader(keys => batchCommentLikes(keys)),
            replies: new DataLoader(keys => batchCommentReplies(keys))
        },


    }
    return context
}

module.exports = applyLoaders