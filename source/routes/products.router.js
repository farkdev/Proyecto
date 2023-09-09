const { Router } = require('express')
const ProductController = require('../controllers/product.controller');
const { passportCall } = require('../config/passportCall')
const { authorization } = require('../config/passportAuthorization')
const router = Router()

router.get('/mockinproducts', ProductController.generateProductsMock)

//trae productos
router.get('/', ProductController.getProducts);

//TRAE PRODUCTO POR ID
router.get('/:pid', ProductController.getProductById);

//CREA PRODUCTO
router.post('/', ProductController.createProduct);

//ACTUALIZA PRODUCTO
router.put('/:pid', passportCall('current', {session:false}), authorization('admin'), ProductController.updateProduct);

//ELIMINA PRODUCTO
router.delete('/:pid', passportCall('current', {session:false}), authorization('admin'), ProductController.deleteProduct);


// passportCall('current', {session:false}), authorization('admin')








//VIEJO MANEJO DE ARCHIVOS

// router.get('/', async (req, res) => {
// 	try{
//         const {limit= 2}= req.query
//         const{page=1} = req.query
//         const { sort } = req.query;
//         let sortOptions={}

//         if (sort === 'asc') {
//             sortOptions = { price: 1 };
//         } else if (sort === 'desc') {
//             sortOptions = { price: -1 };
//         }

//         let { 
//             docs, 
//             totalPages,
//             prevPage, 
//             nextPage,
//             hasPrevPage, 
//             hasNextPage 
//         } = await productModel.paginate({},{limit: limit , page: page, sort: sortOptions})

//         !hasPrevPage
//         ? prevLink = null
//         : prevLink =`/api/products?page=${prevPage}&limit=${limit}&sort=${sort}`

//         !hasNextPage 
//         ?nextLink = null
//         :nextLink =`/api/products?page=${nextPage}&limit=${limit}&sort=${sort}`

//         res.send({
//             status: 'success',
//             payload: docs,
//             totalPages,
//             prevPage,
//             nextPage,
//             page,
//             hasPrevPage,
//             hasNextPage,
//             prevLink,
//             nextLink
//         })
// 	} catch(err){
// 	    console.log(err)
// 	}
// });


// router.get('/:pid', async (req, res) => {
// 	try{
// 		const id = req.params.pid;
// 		const product = await PManager.getProductById(id);
//         Object.keys(product).length === 0
//         ?res.status(404).send({ error: 'No existe el producto' })
// 		:res.send(product); 
// 	} catch(err){
// 		console.log(err)
// 	}
// });


// router.post('/' , async (req, res)=>{
//     try{
//         const product = req.body
//         const newProduct = await PManager.addProduct(product)
//         Object.keys(newProduct).length === 0
//         ? res.status(400).send({ error: "No se pudo agregar el producto" })
//         : res.status(201).send({status:'producto agregado', payload: newProduct})
//     } catch(err){
//         console.log(err)
//     }
// });

// router.put('/:pid', async (req, res)=>{
//     try{
//         const id = req.params.pid;
//         const productModify= req.body
//         const modifiedProduct= await PManager.updateProduct(id, productModify)
//         Object.keys(modifiedProduct).length === 0
//         ? res.status(400).send({ error: 'No se ha podido modificar!' })
//         : res.status(200).send({ status: `el producto con ID ${id} se ha modificado con exito!`, payload: productModify })
//     }catch(err){
//         console.log(err)
//     }
// });


// router.delete('/:pid', async(req, res)=>{
//     try{
//         const id = req.params.pid;
//         const deletedProduct = await PManager.deleteProduct(id)
//         Object.keys(deletedProduct).length === 0
//         ? res.status(404).send({error: `El producto con ID ${id} no existe`})
//         : res.status(200).send({ status:`El producto con ID ${id} se ha eliminado`, payload: deletedProduct});
//     }catch(err){
//         console.log(err)
//     }
// });










module.exports = router
