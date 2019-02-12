module.exports = {
    user: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id)
}