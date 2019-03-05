require('dotenv').config();

const mySqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
}
const env = process.env.NODE_ENV || 'development';
if (env === 'test') {
    mySqlConfig.database = process.env.MYSQL_DB_TEST
    mySqlConfig.multipleStatements = true;
} else if (env === 'production') {
    mySqlConfig = {
        database: process.env.MYSQL_DB_PRODUCTION,
        host: process.env.MYSQL_HOST_PRODUCTION,
        user: process.env.MYSQL_USER_PRODUCTION,
        password: process.env.MYSQL_PW_PRODUCTION
    }
}
else {
    mySqlConfig.database = process.env.MYSQL_DB
    mySqlConfig.multipleStatements = true;
}

module.exports = mySqlConfig 