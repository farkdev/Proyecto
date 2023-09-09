const express = require('express')
const cookieParser = require('cookie-parser')
const products = require('./data.json')
const handlebars = require('express-handlebars')
const { Server } = require('socket.io')
const MongoStore = require('connect-mongo')
const session = require('express-session')
const {uploader} = require('./utils/multer')
const {socketProducts} = require ('./public/js/socketProducts')
const app = express()
const objectConfig  = require('./config/objectConfig')
const routerServer = require('../source/routes/index.router')
const { chatService, productService } = require('./service/index')
const cookie = require('./routes/prueba.router')

const { initPassportMid, initPassportGithub } = require('./config/passport.config')
const passport = require('passport')
const  {initPassport}  = require('../source/config/passportJWT')
const { errorHandler } = require('./middlewares/err.middleware')

const PORT =  process.env.PORT; 

const { addLoger, logger } = require('./config/logger')

const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')

const swaggerOpt = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentacion de Carts y Products',
            description: 'Docs de CRUD sobre products y carts del proyecto'
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJsDoc(swaggerOpt)
app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

app.use(addLoger)

//___________________________________________________________________________

const httpServer = app.listen(PORT, () => {
    logger.info(`Servidor funcionando en puerto: ${PORT}`)
})

const socketServer = new Server(httpServer)

//___________________________________________________________________________

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname+'/views')
app.set('view engine', 'handlebars')
app.use('/static' , express.static(__dirname+'/public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

objectConfig.connectDB()

initPassport()
// initPassportMid()
initPassportGithub()
passport.use(passport.initialize())
passport.use(passport.session())

//cookies
app.use('/prueba', (req, res)=>{
    res.render('prueba')
})
app.use(cookieParser('CoderS3CR3T0'))
// app.get('/cookie', (req, res) => {
//     const name = req.query.name;
//     const email = req.query.email;
//     const cookie = `name=${name}; email=${email}`;
//     res.cookie('myCookie', cookie);
//     res.json({ cookie });
// })

app.use(session({
	store: MongoStore.create({
		ttl: 100000 * 60,
		mongoUrl: 'mongodb+srv://farkdev:coderhouse@cluster0.p2tsobu.mongodb.net/?retryWrites=true&w=majority',
		mongoOptions: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}

	}),
	secret: 'secretCoder',
	resave: false,
	saveUninitialized: false
}))

app.use(cookie)
app.use(routerServer)
app.use(errorHandler)

app.post('/single', uploader.single('myfile'), (req, res)=>{
    res.status(200).send({
        status: 'success',
        message: 'se subió correctamente'
    })

})

socketProducts(socketServer)

//CHAT

app.get('/chat', (req, res)=>{
    res.render('chat', {})
})
socketServer.on('connection', socket => {
    console.log('Cliente conectado')
    socket.on('message', async(data) => {
		try{
			await chatService.saveMessages(data)
			const messages = await chatService.getMessages()
			socketServer.emit('messageLogs', messages)
		}catch(error){
			logger.error(error)
		}
    })

    socket.on('authenticated', data => {
        socket.broadcast.emit('newUserConnected', data)
    })
})

socketServer.on('connection', socket=>{
	logger.info("Cliente conectado")
	
	socket.on('deleteProduct', async (pid)=>{
		try{
			const isValidObjectId = ObjectId.isValid(pid.id)
			if (!isValidObjectId) {
			  return socket.emit('newList', {status: "error", message: `El ID del producto es inválido`})
			}
		  
			const product = await productService.getProductById(pid.id)
			if(product) {
			  await productService.deleteProduct(pid.id)
			  const data = await productService.getRealTimeProducts()
			  return socket.emit('newList', data)
			}
			return socket.emit('newList', {status: "error", message: `El producto con ID ${pid.id} no existe`})
		}catch(error){
			logger.error(error)
		}
	})

	socket.on('addProduct', async (data) => {
		try {
			const newProduct = await productService.createProduct(data);
			if(!newProduct){
				return new Error(err)
			}else{
				const newData = await productService.getRealTimeProducts()
				return socket.emit('productAdded', newData)
			}
		} catch (error) {
			return socket.emit('productAdded', { status: 'error', message: `El codigo: ${data.code} ya existe`})
		}
    })

})