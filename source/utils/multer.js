const multer = require('multer')
const {dirname} = require('path')
const fs = require('fs')


const storage = multer.diskStorage({
    destination: async function(req, file, cb) {
        let uploadFolder = ''
        const uploadType = req.body.uploadType
        const userId = req.params.uid

        if (uploadType === 'profile') {
            uploadFolder = 'profiles'
        } else if (uploadType === 'product') {
            uploadFolder = 'products'
        } else if (uploadType === 'document') {
            uploadFolder = 'documents'
        }

        const userFolder = `${__dirname}/../files/${uploadFolder}/${userId}`
        
        // Crear la carpeta del usuario si no existe
        if (!fs.existsSync(userFolder)) {fs.mkdirSync(userFolder)}

        cb(null, userFolder)
    },
    filename: function(req, file, cb) {
        cb(null, `${file.originalname}`)
    }
})

// const storage = multer.diskStorage({
//     destination: function(request, file, cb){
//         cb(null, `${dirname(__dirname)}/public/uploads`)
//     },
//     filename: function(request, file, cb){
//         console.log('file: ', file)
//         cb(null, `${Date.now()}-${file.originalname}`)
//     }
// })

const fileFilter = function(req, file, cb) {
    const validDocumentNames = [
        'Identificacion',
        'Comprobante de domicilio',
        'Comprobante de estado de cuenta'
    ]
    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf']

    const uploadType = req.body.uploadType
    if (uploadType === 'document') {
        const fileName = file.originalname.split('.') // Divide el nombre y la extensión
        const fileBaseName = fileName.slice(0, -1).join('.') // Obtiene el nombre sin la extensión
        const fileExtension = `.${fileName.pop()}` // Obtiene la extensión (incluye el punto)

        if (
            validDocumentNames.includes(fileBaseName) &&
            validExtensions.includes(fileExtension)
        ) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file name or extension for document upload'), false);
        }
    } else {
        cb(null, true)
    }
}
const uploader = multer({
    storage, 
    fileFilter,
    onError: function(err, next){
        console.log(err)
        next()
    }
})





module.exports = {uploader}
