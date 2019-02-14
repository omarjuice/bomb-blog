const DataLoader = require('dataloader')
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
    let cursor, limit;
    try {
        cursor = context.req.body.variables.input.cursor
    } catch (e) {
        cursor = null
    }
    try {
        limit = context.req.body.variables.input.limit
    } catch (e) {
        limit = null
    }

    context.Loaders = {
        users: {
            byId: new DataLoader(keys => users.batchUsers(keys)),
            followers: new DataLoader(keys => users.batchFollowers(keys)),
            following: new DataLoader(keys => users.batchFollowing(keys)),
            numFollowers: new DataLoader(keys => users.batchNumFollowers(keys)),
            numFollowing: new DataLoader(keys => users.batchNumFollowing(keys)),
            imFollowing: new DataLoader(keys => users.batchImFollowing(keys, id)),
            followingMe: new DataLoader(keys => users.batchFollowingMe(keys, id)),
            likedPosts: new DataLoader(keys => users.batchUserLikes(keys)),
        },
        posts: {
            byId: new DataLoader(keys => posts.batchPosts(keys)),
            byUserId: new DataLoader(keys => posts.batchPostsByUserId(keys)),
            numLikes: new DataLoader(keys => posts.batchPostLikes(keys)),
            comments: new DataLoader(keys => posts.batchComments(keys)),
            numComments: new DataLoader(keys => posts.batchNumComments(keys)),
            likers: new DataLoader(keys => posts.batchPostLikers(keys)),
            iLike: new DataLoader(keys => posts.batchILikePost(keys, id))
        },
        profiles: {
            byId: new DataLoader(keys => users.batchProfiles(keys))
        },
        comments: {
            byId: new DataLoader(keys => comments.batchCommentsById(keys)),
            numLikes: new DataLoader(keys => comments.batchCommentLikes(keys)),
            replies: new DataLoader(keys => comments.batchCommentReplies(keys)),
            numReplies: new DataLoader(keys => comments.batchNumReplies(keys)),
            likers: new DataLoader(keys => comments.batchCommentLikers(keys)),
            iLike: new DataLoader(keys => comments.batchILikeComment(keys, id))
        },
        tags: {
            byId: new DataLoader(keys => tags.batchTags(keys)),
            byPostId: new DataLoader(keys => tags.batchPostTags(keys)),
            byCommentId: new DataLoader(keys => tags.batchCommentTags(keys)),
            byUserId: new DataLoader(keys => tags.batchUserTags(keys)),
            users: new DataLoader(keys => tags.batchTagUsers(keys)),
            posts: new DataLoader(keys => tags.batchTagPosts(keys)),
            comments: new DataLoader(keys => tags.batchTagComments(keys)),
            popularity: new DataLoader(keys => tags.batchTagPopularity(keys))
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