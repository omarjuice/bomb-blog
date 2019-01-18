module.exports = function () {
    const expect = require('expect');
    const { queryDB } = require('../db/connect')

    const { seedDB, resetDB, resetTables } = require('./seed')
    const { compare } = require('../db/crypt')
    seedDB.hashUsers = seedDB.hashUsers.bind(seedDB)


    before(resetDB)

    beforeEach(resetTables)

    describe('DATABASE: SHOW AND DESC TABLES', () => {
        it('Should not return an error', done => {
            queryDB(`SHOW TABLES`)
                .then(() => done()).catch((e) => done(e))
        })
        it('Should return tables with the correct columns', done => {
            Promise.all([queryDB(`DESC users`), queryDB(`DESC posts`), queryDB(`DESC likes`)])
                .then(() => done()).catch((e) => done(e))
        })
    })

    describe('DATABASE: QUERY users', () => {
        it('Should SELECT all users', done => {
            queryDB(`SELECT * FROM users`)
                .then((users) => {

                    expect(users.length).toBe(3)
                    for (let user of users) {
                        expect(user.pswd.trim().length).toBe(60)
                    }
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE a user by id', done => {
            let id = 2
            queryDB(`DELETE FROM users WHERE id=${id}`)
                .then(() => queryDB(`SELECT * from users`))
                .then((users) => {
                    expect(users.length).toBe(2)
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a user', done => {
            queryDB(`INSERT INTO users (email,username, pswd) VALUES ?`, [[['d@w.com', 'delta', 'password']]], seedDB.hashUsers)
                .then(() => queryDB(`SELECT * FROM users WHERE id=4`))
                .then(([user]) => {
                    expect(user).toMatchObject({
                        id: 4,
                        email: 'd@w.com',
                        username: 'delta'
                    })
                    expect(user.pswd).not.toBe('password')
                    done()
                }).catch(e => done(e))
        })
        it('Should UPDATE a user', done => {
            const email = 'newEmail@site.com';
            const id = 2;
            const query = `UPDATE users 
        SET 
            email = '${email}'
        WHERE id=${id}`;
            queryDB(query)
                .then(() => queryDB(`SELECT * FROM users WHERE id=2`))
                .then(([user]) => {
                    expect(user).toMatchObject({
                        id: 2,
                        email: 'newEmail@site.com',
                        username: 'beta'
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT many users', done => {
            queryDB(`INSERT IGNORE INTO users (email, username, pswd, created_at) VALUES ?`, [seedDB.manyUsers(10)], seedDB.hashUsers)
                .then(() => queryDB(`SELECT COUNT(*) as count FROM users`))
                .then(([users]) => {
                    expect(users.count > 3).toBe(true)
                    done()
                }).catch(e => done(e))
        })
        it('Should NOT INSERT a user with a duplicate email or username or id', done => {
            queryDB(`INSERT INTO users (email, username, pswd) VALUES ?`, [[['a@z.com', 'bob', 'password']]], seedDB.hashUsers)
                .then(() => {
                    throw new Error('BAD ENTRY SUCCESSFUL')
                })
                .catch((e) => {
                    if (/ER_DUP_ENTRY/i.test(e.message)) {
                        return queryDB(`INSERT INTO users (email, username, pswd) VALUES ?`, [[['lol@site.com', 'beta', 'password']]], seedDB.hashUsers)
                    }
                    return done(e)
                }).then(() => {
                    throw new Error('BAD ENTRY SUCCESSFUL')
                })
                .catch((e) => {
                    if (/ER_DUP_ENTRY/i.test(e.message)) {
                        return queryDB(`INSERT INTO users (email, username, pswd, id) VALUES ?`, [[['lol@site.com', 'person', 'password', 2]]], seedDB.hashUsers)
                    }
                    return done(e)
                }).then(() => {
                    throw new Error('BAD ENTRY SUCCESSFUL')
                })
                .catch((e) => {
                    if (/ER_DUP_ENTRY/i.test(e.message)) {
                        return done()
                    }
                    return done(e)
                })
        })
    })
    describe('DATABASE: QUERY posts', () => {
        it('Should SELECT all posts', done => {
            queryDB(`SELECT * FROM posts`)
                .then((posts) => {
                    expect(posts.length).toBe(3)
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT posts by user_id and return empty if there are none', done => {
            const ids = [1, 2]
            queryDB(`SELECT * FROM posts WHERE user_id=${ids[0]}`)
                .then((posts) => {
                    expect(posts.length).toBe(2)
                    return queryDB(`SELECT * FROM posts WHERE user_id=${ids[1]}`)
                }).then((posts) => {
                    expect(posts.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a post', done => {
            const newpost = [2, 'This is a new post', 'this is post caption', 'This is post text']
            queryDB(`INSERT INTO posts (user_id, title, caption, post_content) VALUES ?`, [[newpost]])
                .then(() => queryDB(`SELECT * FROM posts WHERE user_id=2`))
                .then(([post]) => {
                    expect(post).toMatchObject({
                        id: 4,
                        user_id: 2,
                        title: newpost[1],
                        caption: newpost[2],
                        post_content: newpost[3],
                        created_at: expect.any(Date)
                    })
                    // return queryDB(`INSERT INTO posts (user_id, title, caption, post_content) VALUES ?`, [[newpost]])
                    done()
                })
                .catch(e => {

                    return done(e)
                })
        })
        it('Should DELETE a post and NOT DELETE a post if not owned by the user', done => {
            let user_ids = [1, 2];
            let post_ids = [1, 3];
            queryDB(`DELETE FROM posts WHERE user_id=${user_ids[0]} AND id=${post_ids[0]}`)
                .then(() => queryDB(`SELECT * FROM posts WHERE id=1`))
                .then((posts) => {
                    expect(posts.length).toBe(0)
                    return queryDB(`DELETE FROM posts WHERE user_id=${user_ids[1]} AND id=${user_ids[1]}`)
                }).then(() => queryDB(`SELECT * FROM posts where id=${post_ids[1]}`))
                .then((posts) => {
                    expect(posts.length).toBe(1)
                    done()
                }).catch(e => done(e))
        })
        it('Should UPDATE a post and NOT UPDATE a post where the user does not own it', done => {
            const newContent = "This is the new post content.";
            const newTitle = "New Title";
            const newCaption = "New caption"
            const user_ids = [1, 2];
            const post_ids = [1, 3]
            queryDB(`UPDATE posts 
                        SET post_content='${newContent}',
                        title='${newTitle}',
                        caption='${newCaption}',
                        last_updated=NOW()
                    WHERE user_id=${user_ids[0]} AND id=${post_ids[0]}`)
                .then(() => queryDB(`SELECT * FROM posts WHERE id=1`))
                .then(([post]) => {
                    expect(post).toMatchObject({
                        id: 1,
                        user_id: 1,
                        post_content: newContent,
                        title: newTitle,
                        last_updated: expect.any(Date)
                    })
                    return queryDB(`UPDATE posts 
                                    SET post_content='${newContent}'
                                 WHERE user_id=${user_ids[1]} AND id=${post_ids[1]}`)
                }).then(() => queryDB(`SELECT * FROM posts WHERE id=3`))
                .then(([post]) => {
                    let [user_id, title, , , post_content] = seedDB.posts[2]
                    expect(post).toMatchObject({ user_id, post_content, title })
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: JOIN users and posts', () => {
        it('Should DELETE associated posts when its writer is deleted', done => {
            const id = 3
            queryDB(`DELETE FROM users WHERE id=${id}`)
                .then(() => queryDB(`SELECT * FROM posts WHERE user_id=${id}`))
                .then((posts) => {
                    expect(posts.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT all usernames and associated posts', done => {
            queryDB(`
                    SELECT
                        username, title
                    FROM users
                    INNER JOIN posts
                        ON users.id = posts.user_id;
            `).then((posts) => {
                    expect(posts.length).toBe(3)
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT a post and its writer', done => {
            const post_id = 2
            const [user_id, title, caption, , post_content] = seedDB.posts[post_id - 1]
            queryDB(`
                    SELECT 
                        username, title, post_content, caption, posts.created_at AS created_at
                    FROM posts
                    INNER JOIN users
                        ON posts.user_id = users.id
                    WHERE posts.id = ${post_id}
            `).then(([res]) => {
                    expect(res).toMatchObject({
                        username: seedDB.users[user_id - 1][1],
                        title, post_content, caption
                    })
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY likes', () => {
        it('Should SELECT all likes', done => {
            queryDB(`SELECT * FROM likes`)
                .then((likes) => {
                    expect(likes.length).toBe(seedDB.likes.length)
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT all likes returning the users and the post they liked', done => {
            const query = `
                    SELECT 
                        username, title
                    FROM likes
                    INNER JOIN users
                        ON likes.user_id = users.id
                    INNER JOIN posts
                        ON likes.post_id = posts.id;
                `;
            queryDB(query).then((likes) => {
                expect(likes.length).toBe(6)
                expect(likes[Math.floor(Math.random() * 6)])
                    .toMatchObject(
                        {
                            username: expect.any(String),
                            title: expect.any(String)
                        })
                done()
            }).catch(e => done(e))
        })
        it('Should SELECT the COUNT of likes of each post', done => {
            const query = `
                    SELECT 
                        title, COUNT(*) as numLikes
                    FROM posts
                    INNER JOIN likes
                        ON likes.post_id = posts.id
                    GROUP BY posts.id
                    ORDER BY numLikes DESC;
                `;
            queryDB(query)
                .then((res) => {
                    expect(res[0].numLikes).toBe(3);
                    expect(res[1].numLikes).toBe(2);
                    expect(res[2].numLikes).toBe(1);
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT the COUNT of likes each user has made', done => {
            const query = `
                    SELECT
                        username, COUNT(*) as numLikes
                    FROM users
                    INNER JOIN likes
                        ON likes.user_id = users.id
                    GROUP BY users.id
                    ORDER BY numLikes DESC
                `;
            queryDB(query).then((res) => {
                expect(res[0].numLikes).toBe(2)
                done()
            }).catch(e => done(e))
        })
        it('Should SELECT the COUNT of total likes each user has on their posts', done => {
            const query = `
                    SELECT
                        username, COUNT(posts.id) as numLikes
                    FROM users
                    LEFT JOIN posts
                        ON posts.user_id = users.id
                    LEFT JOIN likes
                        ON likes.post_id = posts.id
                    GROUP BY users.id
                    ORDER BY numLikes DESC
                `;
            queryDB(query).then(([user]) => {
                expect(user.numLikes).toBe(4)
                done()
            }).catch(e => done(e))
        })
        it('Should SELECT the COUNT of total likes a single user has on their posts', done => {
            const id = 2
            const query = `
                    SELECT
                        username, COUNT(posts.id) as numLikes
                    FROM users
                    LEFT JOIN posts
                        ON posts.user_id = users.id
                    LEFT JOIN likes
                        ON likes.post_id = posts.id
                    GROUP BY users.id
                    HAVING users.id = ${id}
                `;
            queryDB(query)
                .then(([user]) => {
                    expect(user.numLikes).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT the AVG number of likes of a users posts', done => {
            const id = 1
            const query = `
                    SELECT 
                        AVG(likes_per_user.numLikes) as avg_likes, likes_per_user.user_id
                    FROM (SELECT 
                            title, COUNT(*) as numLikes, posts.user_id 
                        FROM posts
                        INNER JOIN likes
                        ON likes.post_id = posts.id
                        GROUP BY posts.id) as likes_per_user
                    WHERE user_id = ${id}
                `;
            queryDB(query)
                .then((res) => {
                    expect(res[0].avg_likes).toBe(2)
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a like', done => {
            queryDB(`INSERT INTO LIKES (user_id, post_id) VALUES ?`, [[[2, 2]]])
                .then(() => queryDB(`SELECT * FROM LIKES`))
                .then((likes) => {
                    expect(likes.length).toBe(7)
                    done()
                }).catch(e => done(e))
        })
        it('Should NOT INSERT a duplicate like', done => {
            queryDB(`INSERT INTO LIKES (user_id, post_id) VALUES ?`, [[[3, 2]]])
                .then(() => done(new Error('BAD INSERT SUCCESSFUL')))
                .catch((e) => {
                    if (/ER_DUP_ENTRY/i.test(e.message)) {
                        return done()
                    }
                    return done(e)
                })
        })
        it('Should DELETE a like', done => {
            const user_id = 2;
            const post_id = 1
            queryDB(`DELETE FROM likes WHERE user_id=${user_id} AND post_id=${post_id}`)
                .then(() => queryDB(`SELECT * FROM likes WHERE user_id=${user_id} AND post_id=${post_id}`))
                .then((likes) => {
                    expect(likes.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated likes when a user is deleted', done => {
            const user_id = 3;
            queryDB(`DELETE FROM users WHERE id=${user_id}`)
                .then(() => queryDB(`SELECT * FROM likes WHERE user_id=${user_id} `))
                .then((likes) => {
                    expect(likes.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated likes when a post is deleted', done => {
            const post_id = 3;
            queryDB(`DELETE FROM posts WHERE id=${post_id}`)
                .then(() => queryDB(`SELECT * FROM likes WHERE post_id=${post_id}`))
                .then((likes) => {
                    expect(likes.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY comments', () => {
        it('Should SELECT the username, text and created_at of all comments for a given post', done => {
            const post_id = 3;
            const query = `
                    SELECT 
                        posts.id, posts.title as post_title, username as commenter, comment_text, comments.created_at
                    FROM posts
                    INNER JOIN comments
                        ON comments.post_id = posts.id
                    INNER JOIN users
                        ON comments.user_id = users.id
                    HAVING posts.id=${post_id}
                `;
            queryDB(query)
                .then((comments) => {
                    expect(comments).toEqual(expect.arrayContaining([{
                        id: 3,
                        post_title: 'A blog in Latin',
                        commenter: 'beta',
                        comment_text: 'I hate this',
                        created_at: expect.any(Date)
                    }, { "comment_text": "We learned a lot from this blog post", "commenter": "alpha", "created_at": expect.any(Date), "id": 3, "post_title": "A blog in Latin" }]))
                    done()
                }).catch(e => done(e))

        })
        it('Should SELECT all of the comments on post for a given user', done => {
            const user_id = 2;
            const post_id = 3;
            const query = `
                    SELECT 
                        posts.id, posts.title as post_title, username as commenter, comment_text, comments.created_at
                    FROM posts
                    INNER JOIN comments
                        ON comments.post_id = posts.id
                    INNER JOIN users
                        ON comments.user_id = users.id
                    HAVING posts.id=${post_id} AND users.id=${user_id}`
            queryDB(query)
                .then((comments) => {
                    expect(comments.length).toBe(1)
                    expect(comments[0]).toMatchObject({
                        post_id, username: users[user_id - 1][1],
                        comment_text: seedDB.comments[1][2],
                        created_at: expect.any(Date)
                    })
                    done()
                }).catch(e => done())
        })
        it('Should SELECT a COUNT of all comments on a given post', done => {
            const post_id = 3;
            queryDB(`SELECT COUNT(*) AS count FROM comments WHERE post_id=${post_id}`)
                .then(([comments]) => {
                    expect(comments.count).toBe(2)
                    done()
                }).catch(e => done(e))
        })
        it('Should UPDATE a comment', done => {
            const id = 2
            const newText = 'I love this!'
            const query = `
                    UPDATE comments
                        SET comment_text = '${newText}',
                            last_updated = NOW()
                    WHERE id = ${id}
                `
            queryDB(query)
                .then(() => queryDB(`SELECT * FROM comments WHERE id=${id}`))
                .then(([comment]) => {
                    expect(comment).toMatchObject({
                        id: 2,
                        comment_text: newText,
                        user_id: 2,
                        post_id: 3,
                        created_at: expect.any(Date),
                        last_updated: expect.any(Date)
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a new comment', done => {
            const newComment = [2, 2, 'COOL post :)']
            queryDB(`INSERT INTO comments (user_id, post_id, comment_text) VALUES ?`, [[newComment]])
                .then(() => queryDB(`SELECT * FROM comments WHERE id=4`))
                .then(([comment]) => {
                    expect(comment).toMatchObject({
                        user_id: newComment[0],
                        post_id: newComment[1],
                        comment_text: newComment[2],
                        created_at: expect.any(Date)
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE a comment', done => {
            const user_id = 2;
            const post_id = 3;
            const comment_id = 2;
            queryDB(`DELETE FROM comments WHERE user_id=${user_id} AND post_id=${post_id} AND id=${comment_id}`)
                .then(() => queryDB(`SELECT * FROM comments`))
                .then((comments) => {
                    expect(comments.length).toBe(2)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated comments when a user is deleted', done => {
            const user_id = 2;
            queryDB(`DELETE FROM users WHERE id=${user_id}`)
                .then(() => queryDB(`SELECT * FROM comments`))
                .then((comments) => {
                    for (let comment of comments) {
                        expect(comment).not.toMatchObject({ user_id })
                    }
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated commented when a post is deleted', done => {
            const post_id = 3;
            queryDB(`DELETE FROM posts WHERE id=${post_id}`)
                .then(() => queryDB(`SELECT * FROM comments`))
                .then((comments) => {
                    for (let comment of comments) {
                        expect(comment).not.toMatchObject({ post_id })
                    }
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY comment_likes', done => {
        it('Should SELECT a COUNT of all of the likes on a given comment', done => {
            const comment_id = 3
            queryDB(`SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id=${comment_id}`)
                .then(([likes]) => {
                    expect(likes.count).toBe(3)
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT the username, text, and number of likes, and created_at of all comments of a given post ', done => {
            const post_id = 3;
            const query = `
                    SELECT 
                        username, comment_text, comments.created_at, COUNT(comment_likes.created_at) AS numLikes
                    FROM comments
                    INNER JOIN users
                        ON comments.user_id = users.id
                    LEFT JOIN comment_likes
                        ON comments.id = comment_likes.comment_id
                    WHERE comments.post_id = ${post_id}
                    GROUP BY comments.id
                    ORDER BY numLikes DESC
                `
            queryDB(query)
                .then((comments) => {
                    expect(comments[0]).toMatchObject({
                        username: 'alpha',
                        comment_text: 'We learned a lot from this blog post',
                        created_at: expect.any(Date),
                        numLikes: 3
                    })
                    expect(comments[1]).toMatchObject({
                        username: 'beta',
                        comment_text: 'I hate this',
                        created_at: expect.any(Date),
                        numLikes: 0
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a new comment like AND NOT INSERT a duplicate comment like', done => {
            const user_id = 2;
            const comment_id = 2;
            queryDB(`INSERT INTO comment_likes (user_id, comment_id) VALUES ?`, [[[user_id, comment_id]]])
                .then(() => queryDB(`SELECT * FROM comment_likes WHERE user_id=${user_id} AND comment_id=${comment_id}`))
                .then((comments) => {
                    expect(comments.length).toBe(1)
                    return queryDB(`INSERT INTO comment_likes (user_id, comment_id) VALUES ?`, [[[user_id, comment_id]]])
                }).then(() => done(new Error('BAD INSERT SUCCESSFUL')))
                .catch(e => {
                    if (/ER_DUP_ENTRY/i.test(e.message)) {
                        return done()
                    }
                    return done(e)
                })
        })
        it('Should DELETE a comment', done => {
            const user_id = 2;
            const comment_id = 3;
            queryDB(`DELETE FROM comment_likes WHERE user_id=${user_id} AND comment_id=${comment_id}`)
                .then(() => queryDB(`SELECT * FROM comment_likes WHERE user_id=${user_id} AND comment_id=${comment_id}`))
                .then((comments) => {
                    expect(comments.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated comment likes when a user is deleted', done => {
            const user_id = 2;
            queryDB(`DELETE FROM users WHERE id=${user_id}`)
                .then(() => queryDB(`SELECT * FROM comment_likes WHERE user_id=${user_id}`))
                .then((comments) => {
                    expect(comments.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated likes when a comment is deleted', done => {
            const comment_id = 1;
            queryDB(`DELETE FROM comments WHERE id=${comment_id}`)
                .then(() => queryDB(`SELECT * FROM comment_likes WHERE comment_id=${comment_id}`))
                .then((likes) => {
                    expect(likes.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY replies', done => {
        it('Should SELECT all comment replies for a given comment', done => {
            const comment_id = 2
            const query = `
                SELECT 
                comment_id, username, reply_text, replies.created_at
                FROM replies
                INNER JOIN users
                    ON replies.user_id = users.id
                HAVING comment_id = ${comment_id}
                `
            queryDB(query)
                .then((replies) => {
                    expect(replies[0]).toMatchObject({
                        comment_id: 2,
                        username: 'alpha',
                        reply_text: 'How very negative of you. At least be constructive.',
                        created_at: expect.any(Date)
                    });
                    expect(replies[1]).toMatchObject({
                        comment_id: 2,
                        username: 'beta',
                        reply_text: 'No u',
                        created_at: expect.any(Date)
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT all comments AND their replies AND their likes for a given post', done => {
            const post_id = 3;
            const query1 = `
                    SELECT 
                        comments.id, username, comment_text, comments.created_at, comments.last_updated, 
                        COUNT(comment_likes.created_at) AS numLikes
                    FROM comments
                    INNER JOIN users
                        ON comments.user_id = users.id
                    LEFT JOIN comment_likes
                        ON comments.id = comment_likes.comment_id
                    WHERE comments.post_id = ${post_id}
                    GROUP BY comments.id
                `
            const query2 = (comment_id) => `
                    SELECT 
                        username, replies.created_at, reply_text, replies.last_updated, comment_id
                    FROM replies
                    INNER JOIN users
                        ON replies.user_id = users.id
                    HAVING comment_id = ${comment_id};                    
                `
            let comments;
            queryDB(query1)
                .then((allComments) => {
                    comments = allComments.reduce((obj, { username, comment_text, created_at, last_updated, numLikes, id }) => {
                        obj[id] = { username, comment_text, created_at, last_updated, numLikes, replies: [] }
                        return obj
                    }, {})
                    const reply_queries = allComments.map(({ id }) => queryDB(query2(id)))
                    return Promise.all(reply_queries)
                }).then((commentReplyList) => {
                    for (let comment_replies of commentReplyList) {
                        for (let reply of comment_replies) {
                            const { username, created_at, reply_text, last_updated, comment_id } = reply
                            comments[comment_id].replies.push({ username, created_at, reply_text, last_updated })
                        }
                    }
                    done()
                })
                .catch(e => done(e))
        })
        it('Should INSERT a new reply', done => {
            const newReply = [
                1,
                1,
                "Yeah stop leaving unhelpful comments"
            ]
            queryDB(`INSERT INTO replies (user_id, comment_id, reply_text) VALUES ?`, [[newReply]])
                .then(() => queryDB(`SELECT * FROM replies WHERE comment_id=${newReply[1]} ORDER BY created_at DESC`))
                .then((replies) => {
                    expect(replies[replies.length - 1]).toMatchObject({
                        user_id: 1,
                        comment_id: 1,
                        reply_text: 'Yeah stop leaving unhelpful comments',
                        created_at: expect.any(Date),
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should UPDATE a reply', done => {
            const reply_id = 7
            const newText = 'HAHA'
            queryDB(`UPDATE replies SET reply_text='${newText}', last_updated=NOW() WHERE id=${reply_id}`)
                .then(() => queryDB(`SELECT * FROM replies WHERE id=${reply_id}`))
                .then(([reply]) => {
                    expect(reply).toMatchObject({
                        last_updated: expect.any(Date),
                        reply_text: newText
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE a reply', done => {
            const reply_id = 7
            queryDB(`DELETE FROM replies WHERE id=${reply_id}`)
                .then(() => queryDB(`SELECT * FROM replies WHERE id=${reply_id}`))
                .then((replies) => {
                    expect(replies.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated replies when a user is deleted', done => {
            const user_id = 2;
            queryDB(`DELETE FROM users WHERE id=${user_id}`)
                .then(() => queryDB(`SELECT * FROM replies WHERE user_id=${user_id}`))
                .then((replies) => {
                    expect(replies.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated replies when a comment is deleted', done => {
            const comment_id = 3;
            queryDB(`DELETE FROM comments WHERE id=${comment_id}`)
                .then(() => queryDB(`SELECT * FROM replies WHERE comment_id=${comment_id}`))
                .then((replies) => {
                    expect(replies.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY tags', () => {
        it('Should SELECT all tags for a given post', done => {
            const post_id = 1
            const query = `
                    SELECT 
                        GROUP_CONCAT(tag_name SEPARATOR ', ') as tagList, post_id
                    FROM post_tags
                    INNER JOIN tags
                        ON tags.id = post_tags.tag_id
                    WHERE post_tags.post_id = ${post_id}
                    GROUP BY post_tags.post_id
                `
            queryDB(query)
                .then(([{ tagList }]) => {
                    expect(tagList).toBe('blog, cool, beautiful, amazing, dev')
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT all tags for a given comment', done => {
            const comment_id = 3;
            const query = `
                    SELECT 
                        tag_name
                    FROM comment_tags
                    INNER JOIN tags
                        ON tags.id = comment_tags.tag_id
                    WHERE comment_tags.comment_id = ${comment_id}
                `
            queryDB(query)
                .then((tags) => {
                    expect(tags.map((tag) => tag.tag_name))
                        .toEqual(expect.arrayContaining(['blog', 'beautiful', 'amazing']))
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT ALL comments and ALL replies and ALL likes and ALL tags for a given post', done => {
            const post_id = 3;
            const query1 = `
                    SELECT 
                        comments.id, username, comment_text, comments.created_at, comments.last_updated, 
                        COUNT(comment_likes.created_at) AS numLikes
                    FROM comments
                    INNER JOIN users
                        ON comments.user_id = users.id
                    LEFT JOIN comment_likes
                        ON comments.id = comment_likes.comment_id
                    WHERE comments.post_id = ${post_id}
                    GROUP BY comments.id
                `
            const queryReplies = (comment_id) => `
                    SELECT 
                        username, replies.created_at, reply_text, replies.last_updated, comment_id
                    FROM replies
                    INNER JOIN users
                        ON replies.user_id = users.id
                    HAVING comment_id = ${comment_id};                    
                `
            const queryTags = (comment_id) => `
                    SELECT 
                        GROUP_CONCAT(tag_name SEPARATOR ', ') as tagList, comment_id
                    FROM comment_tags
                    INNER JOIN tags
                        ON tags.id = comment_tags.tag_id
                    WHERE comment_tags.comment_id = ${comment_id}
                    GROUP BY comment_tags.comment_id
                `
            let comments;
            let reply_queries;
            let tag_queries;
            queryDB(query1)
                .then((allPostComments) => {
                    comments = allPostComments.reduce((obj, { username, comment_text, created_at, last_updated, numLikes, id }) => {
                        obj[id] = { username, comment_text, created_at, last_updated, numLikes, replies: [], tagList: '' }
                        return obj
                    }, {})
                    reply_queries = allPostComments.map(({ id }) => queryDB(queryReplies(id)))
                    tag_queries = allPostComments.map(({ id }) => queryDB(queryTags(id)))
                    return Promise.all(reply_queries)
                }).then((commentReplyList) => {
                    for (let comment_replies of commentReplyList) {
                        for (let reply of comment_replies) {
                            const { username, created_at, reply_text, last_updated, comment_id } = reply
                            comments[comment_id].replies.push({ username, created_at, reply_text, last_updated })
                        }
                    }
                    return Promise.all(tag_queries)
                }).then((allCommentTags) => {
                    for (let [{ tagList, comment_id }] of allCommentTags) {
                        comments[comment_id].tagList = tagList
                    }
                    done()
                })
                .catch(e => done(e))
        })
        it('Should INSERT a new tag', done => {
            queryDB(`INSERT INTO tags (tag_name) VALUES ?`, [[['newTAG']]])
                .then(() => queryDB(`SELECT * FROM tags ORDER BY id DESC LIMIT 1`))
                .then(([{ tag_name }]) => {
                    expect(tag_name).toBe('newTAG')
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a new post tag', done => {
            const post_id = 2
            const tag_id = 9
            queryDB(`INSERT INTO post_tags (post_id, tag_id) VALUES ?`, [[[post_id, tag_id]]])
                .then(() => queryDB(`SELECT * FROM post_tags WHERE post_id=${post_id} AND tag_id=${tag_id}`))
                .then(([post_tag]) => {
                    expect(post_tag).toBeTruthy()
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a new comment tag', done => {
            const comment_id = 3;
            const tag_id = 8;
            queryDB(`INSERT INTO comment_tags (comment_id, tag_id) VALUES ?`, [[[comment_id, tag_id]]])
                .then(() => queryDB(`SELECT * FROM comment_tags WHERE comment_id=${comment_id} AND tag_id=${tag_id}`))
                .then(([comment_tag]) => {
                    expect(comment_tag).toBeTruthy()
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE a tag and its associated rows', done => {
            const tag_id = 4
            queryDB(`DELETE FROM tags where id=${tag_id}`)
                .then(() => Promise.all([
                    queryDB(`SELECT * FROM post_tags WHERE tag_id=${tag_id}`),
                    queryDB(`SELECT * FROM comment_tags WHERE tag_id=${tag_id}`)
                ])).then(([post_tags, comment_tags]) => {
                    expect(post_tags.length).toBe(0);
                    expect(comment_tags.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE tag references when a post/comment is deleted', done => {
            const post_id = 3;
            queryDB(`DELETE FROM posts WHERE id=${post_id}`)
                .then(() => Promise.all([
                    queryDB(`SELECT * FROM post_tags WHERE post_id=${post_id}`),
                    queryDB(`SELECT * FROM comment_tags WHERE comment_id=2 OR comment_id=3`)
                ])).then(([post_tags, comment_tags]) => {
                    expect(post_tags.length).toBe(0)
                    expect(comment_tags.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY profiles', () => {
        it('Should SELECT all profiles', done => {
            queryDB(`SELECT * FROM profiles`)
                .then(() => {
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT a username, profile, and the users interests', done => {
            const user_id = 1
            const query = `
                SELECT 
                    username, about, photo_path, GROUP_CONCAT(interest_name SEPARATOR ', ') as interests
                FROM users
                LEFT JOIN profiles 
                    ON users.id = profiles.user_id
                LEFT JOIN user_interests
                    ON user_interests.user_id = users.id
                LEFT JOIN interests
                    ON interests.id = user_interests.interest_id
                WHERE users.id=${user_id}
                GROUP BY user_interests.user_id
            `
            queryDB(query)
                .then(([profile]) => {
                    expect(profile).toMatchObject({
                        username: 'alpha',
                        about: 'I am a web developer based in City, Country',
                        photo_path: /alpha\w+/,
                        interests: 'web development, food, programming'
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should UPDATE a profile', done => {
            const user_id = 2;
            const photo_path = `${seedDB.users[user_id - 1][1]}${'xxxxx'.replace(/x/g, () => (Math.random() * 36) | 0).toString(36)}`
            const newAbout = "Koolest Kid"
            const query = `
                UPDATE profiles
                SET
                    photo_path = '${photo_path}',
                    about = '${newAbout}',
                    last_updated = NOW()
                WHERE user_id = ${user_id}
            `
            queryDB(query)
                .then((res) => queryDB(`SELECT * FROM profiles WHERE user_id = ${user_id}`))
                .then(([profile]) => {
                    expect(profile).toMatchObject({
                        user_id, photo_path, about: newAbout, last_updated: expect.any(Date)
                    })
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE a profile when a user is deleted', done => {
            queryDB(`DELETE FROM users WHERE id=2`)
                .then(() => queryDB(`SELECT * FROM profiles where user_id=2`))
                .then((users) => {
                    expect(users.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY interests', () => {
        it('Should SELECT all interests of a given user', done => {
            const user_id = 1
            const query = `
                SELECT 
                    interest_name
                FROM user_interests 
                INNER JOIN interests
                    ON interests.id = user_interests.interest_id
                WHERE user_interests.user_id = ${user_id}
            `
            queryDB(query)
                .then((interests) => {
                    expect(interests.length).toBe(3)
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a new interest and not insert a duplicate interest', done => {
            const interest_name = 'hiking';
            const user_id = 2;
            queryDB(`INSERT INTO interests (interest_name) VALUES ?`, [[[interest_name]]])
                .then(() => queryDB(`INSERT INTO user_interests (user_id, interest_id) VALUES ?`, [[[user_id, 8]]]))
                .then(() => queryDB(`
                        SELECT 
                            interest_name 
                        FROM user_interests 
                        INNER JOIN interests 
                            ON interests.id = user_interests.interest_id 
                        WHERE user_interests.user_id = ${user_id}`))
                .then((interests) => {
                    expect(interests).toEqual(expect.arrayContaining([{ interest_name: 'hiking' }]))
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE an interest', done => {
            queryDB(`DELETE FROM interests WHERE id=5`)
                .then(() => queryDB(`SELECT * FROM user_interests WHERE interest_id=5`))
                .then((interests) => {
                    expect(interests.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE a user interest', done => {
            queryDB(`DELETE FROM user_interests WHERE user_id=2 AND interest_id=5`)
                .then(() => queryDB(`SELECT interest_id FROM user_interests WHERE user_id=2`))
                .then((interests) => {
                    expect(interests).not.toEqual(expect.arrayContaining([{ interest_id: 5 }]))
                    done()
                }).catch(e => done(e))
        })
    })
    describe('DATABASE: QUERY follows', () => {
        it('Should SELECT all follows and exclude self follows', done => {
            queryDB(`SELECT * FROM follows WHERE follower_id != followee_id`)
                .then((follows) => {
                    expect(follows.length).toBe(4)
                    for (let follow of follows) {
                        expect(follow).toMatchObject({
                            follower_id: expect.any(Number),
                            followee_id: expect.any(Number),
                            created_at: expect.any(Date)
                        })
                    }
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT all followers of a user by username', done => {
            const user_id = 1;
            const query = `
                SELECT 
                    username
                FROM follows
                    INNER JOIN users
                    ON follower_id = users.id
                WHERE follows.followee_id = ${user_id} AND follows.follower_id != follows.followee_id
            `
            queryDB(query)
                .then((followers) => {
                    expect(followers).toEqual(expect.arrayContaining([{ username: 'gamma' }, { username: 'beta' }]))
                    done()
                }).catch(e => done(e))
        })
        it('Should SELECT all of the users a user is following by username', done => {
            const user_id = 3;
            const query = `
                SELECT 
                    username
                FROM follows
                    INNER JOIN users
                    ON followee_id = users.id
                WHERE follows.follower_id = ${user_id} AND follows.follower_id != follows.followee_id
            `
            queryDB(query)
                .then((followees) => {
                    expect(followees).toEqual(expect.arrayContaining([{ username: 'alpha' }, { username: 'beta' }]))
                    done()
                }).catch(e => done(e))
        })
        it('Should INSERT a follow and NOT INSERT a duplicate follow', done => {
            const followee_id = 2;
            const follower_id = 1;
            queryDB(`INSERT INTO follows (followee_id, follower_id) VALUES ?`, [[[followee_id, follower_id]]])
                .then(() => queryDB(`SELECT * FROM follows WHERE followee_id=${followee_id} AND follower_id=${follower_id}`))
                .then((follows) => {
                    expect(follows.length).toBe(1)
                }).then(() => queryDB(`INSERT INTO follows (followee_id, follower_id) VALUES ?`, [[[followee_id, follower_id]]]))
                .then(() => {
                    throw new Error('BAD INSERT SUCCESSFUL')
                })
                .catch(e => {
                    if (/ER_DUP_ENTRY/i.test(e.message)) {
                        return done()
                    }
                    return done(e)
                })
        })
        it('Should DELETE a follow', done => {
            const follower_id = 3;
            const followee_id = 2;
            queryDB(`DELETE FROM follows WHERE followee_id = ${followee_id} AND follower_id = ${follower_id}`)
                .then(() => queryDB(`SELECT * FROM FOLLOWS WHERE followee_id = ${followee_id} AND follower_id = ${follower_id}`))
                .then((follows) => {
                    expect(follows.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
        it('Should DELETE associated follows when a user is deleted', done => {
            const user_id = 3;
            queryDB(`DELETE FROM users WHERE id=${user_id}`)
                .then(() => queryDB(`SELECT * FROM follows WHERE followee_id=${user_id} OR follower_id=${user_id}`))
                .then((follows) => {
                    expect(follows.length).toBe(0)
                    done()
                }).catch(e => done(e))
        })
    })
    // describe('AUTHENTICATE user', () => {
    //     it('Should authenticate a user with the correct credentials', done => {
    //         const [, username, password] = seedDB.users[0];
    //         queryDB(`SELECT pswd FROM users WHERE username='${username}'`)
    //             .then(([{ pswd }]) => {
    //                 return compare(password, pswd)
    //             })
    //             .then((result) => {
    //                 console.log(result)
    //                 expect(result).toBe(true)
    //                 done()
    //             }).catch(e => done(e))
    //     })
    //     it('Should NOT authenticate a user with incorrect credentials', done => {
    //         const username = seedDB.users[1][1];
    //         const password = 'xyz'

    //         queryDB(`SELECT pswd FROM users WHERE username='${username}'`)
    //             .then(([{ pswd }]) => {
    //                 return compare(password, pswd)
    //             })
    //             .then((result) => {
    //                 expect(result).toBe(false)
    //                 done()
    //             }).catch(e => done(e))
    //     })
    // })
}
