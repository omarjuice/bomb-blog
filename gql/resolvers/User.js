const Errors = require('../errors')
const authenticate = require('./authenticate')
module.exports = {
    profile: async ({ id }, _, { Loaders }) => {
        const profile = await Loaders.profiles.byId.load(id)
        if (profile && profile.user_id) return profile
        throw Errors.profile.notFound
    },
    posts: async ({ id }, _, { Loaders }) => await Loaders.posts.byUserId.load(id),
    followers: async ({ id }, _, { Loaders }) => await Loaders.users.followers.load(id),
    following: async ({ id }, _, { Loaders }) => await Loaders.users.following.load(id),
    numFollowers: async ({ id }, _, { Loaders }) => await Loaders.users.numFollowers.load(id),
    numFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.numFollowing.load(id),
    imFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.imFollowing.load(id),
    followingMe: async ({ id }, _, { Loaders }) => await Loaders.users.followingMe.load(id),
    tags: async ({ id }, _, { Loaders }) => await Loaders.tags.byUserId.load(id),
    likedPosts: async ({ id }, _, { Loaders }) => await Loaders.users.likedPosts.load(id),
    isMe: async ({ id }, _, { req }) => id === authenticate(req.session)
}