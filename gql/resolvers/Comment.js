module.exports = {
    commenter: async ({ user_id }, _, { Loaders }) => await Loaders.users.byId.load(user_id),
    post: async ({ post_id }, _, { Loaders }) => await Loaders.posts.byId.load(post_id),
    numLikes: async ({ id }, _, { Loaders }) => await Loaders.comments.numLikes.load(id),
    numReplies: async ({ id }, _, { Loaders }) => await Loaders.comments.numReplies.load(id),
    replies: async ({ id }, _, { Loaders }) => await Loaders.comments.replies.load(id),
    likers: async ({ id }, _, { Loaders }) => await Loaders.comments.likers.load(id),
    tags: async ({ id }, _, { Loaders }) => await Loaders.tags.byCommentId.load(id),
    iLike: async ({ id }, _, { Loaders }) => await Loaders.comments.iLike.load(id)
}