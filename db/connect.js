const mysql = require('mysql');

const { user, password, host, multipleStatements } = require('../config');
const db = mysql.createConnection({ user, password, host, multipleStatements })
const queryDB = (query, obj = null, before = null, bool = false) => {
    return new Promise((resolve, reject) => {
        const makeQuery = (Obj) => db.query(query, Obj, (err, res) => {
            if (err) {
                reject(err)
            }
            resolve(res)
        })
        if (before) {
            before(...obj).then((newObj) => {
                const result = makeQuery([newObj])
                if (bool) console.log(result.sql)
            }).catch(e => reject(e))
        } else {
            const result = makeQuery(obj)
            if (bool) console.log(result.sql)
        }
    })
}

module.exports = { queryDB }