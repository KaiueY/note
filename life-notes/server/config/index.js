require('dotenv').config()
const config = {
    database:{
        DATABASE:process.env.DATABASE,
        USERNAME:process.env.USERNAME,
        PASSWORD:process.env.PASSWORD,
        PORT:process.env.PORT,
        HOST:process.env.HOST
    }
}
module.exports = config