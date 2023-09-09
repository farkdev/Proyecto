const nodemailer = require('nodemailer')
const config     = require('../config/objectConfig')




const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.gmail_user_app,    
        pass: config.gmail_pass_app
    }
})


exports.sendMail = async (body)=>{
    return await transport.sendMail({
        from: 'COMPRA REALIZADA SATISFACTORIAMENTE<frojaskonrath@gmail.com>',
        to: 'frojaskonrath@gmail.com',
        subject: 'Gracias por elegirnos',
        html: `<div>
        <h1>Tu compra ha sido confirmada</h1>
        <p>Codigo: ${body.code} </p>
        <p>Total: ${body.amount}$ </p>
        </div>`
    })
}

exports.sendResetPassMail = async (user,resetLink)=>{
    return await transport.sendMail({
        from: 'RESET PASSWORD<frojaskonrath@gmail.com>',
        to: user.email,
        subject:'reset password',
        html:`<div>
        <h1>Hola ${user.first_name},</h1>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Para continuar con el proceso, haz clic en el siguiente enlace:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>El enlace expirará después de 1 hora.</p>
        </div>`
    })
}

exports.sendMailDeletedUser = async (user)=>{
    return await transport.sendMail({
        from: 'USUARIO ELMINADO POR INACTIVIDAD<frojaskonrath@gmail.com>',
        to: user.email ,
        subject:'Usuario eliminado por inactividad',
        html:`<div>
        <h1>Tu usuario ha sido eliminado debido al periodo de inactividad!</h1>
        <p>Estimado ${user.first_name} su cuenta ha sido eliminada debido al periodo de inactividad</p>
        </div>`
    })
}

exports.sendMailDeletedProduct = async (product, user)=>{
    return await transport.sendMail({
        from: 'PRODUCTO ELIMINADO<frojaskonrath@gmail.com>',
        to: 'frojaskonrath@gmail.com@gmail.com'/* product.owner */,
        subject:'se ha eliminado un producto',
        html:`<div>
        <h1>Se ha eliminado un producto de tu propiedad!</h1>
        <p>estimado ${product.owner} El producto "${product.title}" se ha elminado de la base de datos</p>
        </div>`
    })
}