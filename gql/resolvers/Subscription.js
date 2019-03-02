const { withFilter } = require('apollo-server-express')
const { pubsub } = require('./utils')
const { queryDB } = require('../../db/connect')
module.exports = {
    newPost: {
        resolve: ({ newPost }) => newPost,
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_POST'),
            ({ followers }, { id }) => followers.includes(id)
        )
    },
    newLike: {
        resolve: payload => payload,
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_LIKE'),
            ({ post, user }, { id }, ) => post.user_id === id && user.id !== id
        )
    },
    newComment: {
        resolve: ({ newComment }) => newComment,
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_COMMENT'),
            ({ newComment, post }, { id }) => post.user_id === id && newComment.user_id !== id
        )
    },
    newCommentLike: {
        resolve: payload => payload,
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_COMMENT_LIKE'),
            ({ user, comment }, { id }, ) => comment.user_id === id && user.id !== id
        )
    },
    newFollower: {
        resolve: payload => payload,
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_FOLLOWER'),
            ({ followed_id }, { id }) => id === followed_id
        )
    },
    newReply: {
        resolve: ({ newReply }) => newReply,
        subscribe: withFilter(
            () => pubsub.asyncIterator('NEW_REPLY'),
            ({ comment, newReply }, { id }, ) => comment.user_id === id && newReply.user_id !== id
        )
    },
    featuredPost: {
        resolve: payload => payload,
        subscribe: withFilter(
            () => pubsub.asyncIterator('FEATURED_POST'),
            ({ post }, { id }) => post.user_id === id
        )
    },
    appMessage: {
        resolve: ({ user_id, ...appMessage }) => {
            return appMessage
        },
        subscribe: withFilter(
            () => pubsub.asyncIterator('APP_MESSAGE'),
            ({ user_id }, { id }) => user_id === id
        )
    }
}