const passport = require('passport')
const { Strategy, ExtractJwt} = require('passport-jwt')
const configServer = require('../config/objectConfig')

require('dotenv').config()
const JWTStrategy = Strategy
const ExtractJWT = ExtractJwt

const cookieExtractor = req =>{
    let token = null
    if (req && req.cookies){
        token = req.cookies['coderCookieToken']
    }
    return token
}

const configStrategy = {
    jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET_KEY
}

const initPassport= ()=>{
    passport.use('current', new JWTStrategy(configStrategy, async(jwt_payload, done)=>{
        try {
            return done(null, jwt_payload)
        } catch (error) {
            console.log(error)
        }
    }))
}


module.exports = {
    initPassport
}