const { authenticate } = require('./utils')
const { queryDB } = require('../../db/connect')
module.exports = {
    newPosts: async ({ lastVisited }, _, { req }) => {
        if (!lastVisited) return []
        const sessionUser = authenticate(req.session)
        const query = `
        SELECT 
            posts.*
        FROM posts 
        WHERE UNIX_TIMESTAMP(posts.created_at) > ? AND posts.user_id IN (
            SELECT 
        followee_id
        FROM follows 
        WHERE follower_id = ? AND followee_id != ?
        GROUP BY followee_id
        )
        ORDER BY created_at DESC`
        return await queryDB(query, [lastVisited, sessionUser, sessionUser], null, true)
    },
    newComments: async ({ lastVisited }, _, { req }) => {
        if (!lastVisited) return []
        const sessionUser = authenticate(req.session)
        const query = `
        SELECT 
            comments.*
        FROM comments
        INNER JOIN posts
            on comments.post_id = posts.id
        WHERE posts.user_id = ? AND UNIX_TIMESTAMP(comments.created_at) > ?
        ORDER BY comments.created_at DESC 
        `
        return await queryDB(query, [sessionUser, lastVisited], null, true)
    },
    newLikes: async ({ lastVisited }, _, { req, Loaders }) => {
        if (!lastVisited) return []
        const sessionUser = authenticate(req.session)
        const query = `
        SELECT 
            posts.*, likes.created_at AS liked_at, likes.user_id AS liker_id
        FROM likes
        INNER JOIN posts
            ON posts.id = likes.post_id
        WHERE posts.user_id = ? AND UNIX_TIMESTAMP(likes.created_at) > ?
        ORDER BY liked_at DESC
        `
        const likes = await queryDB(query, [sessionUser, lastVisited], null, true)

        return await likes.map(async ({ liked_at, id, user_id, title, caption, created_at, last_updated, post_content, image, liker_id }) => {
            return {
                post: {
                    id, user_id, title, caption, created_at, last_updated, post_content, image
                },
                user: await Loaders.users.byId.load(liker_id),
                liked_at
            }
        })
    },
    newCommentLikes: async ({ lastVisited }, _, { req, Loaders }) => {
        if (!lastVisited) return []
        const sessionUser = authenticate(req.session)
        const query = `
        SELECT 
            comments.*, comment_likes.created_at AS liked_at, comment_likes.user_id AS liker_id
        FROM comment_likes
        INNER JOIN comments
            ON comments.id=comment_likes.comment_id
        WHERE comments.user_id=? AND UNIX_TIMESTAMP(comment_likes.created_at) > ?
        ORDER BY comment_likes.created_at DESC
        `
        const likes = await queryDB(query, [sessionUser, lastVisited], null, true)
        return await likes.map(async ({ liked_at, id, user_id, comment_text, created_at, post_id, last_updated, liker_id }) => {
            return {
                comment: {
                    id, user_id, comment_text, created_at, post_id, last_updated
                },
                user: await Loaders.users.byId.load(liker_id),
                liked_at
            }
        })
    },
    newReplies: async ({ lastVisited }, _, { req }) => {
        if (!lastVisited) return []
        const sessionUser = authenticate(req.session)
        const query = `
        SELECT
            replies.*
        FROM replies
        INNER JOIN comments 
            ON replies.comment_id = comments.id
        WHERE comments.user_id = ? AND UNIX_TIMESTAMP(replies.created_at) > ?
        ORDER BY replies.created_at DESC
        `
        return await queryDB(query, [sessionUser, lastVisited], null, true)
    },
    newFollowers: async ({ lastVisited }, _, { req }) => {
        if (!lastVisited) return []
        const sessionUser = authenticate(req.session)
        const query = `
        SELECT 
           id, username, email, users.created_at, follows.created_at AS followed_at
        FROM follows
        INNER JOIN users
            ON follows.follower_id = users.id
        WHERE follows.followee_id = ? AND UNIX_TIMESTAMP(follows.created_at) > ?
        ORDER BY followed_at DESC
        `
        const followers = await queryDB(query, [sessionUser, lastVisited], null, true)

        return followers.map(({ followed_at, ...user }) => {
            return { user, followed_at }
        })
    }

}