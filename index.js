const next = require('next')
const express = require('express')
const app = express()
const { ApolloServer } = require('apollo-server-express')
const session = require('express-session')
const typeDefs = require('./gql/schema');
const resolvers = require('./gql/resolvers')
const applyLoaders = require('./gql/batch')
const moment = require('moment')
const { queryDB } = require('./db/connect')
const dev = process.env.NODE_ENV !== 'production'
const test = process.env.NODE_ENV === 'test'
let port = process.env.PORT || 3000

const nextApp = next({ dev, dir: __dirname })
const apollo = new ApolloServer({
    typeDefs, resolvers, context: ctx => {
        let user;
        try {
            user = ctx.req.session.user.id
        } catch (e) {
            user = null
        }
        console.log('-------------------------------')
        console.log(user, ctx.req.session.id)
        console.log(ctx.req.body.operationName, ctx.req.body.variables, moment(Date.now()).format('hh:mm:ss'))

        return applyLoaders(ctx)
    }, uploads: test
})
const initializeServer = (app, productionEnv = false) => {
    return (done = null) => {
        nextApp.prepare()
            .then(() => {
                app.use(session({
                    name: 'glob-session',
                    secret: process.env.SESSION_SECRET,
                    resave: false,
                    saveUninitialized: true,
                    cookie: {
                        secure: productionEnv,
                        maxAge: !test ? 1000 * 60 * 60 * 24 * 30 : 60000
                    }
                }))
                if (productionEnv) { app.set('trust proxy', 1) }
                apollo.applyMiddleware({ app })
                app.get('/', (req, res) => {
                    nextApp.render(req, res, '/')
                })
                app.get('/profile', (req, res) => {
                    const { query } = req
                    nextApp.render(req, res, '/profile', query)
                })
                app.get('/posts', (req, res) => {
                    const { query } = req;
                    nextApp.render(req, res, '/posts', query)
                })
                app.get('/posts/new', (req, res) => {
                    nextApp.render(req, res, '/new')
                })
                app.get('/posts/edit', (req, res) => {
                    const { query } = req
                    nextApp.render(req, res, '/edit', query)
                })
                app.get('/search', (req, res) => {
                    const { query } = req
                    nextApp.render(req, res, '/search', query)
                })
                app.get('*', (req, res) => {
                    nextApp.render(req, res, '/')
                })


                app.listen(port, () => {
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
    queryDB(`USE blog`).then(() => initializeServer(app, !dev)()).catch(e => console.log(e))
}

module.exports = { nextApp, port, initializeServer, app }


