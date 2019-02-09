const { queryDB } = require('../../../db/connect')
module.exports = {
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