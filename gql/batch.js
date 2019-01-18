const DataLoader = require('dataloader')
const { queryDB } = require('../db/connect')

const batchUsers = async keys => {
    const users = await queryDB(`SELECT id, username, created_at, email FROM users WHERE id IN (?)`, [keys])

    const Users = users.reduce((acc, user) => {
        if (!user) return acc;
        acc[user.id] = user
        return acc
    }, {})
    return keys.map(key => Users[key] || {})
}
const batchPosts = async keys => {
    const posts = await queryDB(`SELECT * FROM posts WHERE id IN (?)`, [keys])
    const Posts = posts.reduce((acc, post) => {
        if (!post) return acc;
        acc[post.id] = post
        return acc
    }, {})
    return keys.map(key => Posts[key] || {})
}
const batchProfiles = async (keys) => {
    const profiles = await queryDB(`SELECT * FROM profiles WHERE user_id IN (?)
    `, [keys])
    const Profiles = profiles.reduce((acc, profile) => {
        if (!profile) return acc;
        acc[profile.user_id] = profile
        return acc
    }, {})
    return keys.map(key => Profiles[key] || {})
}
const batchPosts_user_id = async keys => {
    const posts = await queryDB(`SELECT * FROM posts WHERE user_id IN (?)`, [keys])
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

const applyLoaders = (context) => {
    context.Loaders = {
        user: {
            byId: new DataLoader(keys => batchUsers(keys))
        },
        post: {
            byId: new DataLoader(keys => batchPosts(keys)),
            byUserId: new DataLoader(keys => batchPosts_user_id(keys))
        },
        profile: {
            byId: new DataLoader(keys => batchProfiles(keys))
        }

    }
    return context
}

module.exports = applyLoaders