const { productService } = require("../service/index");
const { ProductDto }  = require('../dto/product.dto')

const { Error } = require('../utils/CustomError/error');
const { CustomError } = require("../utils/CustomError/customError");
const { createProductErrorInfo } = require("../utils/CustomError/info");
const { productGenerator } = require("../utils/productMockGen");
const { logger } = require("../config/logger");
const { sendMailDeletedProduct } = require('../utils/nodemailer')


class ProductController {
    
    getProducts = async (req, res) => {
        try {
            const {limit= 5}= req.query
            const{page=1} = req.query
            const { sort } = req.query;
            
            const products = await productService.getProducts(limit, page, sort)
            !products
            ?res.status(500).send({status: 'error', error:'no hay productos para mostrar'})
            :res.status(200).send({status: 'success', payload: products})
        }catch(error){
            logger.error(error)
        }
        
    }


    // try {
    //     const {limit= 5}= req.query
    //     const{page=1} = req.query
    //     const { sort } = req.query;
    //     let user = req.user;
        
    //     const products = await productService.getProducts(limit, page, sort)
    //     res.render('home', {
    //         title: "Lista de Productos",
    //         payload: products,
    //         user
    //     });
    // } catch (err) {
    //     logger.error(error)
    // }
    getProductById = async(req, res) => {
        try{
            const id = req.params.pid;
            const product = await productService.getProductById(id);
            !product
            ?res.status(404).send({status:'error', error: 'No existe el producto' })
            :res.status(200).send({status: 'success', payload: product})
        } catch(err){
            logger.error(err)
        }
    }

    

    createProduct = async (req, res, next)=>{
        console.log("Prueba")
        try{
            const {title, description, price, code, stock, category, thumbnail} = req.body

            if(!title || !description || !price || !code || !stock || !category){
                CustomError.createError({
                    name: 'ERROR, PROD CREATION',
                    cause: createProductErrorInfo({
                        title, 
                        description, 
                        price, 
                        code, 
                        category,
                        stock, 
                    }),
                    message: 'Error creating product',
                    code: Error.INVALID_TYPE_ERROR
                })
            }
            console.log("arriba")
            
            // const newProduct = new productDto({title, description, price, code, stock, category, thumbnail})
            console.log("abajo")
            const product = await productService.createProduct(req.body)
            console.log("abajo 2")
            !product
            ? res.status(400).send({ error: "No se pudo crear el producto" })
            : res.status(201).send({status:'success', payload: product})
        } catch(err){
            next(err)
        }
    }


    updateProduct = async (req, res) =>{
        try {
            const id = req.params.pid;
            const productModify= req.body
            const modifiedProduct= await productService.updateProduct(id, productModify)
            Object.keys(modifiedProduct).length === 0
            ? res.status(400).send({ error: 'No se ha podido modificar!' })
            : res.status(200).send({ status: `el producto con ID ${id} se ha modificado con exito!`, payload: productModify })
        }catch(err){
            logger.error(err)
        }
    }
    
    deleteProduct = async(req, res)=>{
        try{
            const id = req.params.pid
            const user = req.user

            const product = await productService.getProductById(id)
            if (!product) return res.status(404).send({status:'error', error: `El producto con ID ${id} no existe` })
            
            if(user && (user.role === 'admin' || (user.role === 'premium' && product.owner === user.email))){
                if(product.owner !== 'admin'){
                    await sendMailDeletedProduct(product)
                }
                const deletedProduct = await productService.deleteProduct(id)
                if (deletedProduct) {
                    return res.status(200).send({ status:'success', payload: product });
                }
            }
            return res.status(401).send({status:'error', error: "No tienes permiso para eliminar este producto" })
        }catch(error){
            logger.error(error)
        }
    }
    
    generateProductsMock = async(req,res)=>{
        try {
            let products = []
            for (let i = 0; i < 50 ; i++) {
                products.push(productGenerator())  
            }
            res.status(200).send({status: 'success', payload: products})
        }catch(error){
            logger.error(error)
        }
    }
}



module.exports = new ProductController();


// getById(req, res) {
    //     const pid = req.params.pid;
    //     const { limit = 4 } = req.query;
    //     const { page = 1 } = req.query;
    //     const { sort } = req.query;
    //     let sortOptions = {};

    //     if (sort === 'asc') {
    //         sortOptions = { price: 1 };
    //     } else if (sort === 'desc') {
    //         sortOptions = { price: -1 };
    //     }

    //     productService.getProductById(pid, { limit, page, sortOptions })
    //         .then(result => {
    //             const { docs, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage } = result;
    //             const prevLink = hasPrevPage ? `/products/${pid}?page=${prevPage}&limit=${limit}&sort=${sort}` : null;
    //             const nextLink = hasNextPage ? `/products/${pid}?page=${nextPage}&limit=${limit}&sort=${sort}` : null;

    //             res.render('products', {
    //                 status: 'success',
    //                 payload: docs,
    //                 totalPages,
    //                 prevPage,
    //                 nextPage,
    //                 page,
    //                 hasPrevPage,
    //                 hasNextPage,
    //                 prevLink,
    //                 nextLink
    //             });
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             res.render('error', { status: 'error', error: 'Ocurrió un error en la página' });
    //         });
    // }