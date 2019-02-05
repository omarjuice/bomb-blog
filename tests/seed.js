const faker = require("faker");
const { hashPW } = require('../db/crypt')
const { database } = require('../config')
const { userSchema, profileSchema, postSchema, likeSchema, commentSchema, commentLikeSchema,
    replySchema, tagSchema, postTagSchema, commentTagSchema, followSchema, userTagSchema } = require('../db/schema')
const { queryDB } = require('../db/connect')

const seedDB = {
    numUsers: 3,
    numPosts: 3,
    numComments: 3,
    numTags: 11,
    users: [[
        "a@z.com",
        "alpha",
        '1',
    ], [
        "b@y.com",
        "beta",
        '2',
    ], [
        "c@x.com",
        "gamma",
        '3'
    ]],
    usersHashed: [[
        "a@z.com",
        "alpha",
        '1',
    ], [
        "b@y.com",
        "beta",
        '2',
    ], [
        "c@x.com",
        "gamma",
        '3'
    ]],
    profiles: [[
        1,
        "I am a web developer based in City, Country",
        faker.image.avatar(),
    ], [
        2,
        "Kool Kid",
        null
    ], [
        3,
        null,
        faker.image.avatar()
    ]],
    userTags: [[1, 2], [1, 6], [2, 11], [3, 4], [3, 9]],
    follows: [[1, 1], [1, 3], [1, 2], [2, 3], [2, 2], [3, 1], [3, 3]],
    posts: [[
        1,
        "My blog",
        "All the reasons why I am cool",
        faker.date.past(),
        faker.lorem.paragraphs(10, '***************')
    ], [
        1,
        "My other blog",
        "Even more reasons why I am cool",
        faker.date.past(),
        faker.lorem.paragraphs(10, '***************')
    ], [
        3,
        "A blog in Latin",
        "Lorem lorem lorem!!!",
        faker.date.past(),
        faker.lorem.paragraphs(10, '***************')
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
    manyUsers: function (num) {
        // this.numUsers = num
        return Array(num).fill("x").map(() => [faker.internet.email(), faker.internet.userName(), faker.internet.password(), faker.date.past()])
    },
    manyProfiles: function () {
        return Array(this.numUsers - 3).fill("x").map((_, i) => [i + 4, faker.lorem.sentence(Math.floor(Math.random() * 20)), Math.random() < .75 ? faker.internet.avatar() : null])
    },
    manyFollows: function (num) {
        let users = this.numUsers;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * users) + 1])
    },
    manyPosts: function (num) {
        let users = this.numUsers
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, faker.random.words(Math.floor(Math.random() * 15)), faker.lorem.sentence(), faker.date.past(), faker.lorem.paragraphs(10)])
    },
    manyComments: function (num) {
        let users = this.numUsers
        let posts = this.numPosts
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * posts) + 1, faker.lorem.sentence(), faker.date.past()])
    },
    manyReplies: function (num) {
        let users = this.numUsers
        let comments = this.numComments
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * comments) + 1, faker.lorem.words(Math.floor(Math.random() * 20))])
    },
    manyTags: function (num) {
        return Array(num).fill("x").map(() => [faker.random.word().toLowerCase().replace(/\s+/g, '')])
    },
    manyUserTags: function (num) {
        let tags = this.numTags;
        let users = this.numUsers;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * tags) + 1])
    },
    manyPostTags: function (num) {
        let tags = this.numTags;
        let posts = this.numPosts;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * posts) + 1, Math.floor(Math.random() * tags) + 1])
    },
    manyCommentTags: function (num) {
        let tags = this.numTags;
        let comments = this.numComments;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * comments) + 1, Math.floor(Math.random() * tags) + 1])
    },
    manyLikes: function (num) {
        let users = this.numUsers;
        let posts = this.numPosts;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * posts) + 1])
    },
    manyCommentLikes: function (num) {
        let users = this.numUsers
        let comments = this.numComments;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * comments) + 1])
    }
}


const resetDB = (done) => {
    console.log(database)
    const query1 = `DROP DATABASE IF EXISTS ${database}`;
    const query2 = `CREATE DATABASE IF NOT EXISTS ${database}`;
    seedDB.hashUsers(seedDB.usersHashed).then(() => {
        return queryDB(query1)
    })
        .then(() => queryDB(query2))
        .then(() => queryDB(`USE ${database}`))
        .then(() => Promise.all([queryDB(userSchema.create), queryDB(postSchema.create)]))
        .then(() => done ? done() : null).catch(e => console.log(e))
}
const resetTables = (done) => {
    console.log('TABLES')
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
                if (done) {
                    return done(e)
                }
                throw e
            }))
}


module.exports = { seedDB, resetDB, resetTables }