const dotenv = require('dotenv').config();

const mySqlConfig = {
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
}
const env = process.env.NODE_ENV || 'development';
if (env === 'test') {
    mySqlConfig.database = process.env.MYSQL_DB_TEST
    mySqlConfig.multipleStatements = true;
} else {
    mySqlConfig.database = process.env.MYSQL_DB
    mySqlConfig.multipleStatements = true;
}

module.exports = mySqlConfig 