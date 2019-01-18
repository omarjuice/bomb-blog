module.exports = function () {
    const expect = require('expect');
    const request = require('supertest')
    const express = require('express')
    const { ApolloServer } = require('apollo-server-express')
    const session = require('express-session')
    const app = express()
    const { port } = require('../')
    const queries = require('./testQueries')
    const typeDefs = require('../gql/schema')
    const resolvers = require('../gql/resolvers')
    const Errors = require('../gql/errors')
    const { seedDB, resetDB, resetTables } = require('./seed')
    const { queryDB } = require('../db/connect')
    const applyLoaders = require('../gql/batch')

    const apollo = new ApolloServer({ typeDefs, resolvers, context: (ctx) => applyLoaders(ctx), uploads: true })
    let agent;
    before(done => {
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
    const chainReqGQL = function (done, ...reqs) {
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
        it('Should not log in a user that does not exist', done => {
            const query = queries.user.notFound
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
                { query: queries.profile.update, variables: { input: { about } } },
                (finished) => reqGQL({ query: queries.profile.get })
                    .expect(({ body }) => {
                        expect(body.data.user.profile).toMatchObject({ about, photo_path: seedDB.profiles[0][2] })
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
        it('Should get all posts and the author', done => {
            queryDB(`INSERT INTO posts (user_id, title, caption, created_at, post_content) VALUES ?`, [seedDB.manyPosts(100)])
                .then(() => {
                    const limit = 103;
                    const order = true;
                    const orderBy = 'created_at';
                    reqGQL({ query: queries.posts.all, variables: { limit, order, orderBy } })
                        .expect(({ body }) => {
                            body.data.posts.forEach(({ id, title, caption, user_id, author, numLikes }) => {
                                expect(typeof id).toBe('number')
                                expect(typeof user_id).toBe('number')
                                expect(typeof title).toBe('string')
                                expect(typeof caption).toBe('string')
                                expect(typeof author.username).toBe('string')
                                expect(typeof numLikes).toBe('number')
                            })
                            expect(body.data.posts.length).toBe(103)
                        }).end(done)
                }).catch(e => done(e))
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
    describe('GQL: CREATE likes', () => {
        it('Should add a new like', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.likes.add, variables: { post_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.addLike).toBe(true)
                    }).end(finished))
        })
        it('Should not add a duplicate like', done => {
            chainReqGQL(done, { query: queries.login.success[0] },
                (finished) => reqGQL({ query: queries.likes.add, variables: { post_id: 1 } })
                    .expect(({ body }) => {
                        expect(body.data.addLike).toBe(false)
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
                        expect(body.data.deleteLike).toBe(true)
                    }).end(finished),
            )
        })
        it('Should not return false for a like that does not exist', done => {
            chainReqGQL(done, { query: queries.login.success[1] },
                (finished) => reqGQL({ query: queries.likes.delete, variables: { post_id: 2 } })
                    .expect(({ body }) => {
                        expect(body.data.deleteLike).toBe(false)
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
                        expect(typeof comment.created_at).toBe('string');

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
    // describe('GQL: ')


}