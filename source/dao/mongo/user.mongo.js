const { logger } = require("../../config/logger");
const { userModel } = require("./models/user.model");


class userDaoMongo {
    constructor() {
        this.userModel = userModel
    }


    

    async getUser(email){
        try{
            return await this.userModel.findOne(email)
        }catch(err){
            return new Error(err)
        }
    }  


    async create (newUser){
        try {
            return await this.userModel.create(newUser)
    } catch (error){
        return new Error (error)
    }
    }
    
    async getUserById(uid){
        try {
            return await this.userModel.findOne({_id: uid})
        } catch (error) {
            logger.error(error)
        }
    }

    async getAllUsers(){
        try{
            return await this.userModel.find({}).lean()
        }catch(err){
            logger.error(err)
        }
    }

    async updateUser(uid,updateData){
        try {
            return await this.userModel.updateOne({ _id: uid }, { $set: updateData })
        } catch (error) {
            logger.error(error)
        }
    }

    async deleteUser(uid){
        try{
            return await this.userModel.deleteOne({_id: uid});
        }catch(error){
            logger.error(error)
        }
    }

}

module.exports = userDaoMongo