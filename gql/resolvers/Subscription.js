const { withFilter } = require('apollo-server-express')
const { pubsub } = require('./utils')
const { queryDB } = require('../../db/connect')
module.exports = {
    newPost: {
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_POST'),
            async ({ user_id }, { id }, { Loaders }) => {
                const authorFollowers = await Loaders.users.followers.load(user_id)
                return authorFollowers.includes(id)
            }
        )
    },
    newLike: {
        resolve: async ({ post_id, user_id }, _, { Loaders }) => {
            const user = await Loaders.users.byId.load(user_id)
            const post = await Loaders.posts.byId.load(post_id)
            return { user, post, liked_at: String(Date.now()) }
        },
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_LIKE'),
            async ({ post_id, user_id }, { id }, { Loaders }) => {
                const user = await Loaders.users.byId.load(user_id)
                const post = await Loaders.posts.byId.load(post_id)
                return post.user_id === id && user.id !== id
            }
        )
    },
    newComment: {
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_COMMENT'),
            async ({ user_id, post_id }, { id }) => {
                const post = await Loaders.posts.byId.load(post_id)
                return post.user_id === id && user_id !== id
            }
        )
    },
    newCommentLike: {
        resolve: async ({ user_id, comment_id }, _, { Loaders }) => {
            const user = await Loaders.users.byId.load(user_id)
            const comment = await Loaders.comments.byId.load(comment_id)
            return { user, comment, liked_at: String(Date.now()) }
        },
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_COMMENT_LIKE'),
            async ({ user_id, comment_id }, { id }, { Loaders }) => {
                const user = await Loaders.users.byId.load(user_id)
                const comment = await Loaders.comments.byId.load(comment_id)
                return comment.user_id === id && user.id !== id
            }
        )
    },
    newFollower: {
        resolve: async ({ user_id, followed_id }, _, { Loaders }) => {
            const user = await Loaders.users.byId.load(user_id)
            return { user, followed_at: String(Date.now()), followed_id }
        },
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_FOLLOWER'),
            ({ followed_id }, { id }) => id === followed_id
        )
    },
    newReply: {
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_REPLY'),
            async ({ comment_id, user_id }, { id }, { Loaders }) => {
                const comment = await Loaders.comments.byId.load(comment_id)
                return comment.user_id === id && user_id !== id
            }
        )
    }

}