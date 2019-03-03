require('dotenv').config()
module.exports = {
    serverRuntimeConfig: {
        mySecret: 'secret'
    },
    publicRuntimeConfig: {
        PORT: process.env.PORT,
        HOST: process.env.HOST,
        HTTP: process.env.HTTP
    }
}