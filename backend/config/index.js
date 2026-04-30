require('dotenv').config();

const config = {
    port: process.env.PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_HOST: 'jpozogospw2026.zixkoko.mongodb.net'
}

module.exports = { config };
