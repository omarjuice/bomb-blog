module.exports = {
    replier: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id),
    comment: async ({ comment_id }, _, { Loaders }) => await Loaders.comments.byId.load(comment_id)
}