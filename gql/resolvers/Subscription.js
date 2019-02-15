const { withFilter } = require('apollo-server-express')
const { pubsub } = require('./utils')
const { queryDB } = require('../../db/connect')
module.exports = {
    newPost: {
        subscribe: () => pubsub.asyncIterator('NEW_POST')
    },
    newLike: {
        resolve: async ({ post_id, user_id }, _, { Loaders }) => {
            const user = await Loaders.users.byId.load(user_id)
            const post = await Loaders.posts.byId.load(post_id)
            return { user, post, liked_at: String(Date.now()) }
        },
        subscribe: () => pubsub.asyncIterator('NEW_LIKE')
    },
    newComment: {
        subscribe: () => pubsub.asyncIterator('NEW_COMMENT')
    },
    newCommentLike: {
        resolve: async ({ user_id, comment_id }, _, { Loaders }) => {
            const user = await Loaders.users.byId.load(user_id)
            const comment = await Loaders.comments.byId.load(comment_id)
            return { user, comment, liked_at: String(Date.now()) }
        },
        subscribe: () => pubsub.asyncIterator('NEW_COMMENT_LIKE')
    },
    newFollower: {
        resolve: async ({ user_id }, _, { Loaders }) => {
            const user = await Loaders.users.byId.load(user_id)
            return { user, followed_at: String(Date.now()) }
        },
        subscribe: () => pubsub.asyncIterator('NEW_FOLLOWER')
    },
    newReply: {
        subscribe: () => pubsub.asyncIterator('NEW_REPLY')
    }

}