const { Router } = require('express')
const { userModel } = require('../dao/mongo/models/user.model')
const { createHash, isValidPassword } = require('../utils/bcryptHash')
const passport = require('passport')
const router = Router()
const {passportCall} = require('../config/passportCall')
const {authorization} = require('../config/passportAuthorization')
const userController = require('../controllers/user.controller')

const { uploader } = require("../utils/multer")



router.post('/login', userController.login)

router.post('/register', userController.register)

router.get('/logout', userController.logout)

router.post('/forgotPassword', userController.forgotPass)

router.post('/resetPassword', userController.resetPass)

router.get('/premium/:uid', userController.changeRole)

router.get('/users', userController.getAllUsers)

router.post('/deleteUsers', passportCall('current', {session: false}), authorization(['admin']) , userController.deleteUsers)

router.delete('/:uid/deleteUser',passportCall('current', {session: false}), authorization(['admin']), userController.deleteUser)


router.post('/documents', uploader.array('uploads'), async(req, res)=>{
    try {
        res.status(200).send({
            status: 'success',
            message: 'se subió correctamente'
        })
    } catch (error) {
        console.log(error)
    }

})

router.get('/github', passport.authenticate('github', {scope:['user:email']}))
router.get('/githubcallback',passport.authenticate('github',{failureRedirect:'/login'}), async(req,res)=>{
    req.session.user=req.user
    res.redirect('/')
})



router.get('/current', passportCall('current', {session: false}),(req,res)=>{
    res.status(200).send({status: 'success', payload: req.user})
})




router.post('/recoverpass', async (req, res)=>{
    const {email, password} = req.body
    const userDB = await userModel.findOne({email})
    if(!userDB) {
        return status(401).send({status: error, message: "Usuario no existe"})
    }
    userDB.password = createHash(password)
    await userDB.save()
    res.status(200).send({status: "success", message: "Contraseña actualizada correctamente"})
})





router.get('/counter', (req,res)=>{
    if(req.session.counter){
        req.session.counter++
        res.send(`se ha visitado el sitio ${req.session.counter} veces`)
    }else{
        req.session.counter =1
        res.send('Bienvenido')
    }
})




module.exports = router