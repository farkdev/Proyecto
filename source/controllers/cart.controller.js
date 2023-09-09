const { cartService, productService } = require("../service/index");
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../utils/nodemailer');
const { logger } = require("../config/logger");


class cartController {

    createCart = async(req, res)=>{
        try{
            const newCart = {products:[]}
            const result = await cartService.createCart(newCart)
            res.status(201).send({ status: 'success', payload: result})
        }catch(err){
            logger.error(err)
        } 
    }


    getCarts = async (req, res)=>{
        try{
            const carts = await cartService.getCarts()
            !carts
            ?res.status(500).send({status:'error', error: 'No hay carritos para mostrar'})
            :res.status(200).send({status:'success', payload: carts})
        } catch (error){
            logger.error(error)
        }
    }

    getCartById = async (req, res)=>{
        try{
            const cid = req.params.cid;
            const cart = await cartService.getCartById(cid);
            !cart
            ?res.status(404).send({status:'error', error: `El carrito con ID ${cid} no existe` })
            :res.status(200).send({status: 'success', payload: cart})
        } catch(err){
            logger.error(err)
        }
    }

    //AGREGA PRODUCTO AL CARRITO
    addToCart = async(req, res) =>{
        try{
            const cid = req.params.cid
            const pid = req.params.pid
            const { quantity }= req.body
            
            const addProduct= await cartService.addToCart(cid, pid, quantity)
            if( !addProduct ){
                res.status(400).send({message:'No se agrego el producto'})
            }
    
            res.status(201).send({message:'success', payload: addProduct})
        }catch(err){
            logger.error(err)
        }
    }
    //MODIFICA PRODUCTO DENTRO DEL CARRITO
    modifyProdFromCart = async(req, res) =>{
        try{
            const cid = req.params.cid
            const pid = req.params.pid
            const {quantity} = req.body
            console.log(quantity)
            const result = await cartService.modifyProdFromCart(cid, pid, quantity)
            !result
            ?res.status(400).send({status:'error', error:'No se pudo modificar producto del carrito'})
            :res.status(200).send({status:'success', payload: result});
        } catch(error) {
            logger.error(error)
        }
    }

    //MODIFICA CARRITO COMPLETO
    // modifyCart = async(req, res)=>{
    //     try{
    //         const cid = req.params.cid
    //         const newCart= req.body
    //         let respuesta= await cartService.modifyCart(cid, newCart)
    //         !respuesta
    //         ?res.status(400).send({status:'error', error:'No se pudo modificar el carrito'})
    //         :res.status(200).send({status: 'success', payload: respuesta})
    //     }catch(error){
    //         logger.error(error)
    //     }
    // }


    //ELIMINO 1 PRODUCTO DEL CARRITO
    removeProductFromCart = async(req, res)=>{
        try{
            const cid = req.params.cid
            const pid = req.params.pid
            let respuesta = await cartService.removeProductFromCart(cid, pid)
            !respuesta
            ?res.status(400).send({status:'error', error:'no se pudo eliminar producto del carrito'})
            :res.status(200).send({ status:'success', payload: respuesta})
        }catch(error){
            logger.error(error)
        }
    }
    
    //ELIMINO CARRITO
    cartDelete = async (req, res) =>{
        try {   
            const cid = req.params
            const result = await cartService.deleteCart({cid})
            !result
            ?res.status(400).send({status:'error', error:'no se pudo eliminar carrito'})
            :res.status(200).send({status: 'success', payload: result})
        } catch (error) {
            logger.error(error)
        }

    }

    purchaseCart = async (req, res) => {
        try {
            const cid = req.params.cid
            //busco carrito por ID
            const cart = await cartService.getCartById(cid)
            
            if(!cart){
                res.status(404).send({message: "No se encontro el carrito"})
            }
            const prodSinStock = [];
            
            //VERIFICO STOCK DEL PROD
            for (const item of cart.products) {
                const product = await productService.getProductById(item.product.pid)
                if (product && product.stock >= item.quantity){
                    cart.products.push({
                        product: product,
                        quantity: item.quantity,
                    })
                
                    product.stock -= item.quantity
                    await productService.updateProduct(item.product.pid, product)
                } else {
                    prodSinStock.push(item)
                } 
            }

            //actualizo carrito
            const purchasedProducts = cart.products.filter(item => !prodSinStock.some(p => p.product._id === item.product._id))
            if (purchasedProducts.length > 0){
                const ticket = {
                    code: uuidv4(),
                    purchase_datetime: new Date(),
                    amount: purchasedProducts.reduce((total, item) => total + (item.quantity * item.product.price), 0),
                    purchaser: req.user.email
                }
                //genero el ticket con datos de compra
                const newticket = await cartService.generateTicket(ticket)
                cart.products = prodSinStock
                await cartService.modifyProdFromCart(cid, prodSinStock)
                if(prodSinStock.length > 0){
                    await sendMail(ticket)
                    res.status(201).send({
                        message: "Compra realizada, hay algunos productos sin stock", 
                        ticket: newticket
                    })
                } else {
                    await sendMail(ticket)
                    res.status(201).send({message: "compra realizada correctamente", ticket: newticket})
                }
            } else {
                const prodSinStockID = prodSinStock.map(item=> item.product._id)
                res.status(200).send({message: "la compra no pudo realizarse", payload: prodSinStockID})
            }
            
        } catch (error){
            logger.error(error)
        }
    }


}




module.exports = new cartController()