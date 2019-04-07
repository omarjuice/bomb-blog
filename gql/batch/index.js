const { Batch } = require('batch-boy')
const users = require('./dbqueries/users')
const posts = require('./dbqueries/posts')
const comments = require('./dbqueries/comments')
const tags = require('./dbqueries/tags')
const insertTags = require('./dbqueries/inserts')
const deleteTags = require('./dbqueries/deletes')
const applyLoaders = (context) => {
    let id;
    try {
        id = context.req.session.user.id
    } catch (e) {
        id = null
    }
    context.Loaders = {
        users: {
            byId: new Batch(keys => users.batchUsers(keys)),
            followers: new Batch(keys => users.batchFollowers(keys)),
            following: new Batch(keys => users.batchFollowing(keys)),
            numFollowers: new Batch(keys => users.batchNumFollowers(keys)),
            numFollowing: new Batch(keys => users.batchNumFollowing(keys)),
            imFollowing: new Batch(keys => users.batchImFollowing(keys, id)),
            followingMe: new Batch(keys => users.batchFollowingMe(keys, id)),
            likedPosts: new Batch(keys => users.batchUserLikes(keys)),
        },
        posts: {
            byId: new Batch(keys => posts.batchPosts(keys)),
            byUserId: new Batch(keys => posts.batchPostsByUserId(keys)),
            numLikes: new Batch(keys => posts.batchPostLikes(keys)),
            comments: new Batch(keys => posts.batchComments(keys)),
            numComments: new Batch(keys => posts.batchNumComments(keys)),
            likers: new Batch(keys => posts.batchPostLikers(keys)),
            iLike: new Batch(keys => posts.batchILikePost(keys, id))
        },
        profiles: {
            byId: new Batch(keys => users.batchProfiles(keys))
        },
        comments: {
            byId: new Batch(keys => comments.batchCommentsById(keys)),
            numLikes: new Batch(keys => comments.batchCommentLikes(keys)),
            replies: new Batch(keys => comments.batchCommentReplies(keys)),
            numReplies: new Batch(keys => comments.batchNumReplies(keys)),
            likers: new Batch(keys => comments.batchCommentLikers(keys)),
            iLike: new Batch(keys => comments.batchILikeComment(keys, id))
        },
        tags: {
            byId: new Batch(keys => tags.batchTags(keys)),
            byPostId: new Batch(keys => tags.batchPostTags(keys)),
            byCommentId: new Batch(keys => tags.batchCommentTags(keys)),
            byUserId: new Batch(keys => tags.batchUserTags(keys)),
            users: new Batch(keys => tags.batchTagUsers(keys)),
            posts: new Batch(keys => tags.batchTagPosts(keys)),
            comments: new Batch(keys => tags.batchTagComments(keys)),
            popularity: new Batch(keys => tags.batchTagPopularity(keys))
        }
    }
    context.batchInserts = {
        tags: insertTags
    }
    context.batchDeletes = {
        tags: deleteTags
    }
    return context
}

module.exports = applyLoaders