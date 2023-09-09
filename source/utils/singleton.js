const {connect} = require('mongoose')




class MongoSingleton {
    static #instance
    constructor(){
        connect(process.env.MONGO_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    }
    static getInstance(){
        if (this.#instance){
            console.log('Conexión establecida')
            return this.#instance
        }
        this.#instance =  new MongoSingleton()
        console.log('Conexión a DB realizada')
        return this.#instance
    }
}

module.exports= {
    MongoSingleton
}