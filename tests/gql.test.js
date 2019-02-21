module.exports = function () {
    const expect = require('expect');
    const request = require('supertest')
    const express = require('express')
    const { ApolloServer, makeExecutableSchema } = require('apollo-server-express')
    const session = require('express-session')
    const app = express()
    const { graphqlUploadExpress } = require('graphql-upload')
    const { port } = require('..')
    const queries = require('./testQueries')
    const typeDefs = require('../gql/schema')
    const resolvers = require('../gql/resolvers')
    const Errors = require('../gql/errors')
    const { seedDB, resetDB, resetTables } = require('./seed')
    const { queryDB } = require('../db/connect')
    const applyLoaders = require('../gql/batch')
    const schema = makeExecutableSchema({ typeDefs, resolvers })
    const apollo = new ApolloServer({ schema, context: (ctx) => applyLoaders(ctx), uploads: true })
    let agent;
    before(done => {
        app.use(graphqlUploadExpress())
        app.use(session({
            name: 'glob-session-test',
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                maxAge: 60000
            }
        }))
        apollo.applyMiddleware({ app })
        app.get('/', (req, res) => {
            res.send('OK')
        })
        app.listen(3001, () => {
            console.log(`Listening on port ${port}`, apollo.graphqlPath)
            done()
        })
    })
    before(resetDB)
    beforeEach(resetTables)
    beforeEach((done) => {
        agent = request.agent(app)
        done()
    })
    const reqGQL = ({ query, operationName = null, variables = {} }) => {
        return agent
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, operationName, variables })
    }
    const chainReqGQL = function (done = () => { }, ...reqs) {
        if (reqs.length === 1) {
            return reqs[0](done)
        }
        return reqGQL(reqs[0])
            .expect(200)
            .end(e => {
                if (e) done(e);
                chainReqGQL(done, ...reqs.slice(1, reqs.length))
            })
    }
    describe('GQL: HELLO', () => {
        it('Should say hello', done => {
            const query = `
            query{
                hello
            }`
            reqGQL({ query })
                .expect(200)
                .expect(({ body }) => {

                    expect(body.data).toMatchObject({ hello: 'Hello world!' })
                }).end(done)
        })
    })
    describe('GQL: REGISTER', done => {
        const input = { username: 'delta', password: '1234567', email: 'd@w.com' }
        it('Should register a new user', done => {
            reqGQL({ query: queries.register, variables: { input } })
                .expect(({ body }) => {
                    expect(body.data.register).toBe(true)
                }).end(done)
        })
        it('Should not register a new user with an invalid email', done => {
            reqGQL({ query: queries.register, variables: { input: { ...input, email: 'ffff' } } })
                .expect(({ body }) => {
                    expect(body.errors[0].message).toBe(Errors.register.invalidEmail.message)
                }).end(done)
        })
        it('Should authenticate the new user', done => {
            chainReqGQL(done, { query: queries.register, variables: { input } },
                (finished) => reqGQL({ query: queries.authenticate })
                    .expect(({ body }) => {
                        expect(body.data.authenticated).toBe(true)
                    }).end(finished)
            )
        })
        it('Should create a new profile for the new user', done => {
            chainReqGQL(done, { query: queries.register, variables: { input } },
                (finished) => reqGQL({ query: queries.profile.get, variables: { id: 4 } })
                    .expect(({ body }) => {
                        expect(body.data.user.profile).toMatchObject({ user_id: 4 })
                    }).end(finished)
            )
        })
    })
    describe('GQL: LOGIN', () => {
        it('Should log in a user with valid credentials', done => {
            const query = queries.login.success[0]
            chainReqGQL(done, { query: query },
                (done) => reqGQL({ query: queries.authenticate })
                    .expect(200)
                    .expect(({ body }) => {
                        expect(body.data).toMatchObject({ authenticated: true })
                    })
                    .end(done))
        })
        it('Should not log in a user with invalid credentials', done => {
            const query = queries.login.fail
            chainReqGQL(done, { query },
                (finished) => reqGQL({ query: queries.authenticate })
                    .expect(200)
                    .expect(({ body }) => {
                        expect(body.data).toMatchObject({ authenticated: false })
                    })
                    .end(finished))
        })
    })
    describe('GQL: LOGOUT', () => {
        it('Should logout a user', done => {
            const query1 = queries.login.success[0]
            const query2 = queries.authenticate
            const query3 = queries.logout

            chainReqGQL(done, { query: query1 }, { query: query2 }, { query: query3 },
                (finished) => {
                    reqGQL({ query: query2 })
                        .expect(200)
                        .expect(({ body }) => {
                            expect(body.data).toMatchObject({ authenticated: false })
                        }).end(finished)
                })
        })
    })
    describe('GQL: GET users', done => {
        it('Should get all users', done => {
            queryDB(`INSERT IGNORE INTO users (email, username, pswd, created_at) VALUES ?`, [seedDB.manyUsers(10)], seedDB.hashUsers)
                .then(() => {
                    reqGQL({ query: queries.user.all, variables: { input: { limit: 5, cursor: 3 } } })
                        .expect(({ body }) => {
                            expect(body.data.users.results.length).toBe(5)
                            expect(body.data.users.cursor).toBe(8)
                            body.data.users.results.forEach(user => {
                                expect(user).toMatchObject({
                                    id: expect.any(Number),
                                    username: expect.any(String)
                                })
                            })
                        }).end(done)
                })

        })
        it('Should search users', done => {
            reqGQL({ query: queries.user.all, variables: { input: { search: 'alpha' } } })
                .expect(({ body }) => {
                    expect(body.data.users.results.length).toBe(1)
                    expect(body.data.users.results[0]).toMatchObject({
                        id: 1,
                        username: 'alpha'
                    })
                }).end(done)
        })
    })
    describe('GQL: GET PROFILES', () => {
        it('Should get a profile for a user', done => {
            const id = 1
            const [, username] = seedDB.users[id - 1]
            const [user_id, about, photo_path] = seedDB.profiles[id - 1]
            reqGQL({
                query: queries.profile.get, variables: { id }
            })
                .expect(200)
                .expect(({ body }) => {
                    expect(body).toMatchObject({
                        "data": {
                            "user": {
                                id,
                                username,
                                "profile": {
                                    user_id, about, photo_path, "last_updated": null
                                }
                            }
                        }
                    })
                }).end(done)

        })
        it('Should return error for user that does not exist', done => {
            const id = 4
            reqGQL({ query: queries.profile.get, variables: { id } })
                .expect(200)
                .expect(({ body }) => {
                    const [error] = body.errors
                    expect(error).toBeTruthy()
                    expect(error.message).toBe(Errors.user.notFound.message)
                }).end(done)
        })
        it('Should get a profile from the id of the session user', done => {
            const [user_id, about, photo_path] = seedDB.profiles[0]
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.profile.get })
                    .expect(({ body }) => {
                        expect(body.data.user.profile).toMatchObject({ user_id, about, photo_path })
                    }).end(finished)

            )
        })
    })

    describe('GQL: UPDATE profiles', () => {
        it('Should update a profile if the user is logged in', done => {
            const about = "Not actually a developer";
            const photo_path = "new photo"
            chainReqGQL(done, { query: queries.login.success[0] },
                { query: queries.profile.update, variables: { input: { about, photo_path } } },
                (finished) => reqGQL({ query: queries.profile.get })
                    .expect(({ body }) => {
                        expect(body.data.user.profile).toMatchObject({ about, photo_path })
                    }).end(finished)
            )

        })
        it('Should update the profile if at least on field is given', done => {
            const about = "Not actually a developer";
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.profile.update, variables: { input: { about } } })
                    .expect(({ body }) => {
                        expect(body.data.updateProfile).toMatchObject({ about, photo_path: seedDB.profiles[0][2] })
                    }).end(finished))

        })
        it('Should not update a profile if the user is not authenticated', done => {
            const about = "I suck";
            const photo_path = "trashy/photo";
            reqGQL({ query: queries.profile.update, variables: { input: { about, photo_path } } })
                .expect(({ body }) => {
                    let [error] = body.errors
                    expect(error).toBeTruthy()
                    expect(error.message).toBe(Errors.authentication.notLoggedIn.message)
                }).end(done)
        })
    })
    describe('GQL: GET posts', () => {
        it('Should search all posts', done => {
            reqGQL({ query: queries.posts.all, variables: { input: { search: "latin" } } })
                .expect(({ body }) => {
                    expect(body.data.posts.results[0]).toMatchObject({
                        "id": 3,
                        "user_id": 3,
                        "author": {
                            "username": "gamma"
                        },
                        "numLikes": 2,
                        "title": "A blog in Latin"
                    })
                }).end(done)
        })
        it('Should get a post by id', done => {
            reqGQL({ query: queries.posts.byId, variables: { id: 3 } })
                .expect(({ body }) => {
                    expect(body.data).toMatchObject({
                        "post": {
                            "id": 3,
                            "user_id": 3,
                            "title": "A blog in Latin",
                            "caption": "Lorem lorem lorem!!!",
                            "author": {
                                "username": "gamma"
                            },
                            "post_content": expect.any(String),
                            "numLikes": 2
                        }
                    })
                }).end(done)
        })
        it('Should get all the posts of a user', done => {
            reqGQL({ query: queries.posts.byUserID, variables: { id: 1 } })
                .expect(({ body }) => {
                    const { user } = body.data
                    expect(user.posts).toBeTruthy()
                    expect(user.posts).toEqual(expect.arrayContaining([
                        {
                            "title": "My blog",
                            "numLikes": 3
                        },
                        {
                            "title": "My other blog",
                            "numLikes": 1
                        }
                    ]))
                }).end(done)
        })
        it('Should return posts array empty if user has no posts', done => {
            reqGQL({ query: queries.posts.byUserID, variables: { id: 2 } })
                .expect(({ body }) => {
                    const { user } = body.data
                    expect(user.posts.length).toBe(0)
                }).end(done)
        })

    })
    describe('GQL: CREATE posts', () => {
        const input = { title: "my only post", caption: "balaaaaallalalala", post_content: "dftgukgjghkgiykgfviykgiykuvykuvukvikyvgij" }
        it('Should create a new post and return it if the user is authenticated', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.posts.create, variables: { input } })
                    .expect(({ body }) => {
                        expect(body).toMatchObject({
                            "data": {
                                "createPost": {
                                    "id": 4,
                                    "user_id": 2,
                                    "author": {
                                        "username": "beta"
                                    },
                                    "numLikes": 0,
                                    ...input
                                }
                            }
                        })
                    }).end(finished)
            )

        })
        it('Should not create a new post if not authenticated', done => {
            reqGQL({ query: queries.posts.create, variables: { input } })
                .expect(({ body }) => {
                    expect(body.errors).toBeTruthy()
                    const [error] = body.errors
                    expect(error.message).toBe(Errors.authentication.notLoggedIn.message)
                }).end(done)
        })
        it('Should return error if fields are left blank', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.posts.create, variables: { input: { title: input.title, post_content: input.post_content } } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeTruthy()
                        const [error] = body.errors
                        expect(error.message).toBe(Errors.posts.missingField.message)
                    }).end(finished))
        })
        it('Should create a post with tags', done => {
            const tags = ['blog', 'funny', 'lol', 'lmao']
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.posts.create, variables: { input: { ...input, tags } } })
                    .expect(({ body }) => {
                        expect(body).toMatchObject({
                            "data": {
                                "createPost": {
                                    "id": 4,
                                    "user_id": 2,
                                    "author": {
                                        "username": "beta"
                                    },
                                    "numLikes": 0,
                                    ...input
                                }
                            }
                        })
                        expect(body.data.createPost.tags.map(tag => tag.tag_name)).toEqual(tags)
                    }).end(finished)
            )
        })
    })
    describe('GQL: DELETE posts', () => {
        const input = { title: "my only post", caption: "balaaaaallalalala", post_content: "dftgukgjghkgiykgfviykgiykuvykuvukvikyvgij" }
        it('Should delete a post if the user is authenticated', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                { query: queries.posts.create, variables: { input } },
                (finished) => reqGQL({ query: queries.posts.delete, variables: { id: 4 } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeFalsy()
                        expect(body.data.deletePost).toBe(true)
                    }).end(err => {
                        if (err) finished(err);
                        reqGQL({ query: queries.posts.byId, variables: { id: 4 } })
                            .expect(({ body }) => {
                                expect(body.errors[0].message).toBe(Errors.posts.notFound.message)
                            }).end(finished)
                    }))
        })
        it('Should not delete a post that does not belong to the user', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.posts.delete, variables: { id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.deletePost).toBe(false)
                    }).end(finished)
            )
        })
        it('Should throw error if user is not authenticated', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                { query: queries.posts.create, variables: { input } },
                { query: queries.logout },
                (finished) => reqGQL({ query: queries.posts.delete, variables: { id: 4 } })
                    .expect(({ body }) => {
                        expect(body.errors[0].message).toBe(Errors.authentication.notLoggedIn.message)
                    }).end(finished))

        })
    })
    describe('GQL: UPDATE posts', () => {
        it('Should update a post', done => {
            const input = { title: 'New title', post_content: 'New Post Content lorem lorem lorem' }
            const id = 3
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.posts.update, variables: { id, input } })
                    .expect(({ body }) => {
                        expect(body).toMatchObject({
                            "data": {
                                "updatePost": {
                                    "id": 3,
                                    "user_id": 3,
                                    "author": {
                                        "username": "gamma"
                                    },
                                    caption: seedDB.posts[2][2],
                                    ...input
                                }
                            }
                        })
                    }).end(finished)
            )
        })

        it('Should not update a post that does not belong to the user', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.posts.update, variables: { id: 1, input: { caption: 'Horrible caption' } } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeTruthy()
                        const [error] = body.errors
                        expect(error.message).toBe(Errors.authorization.notAuthorized.message)
                    }).end(finished))
        })
    })
    describe('GQL: GET liked posts', () => {
        it('Should get all liked posts by user', done => {
            reqGQL({ query: queries.likes.getUserLikes, variables: { id: 1 } })
                .expect(({ body }) => {
                    body.data.user.likedPosts.forEach(post => {
                        expect(post).toMatchObject({
                            id: expect.any(Number),
                            title: expect.any(String)
                        })
                    })
                }).end(done)
        })
        it('Should return empty array if there are no likes', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                { query: queries.likes.delete, variables: { post_id: 1 } },
                { query: queries.likes.delete, variables: { post_id: 3 } },
                (finished) => reqGQL({ query: queries.likes.getUserLikes, variables: { id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.user.likedPosts).toEqual([])
                    }).end(finished)
            )
        })
    })
    describe('GQL: CREATE likes', () => {
        it('Should add a new like', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.likes.add, variables: { post_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.likePost).toBe(true)
                    }).end(finished))
        })
        it('Should not add a duplicate like', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.likes.add, variables: { post_id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.likePost).toBe(false)
                    }).end(finished))
        })
        it('Should not add a like if not authenticated', done => {
            reqGQL({ query: queries.likes.add, variables: { post_id: 2 } })
                .expect(({ body }) => {
                    expect(body.errors).toBeTruthy()
                    const [error] = body.errors
                    expect(error.message).toBe(Errors.authentication.notLoggedIn.message)
                }).end(done)
        })
    })
    describe('GQL: DELETE likes', () => {
        it('Should delete a like', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.likes.delete, variables: { post_id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.unlikePost).toBe(true)
                    }).end(finished),
            )
        })
        it('Should not return false for a like that does not exist', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.likes.delete, variables: { post_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.unlikePost).toBe(false)
                    }).end(finished),
            )
        })
        it('Should not delete a like for a user not logged in', done => {
            reqGQL({ query: queries.likes.delete, variables: { post_id: 2 } })
                .expect(({ body }) => {
                    expect(body.errors).toBeTruthy()
                    const [error] = body.errors
                    expect(error.message).toBe(Errors.authentication.notLoggedIn.message)
                }).end(done)
        })
    })
    describe('GQL: GET post with comments', () => {
        it('Should get a post and all comments', done => {
            reqGQL({ query: queries.posts.withComments.bare, variables: { post_id: 3 } })
                .expect(({ body }) => {
                    expect(body.data.post.numComments).toBe(2)
                    for (let comment of body.data.post.comments) {
                        expect(typeof comment.id).toBe('number');
                        expect(typeof comment.user_id).toBe('number');
                        expect(typeof comment.post_id).toBe('number');
                        expect(typeof comment.comment_text).toBe('string');
                        expect(typeof comment.created_at).toBe('string')
                        expect(comment.commenter).toBeTruthy()
                        expect(typeof comment.commenter.username).toBe('string')
                        expect(typeof comment.numLikes).toBe('number')
                    }
                }).end(done)
        })
        it('Should return empty array for post with no comments', done => {
            const input = { title: "my only post", caption: "balaaaaallalalala", post_content: "dftgukgjghkgiykgfviykgiykuvykuvukvikyvgij" }
            chainReqGQL(done, { query: queries.login.success[2] },
                { query: queries.posts.create, variables: { input } },
                (finished) => reqGQL({ query: queries.posts.withComments.bare, variables: { post_id: 4 } })
                    .expect(({ body }) => {
                        expect(body.data.post.comments).toEqual([])
                        expect(body.data.post.numComments).toBe(0)
                    }).end(finished))
        })
    })
    describe('GQL: GET comment (by id)', () => {
        it('Should return a commment by id', done => {
            reqGQL({ query: queries.comments.byId, variables: { id: 1 } })
                .expect(({ body: { data: { comment } } }) => {
                    expect(comment.id).toBe(1)
                    expect(comment.replies.length).toBe(3)
                }).end(done)
        })
    })
    describe('GQL: CREATE comments', () => {
        const comment_text = 'Cool post!'
        it('Should create a new comment', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.comments.create, variables: { post_id: 2, comment_text } })
                    .expect(({ body }) => {
                        expect(body.data.createComment).toMatchObject({
                            id: 4,
                            user_id: 2,
                            post_id: 2,
                            commenter: {
                                id: 2
                            },
                            tags: [],
                            comment_text,
                            numLikes: 0,
                            created_at: expect.any(String)
                        })
                    }).end(finished)
            )
        })
        it('Should not create a new comment from inauthenticated user', done => {
            chainReqGQL(done, { query: queries.login.fail },
                (finished) => reqGQL({ query: queries.comments.create, variables: { post_id: 2, comment_text } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeTruthy()
                        const [error] = body.errors
                        expect(error.message).toBe(Errors.authentication.notLoggedIn.message)
                    }).end(finished)
            )
        })
        it('Should create a new comment with tags', done => {
            const tags = ['dev', 'blog', 'FIRE']
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.comments.create, variables: { post_id: 2, comment_text, tags } })
                    .expect(({ body }) => {

                        expect(body.data.createComment).toMatchObject({
                            id: 4,
                            user_id: 2,
                            post_id: 2,
                            commenter: {
                                id: 2
                            },
                            comment_text,
                            numLikes: 0,
                            created_at: expect.any(String)

                        })
                        expect(body.data.createComment.tags.map(tag => tag.tag_name)).toEqual(expect.arrayContaining(tags.map(tag => tag.toLowerCase())))
                    }).end(finished)
            )
        })
    })
    describe('GQL: UPDATE comments', () => {
        it('Should update a comment', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.comments.update, variables: { comment_id: 1, comment_text: 'Cool post' } })
                    .expect(({ body }) => {
                        expect(body.data.updateComment).toMatchObject(
                            {
                                id: 1,
                                user_id: 3,
                                post_id: 1,
                                comment_text: 'Cool post',
                                commenter: {
                                    id: 3
                                },
                                numLikes: expect.any(Number),
                                last_updated: expect.any(String)
                            })
                    }).end(finished)
            )
        })
        it('Should not update a comment if the user is not the owner', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.comments.update, variables: { comment_id: 1, comment_text: 'Cool post' } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeTruthy()
                        const [error] = body.errors
                        expect(error.message).toBe(Errors.authorization.notAuthorized.message)
                    }).end(finished)
            )
        })
    })
    describe('GQL: DELETE comments', () => {
        it('Should delete a comment', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.comments.delete, variables: { comment_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.deleteComment).toBe(true)
                    }).end(finished)
            )
        })
        it('Should not delete a comment that does not belong to the user', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.comments.delete, variables: { comment_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.deleteComment).toBe(false)
                    }).end(finished)
            )
        })
    })
    describe('GQL: CREATE comment_likes', () => {
        it('Should create a new like', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.comments.likes.add, variables: { comment_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.likeComment).toBe(true)
                    }).end(finished)
            )
        })
        it('Should not create duplicate likes', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.comments.likes.add, variables: { comment_id: 3 } })
                    .expect(({ body }) => {
                        expect(body.data.likeComment).toBe(false)
                    }).end(finished)
            )
        })
    })
    describe('GQL: DELETE comment_likes', () => {
        it('Should delete a comment_like', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.comments.likes.delete, variables: { comment_id: 3 } })
                    .expect(({ body }) => {
                        expect(body.data.unlikeComment).toBe(true)
                    }).end(finished)
            )
        })
        it('Should return false for comment_like that does not exist', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.comments.likes.delete, variables: { comment_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.unlikeComment).toBe(false)
                    }).end(finished)
            )
        })
    })
    describe('GQL: GET posts with comments and replies', () => {
        it('Should get a post with all comments and replies', done => {
            reqGQL({ query: queries.posts.withComments.andReplies, variables: { post_id: 1 } })
                .expect(({ body }) => {
                    expect(body.data.post.comments[0].numReplies).toBe(3)
                    for (let reply of body.data.post.comments[0].replies) {
                        expect(reply).toMatchObject({
                            "id": expect.any(Number),
                            "user_id": expect.any(Number),
                            "comment_id": expect.any(Number),
                            "reply_text": expect.any(String),
                            "created_at": expect.any(String),
                            "replier": {
                                "username": expect.any(String)
                            },
                        })
                    }
                }).end(done)
        })
        it('Should return empty array for comment with no replies', done => {
            const post_id = 2;
            const comment_text = 'Kay.'
            chainReqGQL(done, { query: queries.login.success[1] },
                { query: queries.comments.create, variables: { post_id, comment_text } },
                (finished) => reqGQL({ query: queries.posts.withComments.andReplies, variables: { post_id } })
                    .expect(({ body }) => {
                        let [comment] = body.data.post.comments
                        expect(comment.numReplies).toBe(0)
                        expect(comment.replies).toEqual([])
                    }).end(finished)
            )
        })
    })

    describe('GQL: CREATE replies', () => {
        const comment_id = 1;
        const reply_text = "Yeah stop leaving unhelpful comments";
        it('Should create a new reply', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.replies.create, variables: { comment_id, reply_text } })
                    .expect(({ body }) => {

                        expect(body.data.createReply).toMatchObject({ comment_id, reply_text, replier: { username: 'alpha' } })
                    }).end(finished)
            )
        })
        it('Should not create a new reply if not authenticated', done => {
            reqGQL({ query: queries.replies.create, variables: { comment_id, reply_text } })
                .expect(({ body }) => {
                    expect(body.errors).toBeTruthy()
                    const [error] = body.errors;
                    expect(error.message).toBe(Errors.authentication.notLoggedIn.message)
                }).end(done)
        })
    })
    describe('GQL: DELETE replies', () => {
        const comment_id = 1
        const reply_id = 7
        it('Should delete a reply', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.replies.delete, variables: { reply_id } })
                    .expect(({ body }) => {
                        expect(body.data.deleteReply).toBe(true)
                    }).end(finished)
            )
        })
        it('Should not delete a reply if the user doesnt own it', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.replies.delete, variables: { reply_id } })
                    .expect(({ body }) => {
                        expect(body.data.deleteReply).toBe(false)
                    }).end(finished)
            )
        })
    })
    describe('GQL: UPDATE replies', () => {
        const comment_id = 1;
        const reply_id = 5;
        const reply_text = 'Its ok.'
        it('Should update a reply', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.replies.update, variables: { reply_text, reply_id } })
                    .expect(({ body }) => {
                        expect(body.data.updateReply)
                            .toMatchObject({
                                comment_id, reply_text,
                                id: reply_id,
                                replier: { username: 'beta' },
                                last_updated: expect.any(String)
                            })
                    }).end(finished)
            )
        })
        it('Should not update a reply not owned by the user', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.replies.update, variables: { reply_text, reply_id } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeTruthy();
                        const [error] = body.errors;
                        expect(error.message).toBe(Errors.authorization.notAuthorized.message)
                    }).end(finished)
            )
        })
    })
    describe('GQL: GET tags', () => {
        it('Should get all tags', done => {
            reqGQL({ query: queries.tags.all, variables: { input: { limit: 20 } } })
                .expect(({ body }) => {
                    for (let tag of body.data.tags.results) {
                        expect(tag).toMatchObject({
                            id: expect.any(Number),
                            tag_name: expect.any(String),
                            created_at: expect.any(String)
                        })
                    }
                }).end(done)
        })
        it('Should search all tags', done => {
            reqGQL({ query: queries.tags.all, variables: { input: { search: 'cool' } } })
                .expect(({ body }) => {
                    expect(body.data.tags.results.length).toBe(1)
                }).end(done)
        })
        it('Should get a single tag', done => {
            reqGQL({ query: queries.tags.byId, variables: { id: 1 } })
                .expect(({ body }) => {
                    expect(body.data).toMatchObject({
                        "tag": {
                            "id": 1,
                            "tag_name": "blog",
                            "created_at": expect.any(String)
                        }
                    })
                }).end(done)
        })
    })
    describe('GQL: GET post_tags', () => {
        it('Should get all tags for a given post', done => {
            reqGQL({ query: queries.posts.withTags, variables: { id: 3 } })
                .expect(({ body }) => {
                    for (let tag of body.data.post.tags) {
                        expect(tag).toMatchObject({
                            id: expect.any(Number),
                            tag_name: expect.any(String)
                        })
                    }
                }).end(done)
        })
        it('Should return empty array for posts with no tags', done => {
            const input = { title: "my only post", caption: "balaaaaallalalala", post_content: "dftgukgjghkgiykgfviykgiykuvykuvukvikyvgij" }
            chainReqGQL(done, { query: queries.login.success[1] },
                { query: queries.posts.create, variables: { input } },
                (finished) => reqGQL({ query: queries.posts.withTags, variables: { id: 4 } })
                    .expect(({ body }) => {
                        expect(body.data.post.tags).toEqual([])
                    }).end(finished)
            )
        })
    })
    describe('GQL: GET comment_tags', () => {
        it('Should get all tags for all comments on a post', done => {
            reqGQL({ query: queries.posts.withComments.andCommentTags, variables: { post_id: 1 } })
                .expect(({ body }) => {
                    for (let tag of body.data.post.comments[0].tags) {
                        expect(tag).toMatchObject({
                            id: expect.any(Number),
                            tag_name: expect.any(String)
                        })
                    }
                }).end(done)
        })
        it('Should return empty array for comment with no tags', done => {
            const post_id = 2;
            const comment_text = 'Kay.'
            chainReqGQL(done, { query: queries.login.success[1] },
                { query: queries.comments.create, variables: { post_id, comment_text } },
                (finished) => reqGQL({ query: queries.posts.withComments.andCommentTags, variables: { post_id } })
                    .expect(({ body }) => {
                        let [comment] = body.data.post.comments
                        expect(comment.tags).toEqual([])
                    }).end(finished)
            )
        })
    })
    describe('GQL: GET user_tags', () => {
        it('Should get all tags for a user', done => {
            reqGQL({ query: queries.user.byId, variables: { id: 3 } })
                .expect(({ body }) => {
                    body.data.user.tags.forEach(tag => {
                        expect(tag).toMatchObject({
                            id: expect.any(Number),
                            tag_name: expect.any(String)
                        })
                    })
                }).end(done)
        })
        it('Should return empty array for user with no tags', done => {
            const input = { username: 'delta', password: '1234567', email: 'd@w.com' }
            chainReqGQL(done, { query: queries.register, variables: { input } },
                (finished) => reqGQL({ query: queries.user.byId })
                    .expect(({ body }) => {
                        expect(body.data.user.tags).toEqual([])
                    }).end(finished)
            )
        })
    })
    describe('GQL: UPDATE (add & delete) post_tags', () => {
        it("Should add to a post's tags", done => {
            const input = {
                title: 'New title', post_content: 'New Post Content lorem lorem lorem',
                modTags: { addTags: ['lol', 'fire'], deleteTags: [] }
            }
            const id = 1
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.posts.update, variables: { id, input } })
                    .expect(({ body }) => {
                        expect(body).toMatchObject({
                            "data": {
                                "updatePost": {
                                    id,
                                    "user_id": 1,
                                    "author": {
                                        "username": "alpha"
                                    },
                                    caption: seedDB.posts[0][2],
                                    title: input.title,
                                    post_content: input.post_content,
                                }
                            }
                        })
                        expect(body.data.updatePost.tags.map(tag => tag.tag_name)).toEqual(['blog', 'cool', 'beautiful', 'amazing', 'dev', 'lol', 'fire'])
                    }).end(finished)
            )
        })
        it("Should delete from a post's tags", done => {
            const input = {
                title: 'New title', post_content: 'New Post Content lorem lorem lorem',
                modTags: { deleteTags: ['blog', 'cool'], addTags: [] }
            }
            const id = 1
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.posts.update, variables: { id, input } })
                    .expect(({ body }) => {
                        expect(body).toMatchObject({
                            "data": {
                                "updatePost": {
                                    id,
                                    "user_id": 1,
                                    "author": {
                                        "username": "alpha"
                                    },
                                    caption: seedDB.posts[0][2],
                                    title: input.title,
                                    post_content: input.post_content,
                                }
                            }
                        })
                        expect(body.data.updatePost.tags.map(tag => tag.tag_name)).toEqual(['beautiful', 'amazing', 'dev'])
                    }).end(finished)
            )
        })
        it("Should update a post's tags", done => {
            const input = {
                title: 'New title', post_content: 'New Post Content lorem lorem lorem',
                modTags: { deleteTags: ['blog', 'cool'], addTags: ['lol', 'fire'] }
            }
            const id = 1
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.posts.update, variables: { id, input } })
                    .expect(({ body }) => {
                        expect(body).toMatchObject({
                            "data": {
                                "updatePost": {
                                    id,
                                    "user_id": 1,
                                    "author": {
                                        "username": "alpha"
                                    },
                                    caption: seedDB.posts[0][2],
                                    title: input.title,
                                    post_content: input.post_content,
                                }
                            }
                        })
                        expect(body.data.updatePost.tags.map(tag => tag.tag_name)).toEqual(['beautiful', 'amazing', 'dev', 'lol', 'fire'])
                    }).end(finished)
            )
        })
    })
    describe('GQL: UPDATE(add & delete) comment tags', () => {
        it('Should add tags to a comment', done => {
            const modTags = { addTags: ['lol', 'LOL', 'fire'], deleteTags: [] }
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.comments.update, variables: { comment_id: 1, comment_text: 'Cool post', modTags } })
                    .expect(({ body }) => {
                        expect(body.data.updateComment).toMatchObject(
                            {
                                id: 1,
                                user_id: 3,
                                post_id: 1,
                                comment_text: 'Cool post',
                                commenter: {
                                    id: 3
                                },
                                numLikes: expect.any(Number),
                                last_updated: expect.any(String)
                            })
                        expect(body.data.updateComment.tags.map(tag => tag.tag_name))
                            .toEqual(expect.arrayContaining(modTags.addTags.map(tag => tag.toLowerCase())))
                    }).end(finished)
            )
        })
        it('Should delete tags from a comment', done => {
            const modTags = { addTags: [], deleteTags: ['magic'] }
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.comments.update, variables: { comment_id: 1, comment_text: 'Cool post', modTags } })
                    .expect(({ body }) => {
                        expect(body.data.updateComment).toMatchObject(
                            {
                                id: 1,
                                user_id: 3,
                                post_id: 1,
                                comment_text: 'Cool post',
                                commenter: {
                                    id: 3
                                },
                                numLikes: expect.any(Number),
                                last_updated: expect.any(String)
                            })
                        expect(body.data.updateComment.tags.map(tag => tag.tag_name))
                            .toEqual(expect.not.arrayContaining(modTags.deleteTags))
                    }).end(finished)
            )
        })
        it('Should update comment tags', done => {
            const modTags = { addTags: ['lol', 'LOL', 'fire'], deleteTags: ['magic'] }
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.comments.update, variables: { comment_id: 1, comment_text: 'Cool post', modTags } })
                    .expect(({ body }) => {
                        expect(body.data.updateComment).toMatchObject(
                            {
                                id: 1,
                                user_id: 3,
                                post_id: 1,
                                comment_text: 'Cool post',
                                commenter: {
                                    id: 3
                                },
                                numLikes: expect.any(Number),
                                last_updated: expect.any(String)
                            })
                        expect(body.data.updateComment.tags.map(tag => tag.tag_name))
                            .toEqual(expect.not.arrayContaining(modTags.deleteTags))
                        expect(body.data.updateComment.tags.map(tag => tag.tag_name))
                            .toEqual(expect.arrayContaining(modTags.addTags.map(tag => tag.toLowerCase())))
                    }).end(finished)
            )
        })
    })
    describe('GQL: UPDATE(add & delete) user_tags', () => {
        it('Should add user tags', done => {
            const modTags = {
                addTags: ['kool', 'LOL'],
                deleteTags: []
            }
            chainReqGQL(done, { query: queries.login.success[0] },
                { query: queries.profile.update, variables: { input: { modTags } } },
                (finished) => reqGQL({ query: queries.user.byId, variables: { id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.user.tags.map(tag => tag.tag_name)).toEqual(expect.arrayContaining(modTags.addTags.map(tag => tag.toLowerCase())))
                    }).end(finished)
            )
        })
        it('Should delete user tags', done => {
            const modTags = {
                addTags: [],
                deleteTags: ['cool']
            }
            chainReqGQL(done, { query: queries.login.success[0] },
                { query: queries.profile.update, variables: { input: { modTags } } },
                (finished) => reqGQL({ query: queries.user.byId, variables: { id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.user.tags.map(tag => tag.tag_name)).toEqual(expect.not.arrayContaining(modTags.deleteTags))
                    }).end(finished)
            )
        })
        it('Should update user tags', done => {
            const modTags = {
                addTags: ['kool', 'LOL'],
                deleteTags: ['cool']
            }
            chainReqGQL(done, { query: queries.login.success[0] },
                { query: queries.profile.update, variables: { input: { modTags } } },
                (finished) => reqGQL({ query: queries.user.byId, variables: { id: 1 } })
                    .expect(({ body }) => {
                        const tags = body.data.user.tags.map(tag => tag.tag_name)
                        expect(tags).toEqual(expect.arrayContaining(modTags.addTags.map(tag => tag.toLowerCase())))
                        expect(tags).toEqual(expect.not.arrayContaining(modTags.deleteTags))
                    }).end(finished)
            )
        })
    })
    describe('GQL: GET tag associations', done => {
        it('Should get all associations of a tag', done => {
            reqGQL({ query: queries.tags.byIdWithAssociations, variables: { id: 2 } })
                .expect(({ body }) => {
                    const { users, posts, comments } = body.data.tag
                    users.forEach(user => {
                        expect(user).toMatchObject({
                            id: expect.any(Number),
                            username: expect.any(String),
                            email: expect.any(String),
                            created_at: expect.any(String)
                        })
                    })
                    posts.forEach(post => {
                        expect(post).toMatchObject({
                            id: expect.any(Number),
                            title: expect.any(String),
                            caption: expect.any(String),
                            post_content: expect.any(String),
                            created_at: expect.any(String)
                        })
                    })
                    comments.forEach(comment => {
                        expect(comment).toMatchObject({
                            id: expect.any(Number),
                            comment_text: expect.any(String),
                            user_id: expect.any(Number),
                            post_id: expect.any(Number),
                            created_at: expect.any(String)
                        })
                    })
                }).end(done)
        })
    })
    describe('GQL: GET followers and following', done => {
        it('Should get a users followers and following', done => {
            reqGQL({ query: queries.user.byId, variables: { id: 1 } })
                .expect(({ body }) => {
                    body.data.user.followers.forEach(follower => {
                        expect(follower).toMatchObject({
                            id: expect.any(Number),
                            username: expect.any(String),
                            followed_at: expect.any(String)
                        })
                    })
                    body.data.user.following.forEach(followee => {
                        expect(followee).toMatchObject({
                            id: expect.any(Number),
                            username: expect.any(String),
                            followed_at: expect.any(String)
                        })
                    })
                }).end(done)
        })
        it('Should return empty arrays if user has no followers/following', done => {
            const input = { username: 'delta', password: '1234567', email: 'd@w.com' }
            chainReqGQL(done, { query: queries.register, variables: { input } },
                (finished) => reqGQL({ query: queries.user.byId, variables: { id: 4 } })
                    .expect(({ body: { data: { user: { followers, following, numFollowers, numFollowing } } } }) => {
                        expect(followers.length).toBe(0)
                        expect(following.length).toBe(0)
                        expect(numFollowers).toBe(0)
                        expect(numFollowing).toBe(0)
                    }).end(finished)
            )
        })
        it('Should tell if a user is a followee/follower of another user', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.follows.getFollowBools, variables: { input: {} } })
                    .expect(({ body }) => {
                        for (let user of body.data.users.results) {
                            if (user.id === 1) {
                                expect(user.imFollowing).toBe(false)
                                expect(user.followingMe).toBe(false)
                            }
                            if (user.id === 2) {
                                expect(user.imFollowing).toBe(false)
                                expect(user.followingMe).toBe(true)
                            }
                            if (user.id === 3) {
                                expect(user.imFollowing).toBe(true)
                                expect(user.followingMe).toBe(true)
                            }
                        }
                    }).end(finished)
            )
        })
    })
    describe('GQL: CREATE follows', () => {
        it('Should create a new follow', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.follows.create, variables: { user_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.createFollow).toBe(true)
                    }).end(finished)
            )
        })
        it('Should not create a duplicate follow', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                { query: queries.follows.create, variables: { user_id: 2 } },
                (finished) => reqGQL({ query: queries.follows.create, variables: { user_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.createFollow).toBe(false)
                    }).end(finished)
            )
        })
        it('Should not allow a user to follow themselves', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.follows.create, variables: { user_id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.createFollow).toBe(false)
                    }).end(finished)
            )
        })
    })
    describe('GQL: DELETE follows', () => {
        it('Should delete a follow', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.follows.delete, variables: { user_id: 3 } })
                    .expect(({ body }) => {
                        expect(body.data.deleteFollow).toBe(true)
                    }).end(finished)
            )
        })
        it('Should return false for follow that does not exist', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.follows.delete, variables: { user_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.deleteFollow).toBe(false)
                    }).end(finished)
            )
        })
    })
    describe('GQL: MY LIKES', () => {
        it('Should return whether an authenticated user likes posts/comments', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.likes.myLikes, variables: { input: {} } })
                    .expect(({ body }) => {
                        body.data.posts.results.forEach(post => {
                            expect(typeof post.iLike).toBe('boolean')
                            post.comments.forEach(comment => {
                                expect(typeof comment.iLike).toBe('boolean')
                            })
                        })
                    }).end(finished)
            )
        })
        it('Should return false for all fields without authentication', done => {
            reqGQL({ query: queries.likes.myLikes, variables: { input: {} } })
                .expect(({ body }) => {
                    body.data.posts.results.forEach(post => {
                        expect(post.iLike).toBe(false)
                        post.comments.forEach(comment => {
                            expect(comment.iLike).toBe(false)
                        })
                    })
                }).end(done)
        })
    })
    describe('GQL: SEARCH comments', () => {
        it('Should return comments matching the search', done => {
            reqGQL({ query: queries.comments.search, variables: { input: { limit: 2, tags: ["cool", "trash", "beautiful"] } } })
                .expect(({ body }) => {
                    expect(body.data.comments.cursor).toBe(2)
                    expect(body.data.comments.results.length).toBe(2)
                }).end(done)
        })
    })
    describe('GQL: NOTIFICATIONS,', () => {
        it('Should get the last visit time of a user', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.lastVisited })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                    }).end(finished)
            )
        })
        it('Should return null authenticated time if user is not authenticated', done => {
            reqGQL({ query: queries.notifications.all })
                .expect(({ body: { data: { notifications: { lastVisited, newPosts, newComments, newLikes, newCommentLikes, newReplies, newFollowers } } } }) => {
                    expect(lastVisited).toBe(null)
                    expect(newPosts).toEqual([])
                    expect(newComments).toEqual([])
                    expect(newLikes).toEqual([])
                    expect(newCommentLikes).toEqual([])
                    expect(newReplies).toEqual([])
                    expect(newFollowers).toEqual([])
                }).end(done)
        })
        it('Should get the latest posts from the users following', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.newPosts })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                        expect(body.data.notifications.newPosts.length).toBeGreaterThan(0)
                        for (let post of body.data.notifications.newPosts) {
                            expect(post).toMatchObject({
                                id: expect.any(Number),
                                title: expect.any(String),
                                caption: expect.any(String),
                                user_id: expect.any(Number),
                                post_content: expect.any(String),
                                created_at: expect.any(String)
                            })
                        }
                    }).end(finished)
            )
        })
        it('Should get the latest comments on the users posts', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.newComments })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                        expect(body.data.notifications.newComments.length).toBeGreaterThan(0)
                        for (let comment of body.data.notifications.newComments) {
                            expect(comment).toMatchObject({
                                id: expect.any(Number),
                                comment_text: expect.any(String),
                                user_id: expect.any(Number),
                                post_id: expect.any(Number),
                                created_at: expect.any(String)
                            })
                        }
                    }).end(finished)
            )
        })
        it('Should get the latest likes on the users posts', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.newLikes })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                        expect(body.data.notifications.newLikes.length).toBeGreaterThan(0)
                        for (let like of body.data.notifications.newLikes) {
                            expect(like).toMatchObject({
                                user: {
                                    id: expect.any(Number),
                                    username: expect.any(String)
                                },
                                post: {
                                    id: expect.any(Number),
                                    title: expect.any(String)
                                },
                                liked_at: expect.any(String)
                            })
                        }
                    }).end(finished)
            )
        })
        it('Should get the latest likes on the users comments', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.newCommentLikes })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                        expect(body.data.notifications.newCommentLikes.length).toBeGreaterThan(0)
                        for (let commentLike of body.data.notifications.newCommentLikes) {
                            expect(commentLike).toMatchObject({
                                user: {
                                    id: expect.any(Number),
                                    username: expect.any(String)
                                },
                                comment: {
                                    id: expect.any(Number),
                                    comment_text: expect.any(String)
                                },
                                liked_at: expect.any(String)
                            })
                        }
                    }).end(finished)
            )
        })
        it('Should get the latest replies on the users comments', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.newReplies })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                        expect(body.data.notifications.newReplies.length).toBeGreaterThan(0)
                        for (let reply of body.data.notifications.newReplies) {
                            expect(reply).toMatchObject({
                                id: expect.any(Number),
                                reply_text: expect.any(String),
                                comment_id: expect.any(Number)
                            })
                        }
                    }).end(finished)
            )
        })
        it('Should get the latest followers', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.newFollowers })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                        expect(body.data.notifications.newFollowers.length).toBeGreaterThan(0)
                        for (let follower of body.data.notifications.newFollowers) {
                            expect(follower).toMatchObject({
                                user: {
                                    id: expect.any(Number),
                                    username: expect.any(String)
                                },
                                followed_at: expect.any(String)
                            })
                        }
                    }).end(finished)
            )
        })
        it('Should get the users featured posts', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.notifications.featuredPosts })
                    .expect(({ body }) => {
                        expect(typeof body.data.notifications.lastVisited).toBe('number')
                        expect(body.data.notifications.featuredPosts.length).toBe(1)
                        expect(body.data.notifications.featuredPosts[0]).toMatchObject({
                            post: {
                                id: 1,
                            },
                            featured_at: expect.any(String)
                        })
                    }).end(finished)
            )
        })
    })
    describe('GQL: ADMIN', () => {
        it('Should return false if a user is not an admin', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.admin.isAdmin })
                    .expect(({ body }) => {
                        expect(body.data.isAdmin).toBe(false)
                    }).end(finished)
            )

        })
        it('Should return true if a user is an admin', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.admin.isAdmin })
                    .expect(({ body }) => {
                        expect(body.data.isAdmin).toBe(true)
                    }).end(finished)
            )
        })
    })
    describe('GQL: Feature', () => {
        it('Should return featured posts', done => {
            reqGQL({ query: queries.posts.all, variables: { input: { featured: true } } })
                .expect(({ body }) => {
                    expect(body.data.posts.results.length).toBe(1)
                    expect(body.data.posts.results[0]).toMatchObject({
                        id: 1,
                        featured: true,
                        featured_at: expect.any(String)
                    })
                }).end(done)
        })
    })
    describe('GQL: Add Featured Posts', () => {
        it('Should allow an admin feature a new post', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.admin.featurePost, variables: { id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.featurePost).toBe(true)
                    }).end(finished)
            )
        })
        it('Should get all featured posts after adding', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                { query: queries.admin.featurePost, variables: { id: 2 } },
                (finished) => reqGQL({ query: queries.posts.all, variables: { input: { featured: true } } })
                    .expect(({ body }) => {
                        expect(body.data.posts.results.length).toBe(2)
                        for (let post of body.data.posts.results) {
                            expect(post).toMatchObject({
                                featured: true,
                                featured_at: expect.any(String)
                            })
                        }
                    }).end(finished)
            )
        })
        it('Should not allow non-admin to feature posts', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.admin.featurePost, variables: { id: 2 } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeTruthy()
                        const [{ message }] = body.errors
                        expect(message).toBe(Errors.authorization.notAuthorized.message)
                    }).end(finished)
            )
        })
    })
    describe('GQL: Remove Featured Posts', () => {
        it('Should allow an admin to unfeature a post', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                (finished) => reqGQL({ query: queries.admin.unfeaturePost, variables: { id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.unfeaturePost).toBe(true)
                    }).end(finished)
            )
        })
        it('Should get all feautured posts after adding', done => {
            chainReqGQL(done, { query: queries.login.success[2] },
                { query: queries.admin.unfeaturePost, variables: { id: 1 } },
                (finished) => reqGQL({ query: queries.posts.all, variables: { input: { featured: true } } })
                    .expect(({ body }) => {
                        expect(body.data.posts.results.length).toBe(0)
                    }).end(finished)
            )
        })
        it('Should not allow a non admin to unfeature a post', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.admin.unfeaturePost, variables: { id: 1 } })
                    .expect(({ body }) => {
                        expect(body.errors).toBeTruthy()
                        const [{ message }] = body.errors
                        expect(message).toBe(Errors.authorization.notAuthorized.message)
                    }).end(finished)
            )
        })
    })
    describe('GQL: secretQuestion', () => {
        it('Should get the secret question for the user', done => {
            reqGQL({ query: queries.passwordReset.question, variables: { username: 'alpha' } })
                .expect(({ body }) => {
                    expect(body.data.secretQuestion).toBeTruthy()
                    expect(body.data.secretQuestion.id).toBe(1)
                    expect(typeof body.data.secretQuestion.question).toBe('string')
                }).end(done)
        })
    })
    describe('GQL: passwordReset', () => {
        it('Should return true for a correct answer', done => {
            reqGQL({ query: queries.passwordReset.answer, variables: { id: 1, secretAnswer: 'alpha', newPassword: 'newpassword' } })
                .expect(({ body }) => {
                    expect(body.data.passwordReset).toBe(true)
                }).end(done)
        })
        it('Should return false for a wrong answer', done => {
            reqGQL({ query: queries.passwordReset.answer, variables: { id: 1, secretAnswer: 'beta', newPassword: 'newpassword' } })
                .expect(({ body }) => {
                    expect(body.data.passwordReset).toBe(false)
                }).end(done)
        })
        it('Should reset the password of the user', done => {
            chainReqGQL(done, { query: queries.passwordReset.answer, variables: { id: 1, secretAnswer: 'alpha', newPassword: 'newpassword' } },
                (finished) => reqGQL({ query: queries.login.custom, variables: { username: 'alpha', password: 'newpassword' } })
                    .expect(({ body }) => {
                        expect(body.data.login).toBe(true)
                    }).end(finished)
            )
        })
    })
    describe('GQL: createSecret', () => {
        it('Should create a new secret after the user has registered', done => {
            chainReqGQL(done, { query: queries.register, variables: { input: { username: 'delta', password: '4', email: 'delta@w.com' } } },
                (finished) => reqGQL({ query: queries.passwordReset.createSecret, variables: { question: 'What is your name', answer: 'delta' } })
                    .expect(({ body }) => {
                        expect(body.data.createSecret).toBe(true)
                    }).end(finished)
            )
        })
        it('Should allow the new user to change their password', done => {
            chainReqGQL(done, { query: queries.register, variables: { input: { username: 'delta', password: '4', email: 'delta@w.com' } } },
                { query: queries.passwordReset.createSecret, variables: { question: 'What is your name', answer: 'delta' } },
                { query: queries.logout },
                { query: queries.passwordReset.answer, variables: { id: 4, secretAnswer: 'delta', newPassword: 'newpassword' } },
                (finished) => reqGQL({ query: queries.login.custom, variables: { username: 'delta', password: 'newpassword' } })
                    .expect(({ body }) => {
                        expect(body.data.login).toBe(true)
                    }).end(finished)
            )
        })
    })

}