const http = require('http')
const next = require('next')
const express = require('express')
const app = express()
const { ApolloServer, makeExecutableSchema } = require('apollo-server-express')
const { graphqlUploadExpress } = require('graphql-upload')
const session = require('express-session')
const typeDefs = require('./gql/schema');
const resolvers = require('./gql/resolvers')
const applyLoaders = require('./gql/batch')
const moment = require('moment')
const { queryDB } = require('./db/connect')
const { database } = require('./config')
require('mkdirp').sync('./static/uploads')

const dev = process.env.NODE_ENV !== 'production'
const test = process.env.NODE_ENV === 'test'
let port = process.env.PORT || 3000
const nextApp = next({ dev, dir: __dirname })


const schema = makeExecutableSchema({ typeDefs, resolvers })
const apollo = new ApolloServer({
    schema, context: ctx => {
        let user, id, operationName, variables, lastVisited, visited;
        try {
            user = ctx.req.session.user.id
        } catch (e) {
            user = null
        }
        try {
            id = ctx.req.session.id
        } catch (e) {
            id = null
        }
        try {
            operationName = ctx.req.body.operationName
        } catch (e) {
            operationName = null
        }
        try {
            variables = ctx.req.body.variables
        } catch (e) {
            variables = null
        }
        try {
            lastVisited = ctx.req.session.user.lastVisited
        } catch (e) {
            lastVisited = null
        }
        try {
            visited = ctx.req.session.user.visited
        } catch (e) {
            visited = null
        }

        if (ctx.connection) {
            console.log('--------------connection-----------------')
            console.log(ctx.connection.operationName, ctx.connection.variables, moment(Date.now()).format('hh:mm:ss'))
        } else {
            console.log('--------------request-----------------')
            console.log('VISITED: ', visited && moment(visited).format('hh:mm:ss'), ' LAST VISITED: ', lastVisited && moment(lastVisited).format('hh:mm:ss'))
            console.log(user, id)
            console.log(operationName, variables, moment(Date.now()).format('hh:mm:ss'))
        }

        return applyLoaders(ctx)
    }, uploads: false
})
const initializeServer = (app, productionEnv = false) => {
    return (done = null) => {
        nextApp.prepare()
            .then(() => {
                app.use(graphqlUploadExpress({ maxFileSize: 10000000 }))
                app.use(session({
                    name: 'blog-session',
                    secret: process.env.SESSION_SECRET,
                    resave: false,
                    saveUninitialized: true,
                    cookie: {
                        secure: productionEnv,
                        maxAge: !test ? 1000 * 60 * 60 * 24 * 30 : 60000
                    }
                }))
                app.use((req, res, next) => {
                    if (req.session.user) {
                        if (req.session.user.visited) {
                            if (Date.now() / 1000 - req.session.user.visited > 86400) {
                                req.session.user.lastVisited = req.session.user.visited
                            }
                        }
                        req.session.user.visited = Math.floor(Date.now() / 1000)
                    }
                    next()
                })
                if (productionEnv) { app.set('trust proxy', 1) }
                apollo.applyMiddleware({ app })
                app.get('/', (req, res) => {

                    nextApp.render(req, res, '/')
                })
                app.get('/posts/new', (req, res) => {
                    nextApp.render(req, res, '/new')
                })
                app.get('/posts/edit', (req, res) => {
                    const { query } = req
                    nextApp.render(req, res, '/edit', query)
                })
                app.get('/profile', (req, res) => {
                    const { query } = req
                    nextApp.render(req, res, '/profile', query)
                })
                app.get('/profile/:slug', (req, res) => {
                    const { query } = req
                    nextApp.render(req, res, '/profile', query)
                })
                app.get('/posts', (req, res) => {
                    const { query } = req;
                    nextApp.render(req, res, '/posts', query)
                })
                app.get('/posts/:slug', (req, res) => {
                    const { query } = req;
                    nextApp.render(req, res, '/posts', query)
                })
                app.get('/search', (req, res) => {
                    const { query } = req
                    nextApp.render(req, res, '/search', query)
                })
                app.get('*', (req, res) => {
                    nextApp.render(req, res, '/')
                })
                const httpServer = http.createServer(app)
                apollo.installSubscriptionHandlers(httpServer)

                httpServer.listen(port, () => {
                    console.log(`Listening on port ${port}`, apollo.graphqlPath)
                    if (done) {
                        done()
                    }
                })

            })
            .catch(console.error)
    }

}
if (test) {
    port++
} else {
    queryDB(`USE ${database}`).then(() => initializeServer(app, !dev)()).catch(e => console.log(e))
}

module.exports = { nextApp, port, initializeServer, app, }


