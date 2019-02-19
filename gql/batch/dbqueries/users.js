const { queryDB } = require('../../../db/connect')
const bool = !['test', 'production'].includes(process.env.NODE_ENV)

module.exports = {
    batchUsers: async keys => {
        const users = await queryDB(`SELECT id, username, created_at, email, privilege FROM users WHERE id IN (?)`, [keys], null, bool)
        const Users = users.reduce((acc, user) => {
            if (!user) return acc;
            acc[user.id] = user
            return acc
        }, {})
        return keys.map(key => Users[key] || {})
    },
    batchFollowers: async keys => {
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
    },
    batchFollowing: async keys => {
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

    },
    batchNumFollowers: async keys => {
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
    },
    batchNumFollowing: async keys => {
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
    },
    batchFollowingMe: async (keys, id) => {
        if (!id) return keys.map(() => false);
        const followingMe =
            await queryDB(`
        SELECT
            *
        FROM follows
        WHERE follower_id IN (?) AND followee_id = ? AND follower_id != followee_id
        `, [keys, id], null, bool)
        const FollowingMe = followingMe.reduce((acc, { follower_id }) => {
            acc[follower_id] = true;
            return acc
        }, {})
        return keys.map(key => !!FollowingMe[key])
    },
    batchImFollowing: async (keys, id) => {
        if (!id) return keys.map(() => false);
        const imFollowing =
            await queryDB(`
        SELECT 
            *
        FROM follows
        WHERE followee_id IN (?) AND follower_id = ? AND followee_id != follower_id
        `, [keys, id], null, bool)
        const ImFollowing = imFollowing.reduce((acc, { followee_id }) => {
            acc[followee_id] = true;
            return acc
        }, {})
        return keys.map(key => !!ImFollowing[key])
    },
    batchUserLikes: async keys => {
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
    },
    batchProfiles: async keys => {
        const profiles = await queryDB(`SELECT * FROM profiles WHERE user_id IN (?)
    `, [keys], null, bool)
        const Profiles = profiles.reduce((acc, profile) => {
            if (!profile) return acc;
            acc[profile.user_id] = profile
            return acc
        }, {})
        return keys.map(key => Profiles[key] || {})
    }
}