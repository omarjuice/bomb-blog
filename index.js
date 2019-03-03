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
const { queryDB } = require('./db/connect')
const { database } = require('./config')
require('mkdirp').sync('./static/uploads')
const dev = process.env.NODE_ENV !== 'production'
const test = process.env.NODE_ENV === 'test'
let port = process.env.PORT
const nextApp = next({ dev, dir: __dirname })


const schema = makeExecutableSchema({ typeDefs, resolvers })
const apollo = new ApolloServer({
    schema, context: ctx => {
        if (dev) {
            require('./file').printContext(ctx)
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
    queryDB(`USE ${database}`, null, null, true).then(() => initializeServer(app, !dev)()).catch(e => console.log(e))
}

module.exports = { nextApp, port, initializeServer, app, }


