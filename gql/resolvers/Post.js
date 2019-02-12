module.exports = {
    author: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id),
    numLikes: async ({ id }, _, { Loaders }) => await Loaders.posts.numLikes.load(id),
    comments: async ({ id }, _, { Loaders }) => await Loaders.posts.comments.load(id),
    numComments: async ({ id }, _, { Loaders }) => await Loaders.posts.numComments.load(id),
    likers: async ({ id }, _, { Loaders }) => await Loaders.posts.likers.load(id),
    tags: async ({ id }, _, { Loaders }) => await Loaders.tags.byPostId.load(id),
    iLike: async ({ id }, _, { Loaders }) => await Loaders.posts.iLike.load(id)
}