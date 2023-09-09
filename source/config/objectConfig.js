const { MongoSingleton } = require('../utils/singleton')
const dotenv           = require('dotenv')

// const { mode }         = program.opts
const {commander} = require('../utils/process/commander')

const { mode } = commander.opts()

dotenv.config({
    path: mode === 'development' ? '.env.development' : '.env.production'
})






module.exports={
    port: process.env.PORT,
    persistence: process.env.PERSISTENCE,
    jwt_secret_key: process.env.JWT_SECRET_KEY,
    gmail_user_app:process.env.GMAIL_USER,
    gmail_pass_app:process.env.GMAIL_PASS,
    connectDB: async()=> await MongoSingleton.getInstance()
}