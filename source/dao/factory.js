const config = require('../config/objectConfig')
let ProductDao
let CartDao


switch (config.persistence) {
    case 'MONGO':
        config.connectDB()
        const ProductDaoMongo = require('../dao/mongo/product.mongo')
        const CartDaoMongo = require('../dao/mongo/cart.mongo')
        CartDao = CartDaoMongo
        ProductDao = ProductDaoMongo

        break;


    case 'FILE':
        const ProductFile = require('../dao/fileSys/ProductManager2')
        const CartFile = require('../dao/fileSys/cartManager')

        CartDao = CartFile
        ProductDao = ProductFile

        break; 

    default:
        break;
}



module.exports = {
    ProductDao,
    CartDao
}