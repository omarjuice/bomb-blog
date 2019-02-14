const { authenticate } = require('./utils')
module.exports = {
    imFollowing: async ({ id }, _, { Loaders }) => await Loaders.users.imFollowing.load(id),
    followingMe: async ({ id }, _, { Loaders }) => await Loaders.users.followingMe.load(id),
    isMe: async ({ id }, _, { req }) => id === authenticate(req.session),
    profile: async ({ id }, _, { Loaders }) => await Loaders.profiles.byId.load(id),
}