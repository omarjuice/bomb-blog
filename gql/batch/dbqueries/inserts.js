const { queryDB } = require('../../../db/connect')
const bulkInsertTags = async tags => {
    await queryDB(`INSERT IGNORE INTO tags (tag_name) VALUES ?`, [tags]).catch(e => { throw Errors.database })
    const allTags = await queryDB(`SELECT * FROM tags WHERE tag_name IN (?)`, [tags]).catch(e => { throw Errors.database })
    return allTags.reduce((acc, { tag_name, id }) => {
        acc[tag_name] = id
        return acc
    }, {})
}
module.exports = {
    postTags: async (tags, post_id) => {
        tags = tags.map((tag) => [tag.toLowerCase()])
        const Tags = await bulkInsertTags(tags)
        const postTags = tags.map(name => [post_id, Tags[name]])
        return await queryDB(`INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES ?`, [postTags]).catch(e => 0)
    },
    commentTags: async (tags, comment_id) => {
        tags = tags.map((tag) => [tag.toLowerCase()])
        const Tags = await bulkInsertTags(tags)
        const commentTags = tags.map(name => [comment_id, Tags[name]])
        return await queryDB(`INSERT IGNORE INTO comment_tags (comment_id, tag_id) VALUES ?`, [commentTags]).catch(e => 0)
    },
    userTags: async (tags, user_id) => {
        tags = tags.map((tag) => [tag.toLowerCase()])
        const Tags = await bulkInsertTags(tags)
        const userTags = tags.map(name => [user_id, Tags[name]])
        return await queryDB(`INSERT IGNORE INTO user_tags (user_id, tag_id) VALUES ?`, [userTags]).catch(e => 0)
    }
}