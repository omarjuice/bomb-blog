const DataLoader = require('dataloader')
const { queryDB } = require('../../db/connect')
const users = require('./dbqueries/users')
const posts = require('./dbqueries/posts')
const comments = require('./dbqueries/comments')
const tags = require('./dbqueries/tags')
const applyLoaders = (context) => {
    let id;
    try {
        id = context.req.session.user.id
    } catch (e) {
        id = null
    }
    context.cursors = {
        users: {
            followers: null,
            following: null,
            likesPosts: null
        },
        posts: {
            byUserId: null,
            comments: null,
            likers: null
        },
        comments: {
            replies: null,
            likers: null
        }
    }
    context.cursors.setCursor = function (root, field, cursor = 0) {
        this[root][field] = cursor
    }
    context.setLoader = function () {

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
        tags: {
            postTags: async (tags, post_id) => {
                tags = tags.map((tag) => [tag.toLowerCase()])
                const Tags = await tags.bulkInsertTags(tags)
                const postTags = tags.map(name => [post_id, Tags[name]])
                return await queryDB(`INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES ?`, [postTags]).catch(e => 0)
            },
            commentTags: async (tags, comment_id) => {
                tags = tags.map((tag) => [tag.toLowerCase()])
                const Tags = await tags.bulkInsertTags(tags)
                const commentTags = tags.map(name => [comment_id, Tags[name]])
                return await queryDB(`INSERT IGNORE INTO comment_tags (comment_id, tag_id) VALUES ?`, [commentTags]).catch(e => 0)
            },
            userTags: async (tags, user_id) => {
                tags = tags.map((tag) => [tag.toLowerCase()])
                const Tags = await tags.bulkInsertTags(tags)
                const userTags = tags.map(name => [user_id, Tags[name]])
                return await queryDB(`INSERT IGNORE INTO user_tags (user_id, tag_id) VALUES ?`, [userTags]).catch(e => 0)
            }
        }
    }
    context.batchDeletes = {
        tags: {
            postTags: async (tags, post_id) => {
                tags = tags.map(tag => [tag.toLowerCase()])
                return await queryDB(`
                    DELETE IGNORE FROM post_tags WHERE post_id= ? AND tag_id IN (
                        SELECT id FROM tags WHERE tag_name IN (?)
                    )`, [post_id, tags]).catch(e => 0)
            },
            commentTags: async (tags, comment_id) => {
                tags = tags.map(tag => [tag.toLowerCase()])
                return await queryDB(`
                    DELETE IGNORE FROM comment_tags WHERE comment_id= ? AND tag_id IN (
                        SELECT id FROM tags WHERE tag_name IN (?)
                    )`, [comment_id, tags]).catch(e => 0)
            },
            userTags: async (tags, user_id) => {
                tags = tags.map(tag => [tag.toLowerCase()])
                return await queryDB(`
                    DELETE IGNORE FROM user_tags WHERE user_id= ? AND tag_id IN (
                        SELECT id FROM tags WHERE tag_name IN (?)
                    )`, [user_id, tags]).catch(e => 0)
            }
        }
    }
    return context
}

module.exports = applyLoaders