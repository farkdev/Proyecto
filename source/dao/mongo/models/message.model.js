const {Schema, model} = require('mongoose')



const colecction = 'messages'


const messagesSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)


const Message = model(colecction, messagesSchema)


module.exports = {
    Message
}