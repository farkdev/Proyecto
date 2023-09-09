const { userService, cartService } = require("../service/index");
const { createHash, isValidPassword } = require("../utils/bcryptHash");
const { generateToken, generateResetToken, verifyResetToken } = require("../utils/jwt");
const { logger } = require("../config/logger");
const { sendResetPassMail, sendMailDeletedUser } = require("../utils/nodemailer");
const fs = require('fs')

class UserController {

    login = async (req, res) =>{
        try{
            let {email, password} = req.body
            if (!email || !password) {
                return res.status(400).send({ status: 'error', error: 'El email y contraseña son obligatorios' })
            }
        
            const userDB = await userService.getUser({email})
            if(!userDB) return res.status(404).send({status: 'error', error: 'usuario incorrecto'})
        
            if(!isValidPassword(password, userDB)) return res.status(401).send({status:'error', error:'contraseña incorrecta'})
            
            const currentDate = new Date()
            await userService.updateUser(userDB._id, {last_connection: currentDate})

            req.session.user ={
                first_name: userDB.first_name,
                last_name: userDB.last_name,
                email: userDB.email,
                date_of_birth: userDB.date_of_birth,
                cart: userDB.cart,
                role: userDB.role
            }
        
            const accessToken = generateToken({
                first_name: userDB.first_name,
                last_name: userDB.last_name,
                email: userDB.email,
                date_of_birth: userDB.date_of_birth,
                cart: userDB.cart,
                role: userDB.role
            })
        
            res.status(302).cookie('coderCookieToken', accessToken, {
                maxAge: 60*60*10000,
                httpOnly: true
            }).redirect('/')
        
        }catch(error){
            logger.error(error)
        }
        
    }

    // login = async (req, res) =>{
    //     try{
    //         let {email, password} = req.body
    //         if (!email || !password) {
    //             return res.status(400).send({ status: 'error', error: 'El email y la contraseña son obligatorios' });
    //         }
        
    //         const userDB = await userService.getUser({email})
    //         if(!userDB) return res.status(404).send({status: 'error', error: 'usuario incorrecto'})
        
    //         if(!isValidPassword(password, userDB)) return res.status(401).send({status:'error', error:'contraseña incorrecta'})
        
    //         req.session.user ={
    //             first_name: userDB.first_name,
    //             last_name: userDB.last_name,
    //             email: userDB.email,
    //             date_of_birth: userDB.date_of_birth,
    //             password: userDB.password,
    //             cart: userDB.cart,
    //             role: userDB.role   
    //         }
        
    //         const accessToken = generateToken({
    //             first_name: userDB.first_name,
    //             last_name: userDB.last_name,
    //             email: userDB.email,
    //             date_of_birth: userDB.date_of_birth,
    //             password: userDB.password,
    //             cart: userDB.cart,
    //             role: userDB.role
    //         })
        
    //         res.cookie('coderCookieToken', token, {
    //             maxAge: 60*60*100,
    //             httpOnly: true,
    //         })
    //         res.redirect('/')
        
    //     }catch(error){
    //         logger.error(error)
    //     }
        
    // }

    register = async (req, res) => {
        try {
            const { first_name, last_name, email, date_of_birth, password } = req.body;
            const existUser = await userService.getUser({ email });
    
            if (existUser) {
                return res.status(400).send({ status: 'error', error: "El email ya se encuentra registrado" });
            }
    
            const newCart = { products: [] };
            const cart = await cartService.createCart(newCart);
    
            let role = 'user';
            if (email === 'premium@premium.com') {
                role = "premium";
            }
    
            const newUser = {
                first_name,
                last_name,
                email,
                date_of_birth: new Date(date_of_birth).toLocaleDateString(),
                cart: cart._id,
                role: role,
                password: createHash(password),
                title: "Register"
            };
    
            const userDB = await userService.create(newUser);
    
            res.status(200).send({ status: 'success', payload: userDB });
    
        } catch (error) {
            logger.error(error);
            
        }
    };
    
    logout= async(req,res)=>{
        try {
            const userDB = await userService.getUser({ email: req.session.user.email })
            if (userDB) {
                const currentDate = new Date()
                await userService.updateUser(userDB._id, {last_connection: currentDate})
            }

            req.session.destroy(err=>{
                if(err){res.send({status: 'error', error: err})}
                res.clearCookie('coderCookieToken')
                res.redirect('login')
            })
        } catch (error) {
            logger.error(error)
        }
    }
    
    forgotPass = async (req, res) => {
        try {
            let {email} = req.body
            if (!email) return res.status(400).send({ status: 'error', message: 'Email es obligatorio' });
            
            const userDB = await userService.getUser({email})
            if(!userDB) return res.status(404).send({status: 'error', message: 'Usuario inexistente'})

            const resetToken = generateResetToken({userDB})
            const resetLink = `${req.protocol}://${req.get('host')}/api/session/resetPassword?token=${resetToken}`
            
            await sendResetPassMail(userDB, resetLink)
            res.send({status:'success', message: 'se envió link para restablecer tu password'})
        } catch (error) {
            logger.error(error)
        }
    }
    
    resetPass = async(req, res) => {
        try {
            const { password } = req.body
            const { token } = req.query
            const verifiedToken = verifyResetToken(token)
            if(!verifiedToken){
                return res.status(400).send({status:'error', message:'El enlace de recuperación de contraseña es inválido o ha expirado'})
            }

            const userDB = await userService.getUser({email: verifiedToken.userDB.email})
            if(!userDB) return res.status(404).send({status: 'error', message: 'Usuario inexistente'})
            
            if (isValidPassword(password, userDB)) {
                return res.status(400).send({ status:'error', message:'La contraseña debe ser distinta a la anterior'})
            }

            userDB.password = createHash(password);
            await userDB.save();

            res.send({ status:'success', message:'La contraseña ha sido reemplazada con exito, vuelve a iniciar sesion'});
        } catch (error) {
            logger.error(error)
        }
    }

    changeRole =  async(req, res) => {
        try {
            const userId = req.params.uid
            const userDB = await userService.getUserById(userId)
            if (!userDB) return res.status(404).send({ status: "error", error: "Usuario inexistente" })

            function userHasRequiredDocuments(user) {
                const requiredDocuments = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"]
            
                for (const requiredDocument of requiredDocuments) {
                    const matchingDocument = user.documents.find(doc => {
                        const docNameWithoutExtension = doc.name.split('.').slice(0, -1).join('.') // Obtiene el nombre sin extensión
                        return docNameWithoutExtension === requiredDocument
                    })
                        
                    if (!matchingDocument) {
                        return false
                    }
                }
            
                return true
            }

            if (userDB.role === "user") {
                if (!userDB.uploadedDocuments || !userHasRequiredDocuments(userDB)) {
                    return res.status(400).send({ status: "error", error: "El usuario debe cargar los documentos necesarios" });
                }
            }

            const newRole = userDB.role === "user" ? "premium" : "user";
            userDB.role = newRole
            await userDB.save()
    
            res.send({ status: "success", message: "Rol de usuario actualizado exitosamente", role: newRole })
        } catch (error) {
            logger.error(error)
        }
    }

    uploadDocuments =  async(req, res)=>{
        try {
            const userId = req.params.uid
            const userDB = await userService.getUserById(userId)
            if (!userDB) return res.status(404).send({ status: "error", error: "Usuario inexistente" })

            const newDocuments = req.files.map(file => ({
                name: file.filename,
                reference: file.destination
            }));
            userDB.documents.push(...newDocuments);

            await userService.updateUser(userDB._id, {documents: userDB.documents,uploadedDocuments: true })

            res.status(200).send({
                status: 'success',
                message: 'se subió correctamente'
            })
        } catch (error) {
            logger.error(error)
        }
    
    }

    
    getAllUsers = async(req, res) =>{
        try {            
            const allUsers = await userService.getAllUsers()
            if (!allUsers || allUsers.length === 0) {
                return res.status(500).send({ status: 'error', error: 'No hay usuarios para mostrar' });
            }

            const response = allUsers.map(user=> new UserDto(user))
            res.status(200).send({status: 'success', payload: response})
            
        } catch (error) {
            logger.error(error)
        }
    }


    deleteUsers = async(req, res) =>{
        try {
            const currentDate = new Date();
            const twoDaysAgo = new Date(currentDate - 3* 60  * 1000/* 2 * 24 * 60 * 60 * 1000 */)

            const allUsers = await userService.getAllUsers()
            
            const inactiveUsers = allUsers.filter(user => {
                const lastConnectionDate = new Date(user.last_connection)
                return lastConnectionDate <= twoDaysAgo
            })
            if (inactiveUsers.length === 0) {
                return res.status(200).send({ status: 'success', message: 'No hay usuarios inactivos para eliminar' });
            }

            for (const user of inactiveUsers) {
                if (!user.uploadedDocuments) {
                    const userId = user._id;
                    const uploadFolders = ['documents', 'products', 'profiles']
                    for (const folder of uploadFolders) {
                        const userFolderPath = `${__dirname}/../files/${folder}/${userId}`
                        if (fs.existsSync(userFolderPath)) {
                            const files = fs.readdirSync(userFolderPath)
                            for (const file of files) {
                                const filePath = `${userFolderPath}/${file}`
                                if (fs.statSync(filePath).isFile()) {
                                    fs.unlinkSync(filePath);
                                }
                            }
                            fs.rmdirSync(userFolderPath);
                        }
                    }
                }
                await sendMailDeletedUser(user)
                await userService.deleteUser(user._id);
            }
    
            res.status(200).send({ status: 'success', message: 'Usuarios inactivos eliminados exitosamente' });

        } catch (error) {
            logger.error(error)
        }
    }

    deleteUser = async(req, res) =>{
        try {
            const uid = req.params.uid
            const user = await userService.getUserById(uid);
            if (!user) {
                return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });
            }

            const uploadFolders = ['documents', 'products', 'profiles'];
            for (const folder of uploadFolders) {
                const userFolderPath = `${__dirname}/../files/${folder}/${uid}`;
                if (fs.existsSync(userFolderPath)) {
                    const files = fs.readdirSync(userFolderPath);
                    for (const file of files) {
                        const filePath = `${userFolderPath}/${file}`;
                        if (fs.statSync(filePath).isFile()) {
                            fs.unlinkSync(filePath);
                        }
                    }
                    fs.rmdirSync(userFolderPath);
                }
            }
            await userService.deleteUser(uid)
            res.status(200).send({ status: 'success', message: 'Usuario eliminado exitosamente' })
        } catch (error) {
            console.log(error)
        }
    }

}


module.exports= new UserController()