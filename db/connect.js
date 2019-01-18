const mysql = require('mysql');

const { user, password, host, multipleStatements } = require('../config');
const db = mysql.createConnection({ user, password, host, multipleStatements })
const queryDB = (query, obj = null, before = null) => {
    return new Promise((resolve, reject) => {
        // if (obj && /SELECT/.test(query) && Array.isArray(obj[0]) && obj[0].length > 1) { console.log(query, obj) };
        const makeQuery = (Obj) => db.query(query, Obj, (err, res) => {
            if (err) {
                reject(err)
            }
            resolve(res)
        })
        if (before) {
            before(...obj).then((newObj) => {
                return makeQuery([newObj])
            }).catch(e => reject(e))
        } else {
            makeQuery(obj)
        }
    })
}

module.exports = { queryDB }