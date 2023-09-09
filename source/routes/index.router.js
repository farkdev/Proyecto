const { Router } = require('express')
const router = Router()
const productsRouter = require('./products.router')
const cartRouter = require('./carts.router.js')
const viewsRouter = require('./views.router')
const prueba = require('./prueba.router')
const users = require('./user.router')
const { logger } = require('../config/logger')





router.use('/api/products', productsRouter)
router.use('/api/carts', cartRouter)
router.use('/api/session', users)
router.use('/', viewsRouter)
router.use('/realtimeproducts', viewsRouter)
router.use('/prueba', prueba)
router.get('/loggerTest', async (req, res)=>{
    // req.logger.fatal('Fatal')
    // req.logger.error('Error')
    //req.logger.warning('Warning')
    // req.logger.info('Info')
    // req.logger.http('http')
    //logger.debug('Debug')
    // req.logger.fatal('Fatal Error')
        
    res.send({message: 'Prueba de logger'})
})
module.exports = router