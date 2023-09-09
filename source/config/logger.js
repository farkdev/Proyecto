const winston = require('winston')
const objectConfig = require('./objectConfig')

const customLevelOpt = {
    levels:{
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        debug: 4,
        http: 5,
    },
    colors:{
        fatal: "red",
        error: "red",
        warning: "yellow",
        info: "blue",
        debug: "white",
        http: "green" 
    }
}



const loggerDEV = winston.createLogger({
    levels: customLevelOpt.levels,
    transports: [
        new winston.transports.Console({
            level: 'info', 
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOpt.colors}),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './errors.log', 
            level: 'warning',
            format: winston.format.simple()
        })
    ]
})

const loggerPROD = winston.createLogger({
    levels: customLevelOpt.levels,
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOpt.colors}),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: "./errors.log",
            level: 'error',
            format: winston.format.simple()
        })
    ]
})

let logger = objectConfig.mode === 'development' ? loggerDEV : loggerPROD;

const addLoger = (req, res, next) =>{
    req.logger = logger
    // req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`)
    req.logger.info(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`)
    next()
}

module.exports={
 addLoger,
 logger
}
