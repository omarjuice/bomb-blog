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
    const commentReplies = await queryDB(`SELECT * FROM replies WHERE comment_id IN (?)`, [keys], null, bool)
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
const batchPostLikers = async keys => {
    const likers =
        await queryDB(`
            SELECT 
                users.id AS user_id, post_id, username, likes.created_at AS liked_at
            FROM users
            INNER JOIN likes
                ON likes.user_id = users.id
            WHERE likes.post_id IN (?)`, [keys], null, bool);
    const Likers = likers.reduce((acc, { post_id, ...liker }) => {
        if (!liker || !post_id) return acc;
        if (!acc[post_id]) {
            acc[post_id] = [];
        }
        acc[post_id].push(liker)
        return acc
    }, {})
    return keys.map(key => Likers[key] || [])
}
const batchCommentLikers = async keys => {
    const likers =
        await queryDB(`
            SELECT 
                users.id AS user_id, comment_id, username, comment_likes.created_at AS liked_at
            FROM users
            INNER JOIN comment_likes
                ON comment_likes.user_id = users.id
            WHERE comment_likes.comment_id IN (?)`, [keys], null, bool);
    const Likers = likers.reduce((acc, { comment_id, ...liker }) => {
        if (!liker || !comment_id) return acc;
        if (!acc[comment_id]) {
            acc[comment_id] = [];
        }
        acc[comment_id].push(liker)
        return acc
    }, {})
    return keys.map(key => Likers[key] || [])
}
const batchTags = async keys => {
    const tags = await queryDB(`SELECT * FROM tags WHERE id IN (?)`, [keys], null, bool)
    const Tags = tags.reduce((acc, tag) => {
        if (!tag) return acc;
        acc[tag.id] = tag
        return acc
    }, {})
    return keys.map(key => Tags[key] || {})
}
// const insertBatchOfTags = async keys => {
//     const { affectedRows } = await queryDB(`INSERT IGNORE INTO tags (tag_name) VALUES ?`, [[keys]], null, true)
//     if {affe}
//     return keys.map(key => );
// }
const batchPostTags = async keys => {
    const tags =
        await queryDB(`
            SELECT 
                tag_name, tags.id as id, post_id, tags.created_at as created_at
            FROM post_tags
            INNER JOIN tags
                ON tags.id = post_tags.tag_id
            WHERE post_tags.post_id IN (?)`, [keys], null, bool)

    const Tags = tags.reduce((acc, { post_id, id, tag_name, created_at }) => {
        if (!post_id) return acc;
        if (!acc[post_id]) {
            acc[post_id] = [];
        }
        acc[post_id].push({ id, tag_name, created_at })
        return acc;
    }, {})

    return keys.map(key => Tags[key] || [])
}
const batchCommentTags = async keys => {
    const tags =
        await queryDB(`
        SELECT 
            tag_name, tags.id as id, comment_id, tags.created_at as created_at
        FROM comment_tags
        INNER JOIN tags
            ON tags.id = comment_tags.tag_id
        WHERE comment_tags.comment_id IN (?)
        `, [keys], null, bool)
    const Tags = tags.reduce((acc, { comment_id, id, tag_name, created_at }) => {
        if (!comment_id) return acc;
        if (!acc[comment_id]) {
            acc[comment_id] = []
        }
        acc[comment_id].push({ id, tag_name, created_at })
        return acc;
    }, {})
    return keys.map(key => Tags[key] || [])
}
const applyLoaders = (context) => {
    //remove bool when done testing
    context.Loaders = {
        users: {
            byId: new DataLoader(keys => batchUsers(keys))
        },
        posts: {
            byId: new DataLoader(keys => batchPosts(keys)),
            byUserId: new DataLoader(keys => batchPosts_user_id(keys)),
            numLikes: new DataLoader(keys => batchPostLikes(keys)),
            comments: new DataLoader(keys => batchComments(keys)),
            likers: new DataLoader(keys => batchPostLikers(keys))
        },
        profiles: {
            byId: new DataLoader(keys => batchProfiles(keys))
        },
        comments: {
            numLikes: new DataLoader(keys => batchCommentLikes(keys)),
            replies: new DataLoader(keys => batchCommentReplies(keys)),
            likers: new DataLoader(keys => batchCommentLikers(keys))
        },
        tags: {
            byId: new DataLoader(keys => batchTags(keys)),
            // insert: new DataLoader(keys => insertBatchOfTags(keys)),
            byPostId: new DataLoader(keys => batchPostTags(keys)),
            byCommentId: new DataLoader(keys => batchCommentTags(keys))
        }


    }
    context.batchInserts = {
        tags: {
            postTags: async (tags, post_id) => {
                tags = tags.map((tag) => [tag.toLowerCase()])
                await queryDB(`INSERT IGNORE INTO tags (tag_name) VALUES ?`, [tags]).catch(e => { throw Errors.database })
                const allTags = await queryDB(`SELECT * FROM tags WHERE tag_name IN (?)`, [tags]).catch(e => { throw Errors.database })
                const Tags = allTags.reduce((acc, { tag_name, id }) => {
                    acc[tag_name] = id
                    return acc
                }, {})
                const postTags = tags.map(name => [post_id, Tags[name]])
                await queryDB(`INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES ?`, [postTags]).catch(e => { throw Errors.database })
            }
        }
    }
    return context
}

module.exports = applyLoaders