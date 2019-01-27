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
const batchUserLikes = async keys => {
    const likedPosts =
        await queryDB(`
        SELECT 
            posts.*, likes.user_id as liker_id
        FROM posts
        INNER JOIN likes
            ON posts.id = likes.post_id
        WHERE likes.user_id IN (?) 
        `, [keys], null, bool);
    const LikedPosts = likedPosts.reduce((acc, { liker_id, ...post }) => {
        if (!liker_id) return acc
        if (!acc[liker_id]) {
            acc[liker_id] = [];
        }
        acc[liker_id].push(post)
        return acc
    }, {})
    return keys.map(key => LikedPosts[key] || [])
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
//     const { affectedRows } = await queryDB(`INSERT IGNORE INTO tags (tag_name) VALUES ?`, [[keys]], null, bool)
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
const batchUserTags = async keys => {
    const tags =
        await queryDB(`
        SELECT 
            tag_name, tags.id as id, user_id, tags.created_at as created_at
        FROM user_tags
        INNER JOIN tags
            ON tags.id = user_tags.tag_id
        WHERE user_tags.user_id IN (?)
        `, [keys], null, bool)
    const Tags = tags.reduce((acc, { user_id, id, tag_name, created_at }) => {
        if (!user_id) return acc;
        if (!acc[user_id]) {
            acc[user_id] = []
        }
        acc[user_id].push({ id, tag_name, created_at })
        return acc
    }, {})
    return keys.map(key => Tags[key] || [])
}
const batchTagUsers = async keys => {
    const users =
        await queryDB(`
        SELECT 
            tag_id, users.id as id, username, email, users.created_at as created_at
        FROM users
        INNER JOIN user_tags
            ON user_tags.user_id=users.id
        WHERE user_tags.tag_id IN (?)
        `, [keys], null, bool)
    const tagUsers = users.reduce((acc, { tag_id, ...user }) => {
        if (!user) return acc;
        if (!acc[tag_id]) {
            acc[tag_id] = []
        }
        acc[tag_id].push(user)
        return acc
    }, {})
    return keys.map(key => tagUsers[key] || [])
}
const batchTagPosts = async keys => {
    const posts =
        await queryDB(`
        SELECT 
            tag_id, posts.id as id, title, posts.user_id, posts.created_at, last_updated, title, caption, post_content
        FROM posts
        INNER JOIN post_tags
            ON post_tags.post_id=posts.id
        WHERE post_tags.tag_id IN (?)
        `, [keys], null, bool)
    const tagPosts = posts.reduce((acc, { tag_id, ...post }) => {
        if (!post) return acc;
        if (!acc[tag_id]) {
            acc[tag_id] = []
        }
        acc[tag_id].push(post)
        return acc
    }, {})
    return keys.map(key => tagPosts[key] || [])
}
const batchTagComments = async keys => {
    const comments =
        await queryDB(`
        SELECT 
            tag_id, comments.id, comments.user_id, comments.post_id, comment_text, comments.created_at, comments.last_updated
        FROM comments
        INNER JOIN comment_tags
            ON comment_tags.comment_id=comments.id
        WHERE comment_tags.tag_id IN (?)
        `, [keys], null, bool)
    const tagComments = comments.reduce((acc, { tag_id, ...comment }) => {
        if (!comment) return acc;
        if (!acc[tag_id]) {
            acc[tag_id] = []
        }
        acc[tag_id].push(comment)
        return acc
    }, {})
    return keys.map(key => tagComments[key] || [])
}
const batchFollowers = async keys => {
    const followers =
        await queryDB(`
        SELECT 
            username, id, followee_id, follows.created_at as followed_at
        FROM follows
        INNER JOIN users
            ON follower_id = users.id
        WHERE follows.followee_id IN (?) AND follows.follower_id != follows.followee_id`, [keys], null, bool);
    const Followers = followers.reduce((acc, { followee_id, username, id, followed_at }) => {
        if (!followee_id) return acc;
        if (!acc[followee_id]) {
            acc[followee_id] = [];
        }
        acc[followee_id].push({ username, id, followed_at })
        return acc
    }, {})
    return keys.map(key => Followers[key] || [])
}
const batchFollowing = async keys => {
    const following =
        await queryDB(`
        SELECT 
            username, id, follower_id, follows.created_at as followed_at
        FROM follows
        INNER JOIN users
            ON followee_id = users.id
        WHERE follows.follower_id IN (?) AND follows.follower_id != follows.followee_id
        `, [keys], null, bool);
    const Following = following.reduce((acc, { follower_id, username, id, followed_at }) => {
        if (!follower_id) return acc;
        if (!acc[follower_id]) {
            acc[follower_id] = [];
        }
        acc[follower_id].push({ username, id, followed_at })
        return acc
    }, {})
    return keys.map(key => Following[key] || [])

}
const batchNumFollowers = async keys => {
    const numFollowers =
        await queryDB(`
        SELECT 
            followee_id, COUNT(follows.created_at) as num_followers
        FROM follows
        WHERE followee_id != follower_id AND followee_id IN (?)
        GROUP BY followee_id
        `, [keys], null, bool)
    const NumFollowers = numFollowers.reduce((acc, { followee_id, num_followers }) => {
        if (!followee_id) return acc;
        acc[followee_id] = num_followers;
        return acc;
    }, {})
    return keys.map(key => typeof NumFollowers[key] === 'number' ? NumFollowers[key] : 0)
}
const batchNumFollowing = async keys => {
    const numFollowing =
        await queryDB(`
        SELECT 
            follower_id, COUNT(follows.created_at) as num_following
        FROM follows
        WHERE followee_id != follower_id AND follower_id IN (?)
        GROUP BY follower_id
        `, [keys], null, bool)
    const NumFollowing = numFollowing.reduce((acc, { follower_id, num_following }) => {
        if (!follower_id) return acc;
        acc[follower_id] = num_following;
        return acc;
    }, {})
    return keys.map(key => typeof NumFollowing[key] === 'number' ? NumFollowing[key] : 0)
}
const bulkInsertTags = async tags => {
    await queryDB(`INSERT IGNORE INTO tags (tag_name) VALUES ?`, [tags]).catch(e => { throw Errors.database })
    const allTags = await queryDB(`SELECT * FROM tags WHERE tag_name IN (?)`, [tags]).catch(e => { throw Errors.database })
    return allTags.reduce((acc, { tag_name, id }) => {
        acc[tag_name] = id
        return acc
    }, {})
}

const applyLoaders = (context) => {
    //remove bool when done testing
    context.Loaders = {
        users: {
            byId: new DataLoader(keys => batchUsers(keys)),
            followers: new DataLoader(keys => batchFollowers(keys)),
            following: new DataLoader(keys => batchFollowing(keys)),
            numFollowers: new DataLoader(keys => batchNumFollowers(keys)),
            numFollowing: new DataLoader(keys => batchNumFollowing(keys)),
            likedPosts: new DataLoader(keys => batchUserLikes(keys)),
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
            byPostId: new DataLoader(keys => batchPostTags(keys)),
            byCommentId: new DataLoader(keys => batchCommentTags(keys)),
            byUserId: new DataLoader(keys => batchUserTags(keys)),
            users: new DataLoader(keys => batchTagUsers(keys)),
            posts: new DataLoader(keys => batchTagPosts(keys)),
            comments: new DataLoader(keys => batchTagComments(keys))
        }
    }
    context.batchInserts = {
        tags: {
            postTags: async (tags, post_id) => {
                tags = tags.map((tag) => [tag.toLowerCase()])
                const Tags = await bulkInsertTags(tags)
                const postTags = tags.map(name => [post_id, Tags[name]])
                return await queryDB(`INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES ?`, [postTags]).catch(e => 0)
            },
            commentTags: async (tags, comment_id) => {
                tags = tags.map((tag) => [tag.toLowerCase()])
                const Tags = await bulkInsertTags(tags)
                const commentTags = tags.map(name => [comment_id, Tags[name]])
                return await queryDB(`INSERT IGNORE INTO comment_tags (comment_id, tag_id) VALUES ?`, [commentTags]).catch(e => 0)
            },
            userTags: async (tags, user_id) => {
                tags = tags.map((tag) => [tag.toLowerCase()])
                const Tags = await bulkInsertTags(tags)
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