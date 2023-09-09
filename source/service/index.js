const { ProductDao, CartDao } = require("../dao/factory")
const ProductRepository = require("../repositories/product.repository");
const CartRepository = require("../repositories/cart.repository");


const userDaoMongo = require("../dao/mongo/user.mongo");
const ChatManagerMongo = require("../dao/mongo/chat.mongo");


// const cartService = new CartManagerMongo()
// const cartService = new cartMemory()





const cartService = new CartRepository(new CartDao())
const productService = new ProductRepository(new ProductDao())
const userService = new userDaoMongo()
const chatService = new ChatManagerMongo()

module.exports= {
    productService,
    cartService,
    userService,
    chatService
} 