require('dotenv').config()
module.exports = {
    publicRuntimeConfig: {
        PORT: process.env.PORT,
        HOST: process.env.HOST,
        HTTP: process.env.HTTP,
        WS: process.env.WS
    }
}