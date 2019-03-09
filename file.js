const moment = require('moment')

const printContext = (ctx) => {
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
}
module.exports = { printContext }