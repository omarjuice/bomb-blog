const http = require('http')
const next = require('next')
const express = require('express')
const app = express()
const { ApolloServer, makeExecutableSchema } = require('apollo-server-express')
const { graphqlUploadExpress } = require('graphql-upload')
const session = require('express-session')
const createRoutes = require('./routes')
const MySQLStore = require('express-mysql-session')(session)
const typeDefs = require('./gql/schema');
const resolvers = require('./gql/resolvers')
const applyLoaders = require('./gql/batch')
const { queryDB, db } = require('./db/connect')
const { database } = require('./config')
const dev = process.env.NODE_ENV !== 'production'
const test = process.env.NODE_ENV === 'test'
let port = process.env.PORT
const nextApp = next({ dev, dir: __dirname })


const schema = makeExecutableSchema({ typeDefs, resolvers })
const apollo = new ApolloServer({
    schema, context: ctx => {
        if (dev || process.env.LOGGING === 'enabled') {
            require('./utils/printContext')(ctx)
        }
        return applyLoaders(ctx)
    }, uploads: false
})
const initializeServer = (app, productionEnv = false) => {
    nextApp.prepare()
        .then(() => {
            if (productionEnv) {
                app.use((req, res, next) => {
                    if (req.secure) {
                        next();
                    } else {
                        res.redirect('https://' + req.headers.host + req.url);
                    }
                });
            }
            app.use(graphqlUploadExpress({ maxFileSize: 10000000 }))
            app.use(session({
                name: 'blog-session',
                store: productionEnv ? new MySQLStore({ expiration: 1000 * 60 * 60 * 24 * 30 }, db) : null,
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: true,
                cookie: {
                    secure: productionEnv,
                    maxAge: !test ? 1000 * 60 * 60 * 24 * 30 : 60000
                }
            }))
            app.use((req, _, next) => {
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
            app.use(createRoutes(nextApp))
            const httpServer = http.createServer(app)
            apollo.installSubscriptionHandlers(httpServer)
            httpServer.listen(port, () => {
                console.log(`Listening on port ${port}`, apollo.graphqlPath)
            })
        })
        .catch(console.error)
}
if (test) {
    port++
} else {
    queryDB(`USE ${database}`).then(() => initializeServer(app, !dev)).catch(e => console.log(e))
}

module.exports = { nextApp, port, initializeServer, app, }


