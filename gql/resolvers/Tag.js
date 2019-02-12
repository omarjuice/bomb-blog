module.exports = {
    users: async ({ id }, _, { Loaders }) => await Loaders.tags.users.load(id),
    posts: async ({ id }, _, { Loaders }) => await Loaders.tags.posts.load(id),
    comments: async ({ id }, _, { Loaders }) => await Loaders.tags.comments.load(id),
    popularity: async ({ id, popularity }, _, { Loaders }) => popularity || await Loaders.tags.popularity.load(id)
}