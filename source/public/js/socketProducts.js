const ProdManager = require('../../dao/fileSys/ProductManager2')
const { productService } = require('../../service')
const PrManager = new ProdManager()


const socketProducts = async(io) =>{
    const products = productService.getProducts
    io.on('connection', socket =>{
        console.log('cliente conectado')
        socket.emit('productos', products)
        

        socket.emit('addProduct', data=>{
            console.log(data)
            PrManager.addProduct(data)
        })


    })
}

module.exports = {
    socketProducts
}