const faker = require("faker");
const { hashPW } = require('../db/crypt')
const { database } = require('../config')
const { userSchema, profileSchema, postSchema, likeSchema, commentSchema, commentLikeSchema,
    replySchema, tagSchema, postTagSchema, commentTagSchema, followSchema, userTagSchema } = require('../db/schema')
const { queryDB } = require('../db/connect')

const seedDB = {
    numUsers: 3,
    users: [[
        "a@z.com",
        "alpha",
        '1234567',
    ], [
        "b@y.com",
        "beta",
        'password',
    ], [
        "c@x.com",
        "gamma",
        'english'
    ]],
    usersHashed: [[
        "a@z.com",
        "alpha",
        '1234567',
    ], [
        "b@y.com",
        "beta",
        'password',
    ], [
        "c@x.com",
        "gamma",
        'english'
    ]],
    profiles: [[
        1,
        "I am a web developer based in City, Country",
        `${'/alpha'}${'xxxxx'.replace(/x/g, () => ((Math.random() * 36) | 0).toString(36))}`,
    ], [
        2,
        "Kool Kid",
        null
    ], [
        3,
        null,
        `${'/gamma'}${'xxxxx'.replace(/x/g, () => ((Math.random() * 36) | 0).toString(36))}`
    ]],
    // interests: [['web development'], ['coding'], ['food'], ['programming'], ['garbage'], ['smiling'], ['fitness']],
    // userInterests: [[1, 1], [1, 3], [1, 4], [2, 5], [3, 2], [3, 6], [3, 7]],
    userTags: [[1, 2], [1, 6], [2, 11], [3, 4], [3, 9]],
    follows: [[1, 1], [1, 3], [1, 2], [2, 3], [2, 2], [3, 1], [3, 3]],
    posts: [[
        1,
        "My blog",
        "All the reasons why I am cool",
        faker.date.past(),
        faker.lorem.paragraph()
    ], [
        1,
        "My other blog",
        "Even more reasons why I am cool",
        faker.date.past(),
        faker.lorem.paragraph()
    ], [
        3,
        "A blog in Latin",
        "Lorem lorem lorem!!!",
        faker.date.past(),
        faker.lorem.paragraph()
    ]],
    comments: [[
        3,
        1,
        "Nice post!",
        faker.date.past()
    ], [
        2,
        3,
        "I hate this",
        faker.date.past()
    ], [
        1,
        3,
        "We learned a lot from this blog post",
        faker.date.past()
    ]],
    likes: [[1, 1], [2, 1], [3, 2], [1, 3], [3, 1], [2, 3]],
    comment_likes: [[1, 1], [2, 1], [2, 3], [3, 3], [1, 3]],
    replies: [[
        3,
        3,
        "Thank you!!!"
    ], [
        1,
        2,
        "How very negative of you. At least be constructive."
    ], [
        2,
        2,
        "No u"
    ], [
        1,
        3,
        "You're welcome, keep it up!"
    ], [
        2,
        1,
        "Its alright"
    ], [
        3,
        1,
        "Why do you comment on everything?"
    ], [
        2,
        1,
        "lol"
    ]],
    tags: [["blog"], ["cool"], ["funny"], ["beautiful"], ["amazing"], ["dev"], ["magic"], ["saucy"], ["gr8"], ["gr9"], ["trash"]],
    post_tags: [
        [1, 1], [1, 2], [1, 4], [1, 5], [1, 6],
        [2, 3], [2, 7], [2, 10],
        [3, 4], [3, 6], [3, 8], [3, 9]
    ],
    comment_tags: [
        [1, 2], [1, 5], [1, 7],
        [2, 11], [2, 9],
        [3, 4], [3, 5], [3, 1]
    ],
    manyUsers: function (num) {
        this.numUsers = num
        return Array(num).fill("x").map(() => [faker.internet.email(), faker.internet.userName(), faker.internet.password(), faker.date.past()])
    },
    hashUsers: function (users) {
        return new Promise((resolve, reject) => {
            users.forEach((user) => {
                hashPW(user[2])
                    .then((hash) => {
                        user[2] = `${hash}`
                        resolve(users)
                    }).catch(e => reject(e))

            })
        })
    },

    manyPosts: function (num) {
        let users = this.numUsers
        return Array(num).fill("x").map((_, i) => [Math.floor(Math.random() * users) + 1, 'Title' + i + 4, faker.lorem.sentence(), faker.date.past(), faker.lorem.paragraph()])
    }
}


const resetDB = (done) => {
    const query1 = `DROP DATABASE IF EXISTS ${database}`;
    const query2 = `CREATE DATABASE IF NOT EXISTS ${database}`;
    seedDB.hashUsers(seedDB.usersHashed).then(() => {
        return queryDB(query1)
    })
        .then(() => queryDB(query2))
        .then(() => queryDB(`USE ${database}`))
        .then(() => Promise.all([queryDB(userSchema.create), queryDB(postSchema.create)]))
        .then(() => done()).catch(e => console.log(e))
}
const resetTables = (done) => {
    seedDB.numUsers = 3
    queryDB(`
        SET FOREIGN_KEY_CHECKS = 0;
        ${userSchema.drop};
        ${profileSchema.drop};
        ${followSchema.drop};
        ${postSchema.drop};
        ${likeSchema.drop};
        ${commentSchema.drop};
        ${commentLikeSchema.drop};
        ${replySchema.drop};
        ${tagSchema.drop};
        ${postTagSchema.drop};
        ${commentTagSchema.drop};
        ${userTagSchema.drop};
        SET FOREIGN_KEY_CHECKS = 1;
  `).then(() => Promise.all([
        queryDB(userSchema.create),
        queryDB(profileSchema.create),
        queryDB(followSchema.create),
        queryDB(postSchema.create),
        queryDB(likeSchema.create),
        queryDB(commentSchema.create),
        queryDB(commentLikeSchema.create),
        queryDB(replySchema.create),
        queryDB(tagSchema.create),
        queryDB(postTagSchema.create),
        queryDB(commentTagSchema.create),
        queryDB(userTagSchema.create)
    ]))
        .then(() => queryDB(`INSERT INTO users (email, username, pswd) VALUES ?`, [seedDB.usersHashed])
            .then(() => queryDB(`INSERT INTO profiles (user_id, about, photo_path) VALUES ?`, [seedDB.profiles]))
            .then(() => queryDB(`INSERT INTO follows (followee_id, follower_id) VALUES ?`, [seedDB.follows]))
            .then(() => queryDB(`INSERT INTO tags (tag_name) VALUES ?`, [seedDB.tags]))
            .then(() => queryDB(`INSERT INTO posts (user_id, title, caption, created_at, post_content) VALUES ?`, [seedDB.posts]))
            .then(() => Promise.all([
                queryDB(`INSERT INTO likes (user_id, post_id) VALUES ?`, [seedDB.likes]),
                queryDB(`INSERT INTO comments (user_id, post_id, comment_text, created_at) VALUES ?`, [seedDB.comments]),
                queryDB(`INSERT INTO post_tags (post_id, tag_id) VALUES ?`, [seedDB.post_tags])
            ]))
            .then(() => Promise.all([
                queryDB(`INSERT INTO comment_tags (comment_id, tag_id) VALUES ?`, [seedDB.comment_tags]),
                queryDB(`INSERT INTO user_tags (user_id, tag_id) VALUES ?`, [seedDB.userTags]),
                queryDB(`INSERT INTO comment_likes (user_id, comment_id) VALUES ?`, [seedDB.comment_likes]),
                queryDB(`INSERT INTO replies (user_id, comment_id, reply_text) VALUES ?`, [seedDB.replies])
            ]))
            .then(() => done()).catch(e => {
                done(e)
            }))
}


module.exports = { seedDB, resetDB, resetTables }