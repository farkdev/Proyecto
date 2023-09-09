const {Schema, model} = require('mongoose')

const mongoosePaginate = require('mongoose-paginate-v2')

const collection = 'usuarios'

const userSchema = new Schema({ 
    first_name: {
        type: String,
        index: true,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    date_of_birth: {
        type: Date,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'],
        default: 'user'
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        type: Schema.Types.ObjectId,
        ref: "carts"
    },
    documents: [{
        name: {
            type: String,
            required: true
        },
        reference: {
            type: String,
            required: true
        },
        _id: false
    }], 
    last_connection: {
        type: String
    },
    uploadedDocuments: {
        type: Boolean,
        default: false
    }
})





userSchema.plugin(mongoosePaginate)
const userModel = model(collection, userSchema)

module.exports = {
    userModel
}
