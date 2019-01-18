const bcrypt = require('bcryptjs');
const hashPW = (password) => {
    return bcrypt.hash(password, 10)
}
const hashUser = (users) => {
    return new Promise((resolve, reject) => {
        users.forEach((user) => {
            hashPW(user[2])
                .then((hash) => {
                    user[2] = `${hash}`
                    resolve(users)
                }).catch(e => reject(e))

        })
    })
}
const compare = (password, hash) => bcrypt.compare(password, hash)

module.exports = { hashPW, compare, hashUser }