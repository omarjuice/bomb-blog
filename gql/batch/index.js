const Batcher = require('batch-boy')
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
            byId: new Batcher(keys => users.batchUsers(keys)),
            followers: new Batcher(keys => users.batchFollowers(keys)),
            following: new Batcher(keys => users.batchFollowing(keys)),
            numFollowers: new Batcher(keys => users.batchNumFollowers(keys)),
            numFollowing: new Batcher(keys => users.batchNumFollowing(keys)),
            imFollowing: new Batcher(keys => users.batchImFollowing(keys, id)),
            followingMe: new Batcher(keys => users.batchFollowingMe(keys, id)),
            likedPosts: new Batcher(keys => users.batchUserLikes(keys)),
        },
        posts: {
            byId: new Batcher(keys => posts.batchPosts(keys)),
            byUserId: new Batcher(keys => posts.batchPostsByUserId(keys)),
            numLikes: new Batcher(keys => posts.batchPostLikes(keys)),
            comments: new Batcher(keys => posts.batchComments(keys)),
            numComments: new Batcher(keys => posts.batchNumComments(keys)),
            likers: new Batcher(keys => posts.batchPostLikers(keys)),
            iLike: new Batcher(keys => posts.batchILikePost(keys, id))
        },
        profiles: {
            byId: new Batcher(keys => users.batchProfiles(keys))
        },
        comments: {
            byId: new Batcher(keys => comments.batchCommentsById(keys)),
            numLikes: new Batcher(keys => comments.batchCommentLikes(keys)),
            replies: new Batcher(keys => comments.batchCommentReplies(keys)),
            numReplies: new Batcher(keys => comments.batchNumReplies(keys)),
            likers: new Batcher(keys => comments.batchCommentLikers(keys)),
            iLike: new Batcher(keys => comments.batchILikeComment(keys, id))
        },
        tags: {
            byId: new Batcher(keys => tags.batchTags(keys)),
            byPostId: new Batcher(keys => tags.batchPostTags(keys)),
            byCommentId: new Batcher(keys => tags.batchCommentTags(keys)),
            byUserId: new Batcher(keys => tags.batchUserTags(keys)),
            users: new Batcher(keys => tags.batchTagUsers(keys)),
            posts: new Batcher(keys => tags.batchTagPosts(keys)),
            comments: new Batcher(keys => tags.batchTagComments(keys)),
            popularity: new Batcher(keys => tags.batchTagPopularity(keys))
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