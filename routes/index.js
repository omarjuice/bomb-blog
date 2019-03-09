module.exports = function (nextApp) {
    const router = require('express').Router()
    router.get('/', (req, res) => {
        nextApp.render(req, res, '/')
    })
    router.get('/posts/new', (req, res) => {
        nextApp.render(req, res, '/new')
    })
    router.get('/posts/edit', (req, res) => {
        const { query } = req
        nextApp.render(req, res, '/edit', query)
    })
    router.get('/profile', (req, res) => {
        const { query } = req
        nextApp.render(req, res, '/profile', query)
    })
    router.get('/profile/:slug', (req, res) => {
        const { query } = req
        nextApp.render(req, res, '/profile', query)
    })
    router.get('/posts', (req, res) => {
        const { query } = req;
        nextApp.render(req, res, '/posts', query)
    })
    router.get('/posts/:slug', (req, res) => {
        const { query } = req;
        nextApp.render(req, res, '/posts', query)
    })
    router.get('/search', (req, res) => {
        const { query } = req
        nextApp.render(req, res, '/search', query)
    })
    router.get('*', (req, res) => {
        nextApp.render(req, res, '/')
    })
    return router
}