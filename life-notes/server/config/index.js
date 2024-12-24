require('dotenv').config();

const { DATABASE, USERNAME, PASSWORD, PORT, HOST } = process.env;

const config = {
    database: {
        DATABASE,
        USERNAME,
        PASSWORD,
        PORT,
        HOST
    }
};

module.exports = config;